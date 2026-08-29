import test from 'node:test'
import assert from 'node:assert/strict'
import { leagues } from '../data/leagues.js'
import { getPayoutForRank } from './rewardConfig.js'
import { getSeasonStartFromIndex } from './week.js'
import {
  buildCohort,
  eventsFor,
  getAllTimeStandings,
  getBoardWindow,
  getNextTarget,
  getPaceOutlook,
  getSeasonTargets,
  getStandings,
  getZoneSummary,
  resolveSeason,
  rivalSeasonCoins,
  USER_ID,
} from './leagueSim.js'

const DAY_MS = 24 * 60 * 60 * 1000

// resolveSeason only settles a season that is already over, so score it from
// the following season. Premium by default: most of what's tested here is
// the rank/score math itself (promotion and demotion cutoffs), which access
// gating deliberately sits on top of rather than inside — see
// leagueAccess.test.js for the gating rules themselves, and the dedicated
// tests below for how resolveSeason applies them.
function settle(leagueIndex, seasonDevyCoins, seasonIndex, extra = {}) {
  return resolveSeason(
    { seasonIndex, leagueIndex, seasonDevyCoins, isPremium: true, ...extra },
    getSeasonStartFromIndex(seasonIndex + 1) + DAY_MS,
  )
}

test('a cohort is drawn once per season and never re-rolled', () => {
  const first = buildCohort(12, 0)
  const again = buildCohort(12, 0)

  assert.equal(first.length, leagues[0].cohortSize - 1)
  assert.deepEqual(first.map((rival) => rival.id), again.map((rival) => rival.id))
  assert.notDeepEqual(first.map((rival) => rival.id), buildCohort(13, 0).map((rival) => rival.id))
})

test('a cohort never draws the same rival twice, even at Bronze scale', () => {
  const cohort = buildCohort(12, 0)
  assert.equal(new Set(cohort.map((rival) => rival.id)).size, cohort.length)
})

test('every league draws a cohort matching its configured size', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length; leagueIndex += 1) {
    assert.equal(buildCohort(12, leagueIndex).length, leagues[leagueIndex].cohortSize - 1)
  }
})

test('rival season coins only ever climb as the season runs', () => {
  const [rival] = buildCohort(12, 0)

  for (let step = 1; step <= 14; step += 1) {
    const earlier = rivalSeasonCoins(rival, 12, 0, (step - 1) / 14)
    const later = rivalSeasonCoins(rival, 12, 0, step / 14)
    assert.ok(later >= earlier, `coins fell between ${(step - 1) / 14} and ${step / 14}`)
  }

  assert.equal(rivalSeasonCoins(rival, 12, 0, 0), 0)
})

test('a harder league makes the same rival work harder', () => {
  const [rival] = buildCohort(12, 0)
  const bronze = rivalSeasonCoins(rival, 12, 0, 1)
  const diamond = rivalSeasonCoins(rival, 12, leagues.length - 1, 1)

  assert.ok(diamond > bronze)
})

test('a big enough season promotes out of anywhere below Diamond', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length - 1; leagueIndex += 1) {
    assert.equal(settle(leagueIndex, 500000, 150).outcome, 'promoted', `${leagues[leagueIndex].id} refused a 500,000-coin season`)
  }
})

test('the ends of the ladder hold', () => {
  // Nothing below Bronze to fall to (demoteCount 0), nothing above Diamond to
  // climb to (promoteCount 0) — even a runaway season can only ever "stay".
  assert.equal(settle(0, 0, 150).outcome, 'stayed')
  assert.equal(leagues[leagues.length - 1].promoteCount, 0)
  assert.equal(settle(leagues.length - 1, 500000, 150).outcome, 'stayed')
})

test('a season that has not ended yet is not settled', () => {
  const seasonIndex = 20
  assert.equal(resolveSeason({ seasonIndex, leagueIndex: 0, seasonDevyCoins: 500 }, getSeasonStartFromIndex(seasonIndex) + DAY_MS), null)
  assert.equal(resolveSeason({ seasonIndex: null, leagueIndex: 0, seasonDevyCoins: 500 }, Date.now()), null)
})

// The pay-to-win firewall: nothing about resolving a season may depend on
// whether the learner is paying. If this ever fails, entitlement logic has
// leaked into scoring.
// The pay-to-win firewall, narrowed to what it actually promises now that
// Silver+ requires Pro on purpose: rank, score and reward can never depend on
// payment — only *which league that rank lands you in* legitimately can.
test('premium status never changes rank, score or reward — only access to a gated league', () => {
  for (const [leagueIndex, coins] of [[0, 130], [1, 3000], [3, 7000]]) {
    const seasonIndex = 20
    const timestamp = getSeasonStartFromIndex(seasonIndex + 1) + DAY_MS
    const free = resolveSeason({ seasonIndex, leagueIndex, seasonDevyCoins: coins, isPremium: false }, timestamp)
    const premium = resolveSeason({ seasonIndex, leagueIndex, seasonDevyCoins: coins, isPremium: true }, timestamp)

    assert.equal(free.rank, premium.rank)
    assert.equal(free.score, premium.score)
    assert.equal(free.reward, premium.reward)
  }
})

test('a free learner promoted by rank into a Pro-gated league qualifies but is not seated there', () => {
  // Just inside the promotion zone (~rank 39), not the top-10 pass band —
  // this has to test the *blocked* path, not accidentally earn a free pass.
  const promotionScore = getSeasonTargets(15, 0).promotionScore
  const result = settle(0, promotionScore, 15, { isPremium: false, leaguePasses: [] })
  assert.equal(result.outcome, 'qualified')
  assert.equal(result.nextLeagueIndex, 0, 'stays in Bronze — qualifying is not entering')
  assert.equal(result.qualifiedLeagueIndex, 1)
  assert.equal(result.qualifiedLeague, leagues[1].name)
  assert.equal(result.accessVia, null)
})

test('a Pro learner promoted by rank into a Pro-gated league is seated there directly', () => {
  const promotionScore = getSeasonTargets(15, 0).promotionScore
  const result = settle(0, promotionScore, 15, { isPremium: true })
  assert.equal(result.outcome, 'promoted')
  assert.equal(result.nextLeagueIndex, 1)
  assert.equal(result.accessVia, 'pro')
})

test('a lapsed-Pro learner already in a gated league is dropped to Bronze at the next season, not silently kept', () => {
  // Rank alone says "stayed" in Silver — access disagrees.
  const result = resolveSeason(
    { seasonIndex: 20, leagueIndex: 1, seasonDevyCoins: 50, isPremium: false, leaguePasses: [] },
    getSeasonStartFromIndex(21) + DAY_MS,
  )
  assert.equal(result.outcome, 'demoted')
  assert.equal(result.nextLeagueIndex, 0)
  assert.equal(result.toLeague, leagues[0].name)
})

test('a top-10 Bronze finish grants a pass that seats the learner in Silver the very next season', () => {
  const targets = getSeasonTargets(20, 0)
  // Comfortably outscores everyone — guaranteed rank 1, well inside top 10.
  const topScore = targets.topScore + 1000
  const result = settle(0, topScore, 20, { isPremium: false, leaguePasses: [] })

  assert.equal(result.outcome, 'promoted')
  assert.equal(result.accessVia, 'pass')
  assert.equal(result.nextLeagueIndex, 1)
  assert.equal(result.leaguePasses.length, 1)
  assert.equal(result.leaguePasses[0].used, true)
  assert.equal(result.passJustGranted, true, 'this is the one season the fullscreen moment should fire for')
})

test('passJustGranted is false for a season that merely spends a pass earned earlier', () => {
  const existingPass = { leagueId: 'silver', grantedSeasonIndex: 19, usableSeasonIndex: 20, used: false }
  const result = settle(0, 947, 20, { isPremium: false, leaguePasses: [existingPass] })
  assert.equal(result.passJustGranted, false)
})

test('passJustGranted is false for an ordinary season with no top-10 finish', () => {
  const result = settle(0, 10, 20, { isPremium: false, leaguePasses: [] })
  assert.equal(result.passJustGranted, false)
})

test('a top-10 finish while already Premium still grants a pass, even though it goes unused', () => {
  const targets = getSeasonTargets(20, 0)
  const topScore = targets.topScore + 1000
  const result = settle(0, topScore, 20, { isPremium: true, leaguePasses: [] })

  assert.equal(result.accessVia, 'pro')
  assert.equal(result.passJustGranted, true)
  assert.equal(result.leaguePasses[0].used, false, 'saved for later, not burned when Pro already covers it')
})

test('highestQualifiedLeagueIndex records the achievement even when access is denied', () => {
  const result = settle(0, 500000, 15, { isPremium: false, highestQualifiedLeagueIndex: 0 })
  assert.equal(result.highestQualifiedLeagueIndex, 1)
})

test('settling reports the league it moved you to, and the reward it paid', () => {
  const promoted = settle(0, 500000, 15)
  assert.equal(promoted.outcome, 'promoted')
  assert.equal(promoted.nextLeagueIndex, 1)
  assert.equal(promoted.fromLeague, leagues[0].name)
  assert.equal(promoted.toLeague, leagues[1].name)
  assert.equal(promoted.score, 500000)
  assert.equal(promoted.reward, getPayoutForRank('bronze', 1))

  const stayed = settle(0, 0, 15)
  assert.equal(stayed.outcome, 'stayed')
  assert.equal(stayed.nextLeagueIndex, 0)
})

// The cosmetic PRO tag on the user's own row (a Premium perk) must never touch
// scoring — this is the second half of the pay-to-win firewall.
test('a cosmetic tag on the user changes nothing about the standings', () => {
  const timestamp = getSeasonStartFromIndex(20) + 4 * DAY_MS
  const plain = getStandings(20, 0, 300, timestamp)
  const tagged = getStandings(20, 0, 300, timestamp, { userTag: 'PRO' })

  assert.deepEqual(plain.map((entry) => ({ ...entry, tag: null })), tagged.map((entry) => ({ ...entry, tag: null })))

  const user = tagged.find((entry) => entry.isCurrentUser)
  assert.equal(user.tag, 'PRO')
})

test('standings always include you, ranked among the full cohort, with a reward attached', () => {
  const timestamp = getSeasonStartFromIndex(20) + 3 * DAY_MS
  const standings = getStandings(20, 0, 400, timestamp)

  assert.equal(standings.length, leagues[0].cohortSize)
  assert.equal(standings.filter((entry) => entry.isCurrentUser).length, 1)
  assert.deepEqual(standings.map((entry) => entry.rank), Array.from({ length: leagues[0].cohortSize }, (_, i) => i + 1))

  for (let index = 1; index < standings.length; index += 1) {
    assert.ok(standings[index - 1].score >= standings[index].score, 'standings are not sorted by score')
  }
  for (const entry of standings) {
    assert.equal(entry.reward, getPayoutForRank('bronze', entry.rank))
  }
})

test('outscoring the field puts you first, and earns the top reward', () => {
  const timestamp = getSeasonStartFromIndex(20) + 20 * DAY_MS
  const standings = getStandings(20, 0, 5000000, timestamp)

  assert.equal(standings[0].id, USER_ID)
  const summary = getZoneSummary(standings, 0)
  assert.equal(summary.user.rank, 1)
  assert.equal(summary.user.reward, getPayoutForRank('bronze', 1))
  assert.equal(summary.inRewardZone, true)
})

test('movement is blank on the first day, when there is no yesterday to measure', () => {
  const firstDay = getStandings(20, 0, 40, getSeasonStartFromIndex(20) + 2 * 60 * 60 * 1000)
  assert.ok(firstDay.every((entry) => entry.delta === null), 'day-one movement must not be invented')

  const laterDay = getStandings(20, 0, 40, getSeasonStartFromIndex(20) + 4 * DAY_MS)
  assert.ok(laterDay.every((entry) => Number.isInteger(entry.delta)), 'movement should be measurable by day four')
})

test('the windowed board keeps every zone line and counts what it hides', () => {
  for (const leagueIndex of [0, 1, leagues.length - 1]) {
    for (const coins of [5, 3000, 5000000]) {
      const timestamp = getSeasonStartFromIndex(20) + 4 * DAY_MS
      const standings = getStandings(20, leagueIndex, coins, timestamp)
      const summary = getZoneSummary(standings, leagueIndex)
      const window = getBoardWindow(standings, summary)

      const rows = window.filter((item) => item.type === 'row')
      const hidden = window.filter((item) => item.type === 'gap').reduce((total, item) => total + item.hiddenCount, 0)

      assert.equal(rows.length + hidden, standings.length, 'every learner is either shown or counted')
      assert.ok(rows.some((item) => item.entry.isCurrentUser), 'you are always on your own board')
      assert.ok(rows.length < standings.length, 'the window should actually collapse something')

      if (summary.promotionLineIndex >= 0) {
        assert.equal(window.filter((item) => item.type === 'promotion-line').length, 1)
      }
      if (summary.demotionLineIndex >= 0) {
        assert.equal(window.filter((item) => item.type === 'demotion-line').length, 1)
      }

      for (let index = 1; index < window.length; index += 1) {
        assert.ok(
          !(window[index].type === 'gap' && window[index - 1].type === 'gap'),
          'two gaps should have been merged',
        )
      }
    }
  }
})

test('expanding the window shows the whole cohort', () => {
  const timestamp = getSeasonStartFromIndex(20) + 4 * DAY_MS
  const standings = getStandings(20, 2, 3000, timestamp)
  const window = getBoardWindow(standings, getZoneSummary(standings, 2), { expanded: true })

  assert.equal(window.filter((item) => item.type === 'row').length, standings.length)
  assert.equal(window.filter((item) => item.type === 'gap').length, 0)
})

test('targets describe the field, not the learner', () => {
  const targets = getSeasonTargets(20, 1)

  assert.equal(targets.finalRivalScores.length, leagues[1].cohortSize - 1, 'you are not one of your own rivals')
  assert.deepEqual(targets.finalRivalScores, [...targets.finalRivalScores].sort((a, b) => b - a))
  assert.equal(targets.topScore, targets.finalRivalScores[0])
  assert.ok(targets.promotionScore > targets.safetyScore, 'advancing must cost more than surviving')
})

// The number the UI puts in front of the learner has to be the number that
// actually settles the season. If these ever drift apart the board is lying.
test('the advertised promotion target is exactly what promotes you', () => {
  for (const leagueIndex of [0, 1, 2]) {
    for (const seasonIndex of [30, 40]) {
      const { promotionScore } = getSeasonTargets(seasonIndex, leagueIndex)

      assert.equal(
        settle(leagueIndex, promotionScore, seasonIndex).outcome,
        'promoted',
        `${leagues[leagueIndex].id} season ${seasonIndex}: ${promotionScore} coins should promote`,
      )
      // Landing exactly level with the cutoff rival is settled by the hash
      // tie-break, so only a coin below the tie is a guaranteed miss.
      assert.notEqual(
        settle(leagueIndex, promotionScore - 2, seasonIndex).outcome,
        'promoted',
        `${leagues[leagueIndex].id} season ${seasonIndex}: ${promotionScore - 2} coins should not promote`,
      )
    }
  }
})

test('the advertised safety target is exactly what keeps you up', () => {
  for (const leagueIndex of [1, 3, leagues.length - 1]) {
    for (const seasonIndex of [30, 40]) {
      const { safetyScore } = getSeasonTargets(seasonIndex, leagueIndex)

      assert.notEqual(settle(leagueIndex, safetyScore, seasonIndex).outcome, 'demoted')
      assert.equal(settle(leagueIndex, safetyScore - 2, seasonIndex).outcome, 'demoted')
    }
  }
})

test('the outlook sees the finishing rank the live board hides', () => {
  const seasonIndex = 20
  const targets = getSeasonTargets(seasonIndex, 0)
  const dayOne = getSeasonStartFromIndex(seasonIndex) + 2 * 60 * 60 * 1000

  const liveRank = getZoneSummary(getStandings(seasonIndex, 0, 15, dayOne), 0).user.rank
  const outlook = getPaceOutlook({ seasonCoins: 15, dailyGoal: 3, timestamp: dayOne, targets, leagueIndex: 0 })

  assert.equal(liveRank, 1, 'the live board should still flatter on day one')
  assert.ok(outlook.stopNowRank > 10, `stopping now should finish far down, got ${outlook.stopNowRank}`)
})

test('the outlook never asks for what is already banked', () => {
  const seasonIndex = 20
  const targets = getSeasonTargets(seasonIndex, 0)
  const midSeason = getSeasonStartFromIndex(seasonIndex) + 14 * DAY_MS

  const done = getPaceOutlook({ seasonCoins: targets.promotionScore, dailyGoal: 3, timestamp: midSeason, targets, leagueIndex: 0 })
  assert.equal(done.verdict, 'safe')
  assert.equal(done.neededPerDay, 0)
  assert.equal(done.gap, 0)

  const short = getPaceOutlook({ seasonCoins: 0, dailyGoal: 3, timestamp: midSeason, targets, leagueIndex: 0 })
  assert.ok(short.neededPerDay > 0)
  assert.equal(short.gap, targets.promotionScore)
})

test('the outlook stays sane across the whole season', () => {
  const seasonIndex = 20
  const targets = getSeasonTargets(seasonIndex, 0)

  for (const hours of [1, 24, 200, 400, 665]) {
    const outlook = getPaceOutlook({
      seasonCoins: 120,
      dailyGoal: 3,
      timestamp: getSeasonStartFromIndex(seasonIndex) + hours * 60 * 60 * 1000,
      targets,
      leagueIndex: 0,
    })

    assert.ok(outlook.daysLeft >= 0 && outlook.daysLeft <= 27, `daysLeft out of range at ${hours}h`)
    assert.ok(outlook.daysElapsed >= 1 && outlook.daysElapsed <= 28)
    assert.equal(outlook.daysElapsed + outlook.daysLeft, 28)
    assert.ok(Number.isFinite(outlook.neededPerDay), `neededPerDay not finite at ${hours}h`)
    assert.ok(Number.isFinite(outlook.projectedScore))
  }
})

test('Diamond chases survival because it has nothing to climb to', () => {
  const leagueIndex = leagues.length - 1
  const seasonIndex = 20
  const targets = getSeasonTargets(seasonIndex, leagueIndex)
  const outlook = getPaceOutlook({
    seasonCoins: 50,
    dailyGoal: 3,
    timestamp: getSeasonStartFromIndex(seasonIndex) + 12 * DAY_MS,
    targets,
    leagueIndex,
  })

  assert.equal(outlook.chasing, 'safety')
  assert.equal(outlook.target, targets.safetyScore)
})

test('an impossible season is called impossible rather than sold', () => {
  const seasonIndex = 20
  const targets = getSeasonTargets(seasonIndex, 3)
  const lastDay = getSeasonStartFromIndex(seasonIndex) + 27.5 * DAY_MS

  const outlook = getPaceOutlook({ seasonCoins: 0, dailyGoal: 3, timestamp: lastDay, targets, leagueIndex: 3 })
  assert.equal(outlook.verdict, 'unreachable')
})

test('a coin gap converts to whole learning events', () => {
  assert.equal(eventsFor(0), 1)
  assert.equal(eventsFor(1), 1)
  assert.equal(eventsFor(2), 2)
  assert.equal(eventsFor(5), 5)
})

test('the zone summary agrees with the league it describes', () => {
  const timestamp = getSeasonStartFromIndex(20) + 20 * DAY_MS
  const top = getZoneSummary(getStandings(20, 1, 5000000, timestamp), 1)

  assert.equal(top.inPromotion, true)
  assert.equal(top.inDemotion, false)
  assert.equal(top.gapToPromotion, 0)
  assert.equal(top.promotionLineIndex, leagues[1].promoteCount)

  const bottom = getZoneSummary(getStandings(20, 1, 0, timestamp), 1)
  assert.equal(bottom.inPromotion, false)
  assert.ok(bottom.gapToPromotion > 0, 'last place should have ground to make up')
})

test('getNextTarget offers a reward band before a bare rank climb', () => {
  const timestamp = getSeasonStartFromIndex(20) + 20 * DAY_MS
  const standings = getStandings(20, 0, 0, timestamp)
  const target = getNextTarget(standings, 0)

  assert.ok(target)
  assert.ok(target.coinsNeeded > 0)
  assert.ok(['reward', 'rank'].includes(target.kind))
})

test('getNextTarget is null once you are first', () => {
  const timestamp = getSeasonStartFromIndex(20) + 20 * DAY_MS
  const standings = getStandings(20, 0, 5000000, timestamp)
  assert.equal(getNextTarget(standings, 0), null)
})

test('all-time standings rank real lifetime coins among invented rival totals', () => {
  const standings = getAllTimeStandings(50000)
  const user = standings.find((entry) => entry.isCurrentUser)
  assert.equal(user.score, 50000)
  assert.ok(standings.every((entry) => entry.rank >= 1))
})
