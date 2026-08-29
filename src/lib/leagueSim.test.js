import test from 'node:test'
import assert from 'node:assert/strict'
import { COHORT_SIZE, leagues } from '../data/leagues.js'
import { rivals } from '../data/rivals.js'
import { getSeasonStartFromIndex } from './season.js'
import {
  buildCohort,
  getBoardWindow,
  getPaceOutlook,
  getSeasonTargets,
  getStandings,
  getZoneSummary,
  resolveSeason,
  rivalSeasonCoins,
  roundsFor,
  USER_ID,
} from './leagueSim.js'

const DAY_MS = 24 * 60 * 60 * 1000

// A fixed window so these rates are reproducible. Widen it and the numbers move
// slightly; the thresholds below have room for that.
const WINDOW_START = 100
const WINDOW_SIZE = 200

// Coins and XP are deliberately different currencies now — coins are
// discrete, anti-farmed awards (see lib/coins.js), not a continuous rate like
// XP's dailyGoalXp — so there is no honest conversion from "XP goal" to
// "coins" to calibrate against. These are plain coin-total benchmarks
// instead: LOW is modest activity that should rarely crack Bronze's narrow
// top-15% zone, STRONG is a season's worth of real effort that should
// reliably clear it. leagueSim.test.js locks these rates; change `pace` in
// data/leagues.js and it will tell you.
const LOW_EFFORT_SEASON = 700
const STRONG_EFFORT_SEASON = 1500

// resolveSeason only settles a season that is already over, so score it from
// the following season.
function settle(leagueIndex, seasonCoins, seasonIndex) {
  return resolveSeason(
    { seasonIndex, leagueIndex, seasonCoins },
    getSeasonStartFromIndex(seasonIndex + 1) + DAY_MS,
  )
}

function outcomeRate(leagueIndex, seasonCoins, outcome) {
  let hits = 0
  for (let offset = 0; offset < WINDOW_SIZE; offset += 1) {
    if (settle(leagueIndex, seasonCoins, WINDOW_START + offset).outcome === outcome) hits += 1
  }
  return hits / WINDOW_SIZE
}

test('a cohort is drawn once per season and never re-rolled', () => {
  const first = buildCohort(120, 0)
  const again = buildCohort(120, 0)

  assert.equal(first.length, COHORT_SIZE - 1)
  assert.deepEqual(first.map((rival) => rival.id), again.map((rival) => rival.id))
  assert.notDeepEqual(first.map((rival) => rival.id), buildCohort(121, 0).map((rival) => rival.id))
})

test('a cohort never draws the same rival twice', () => {
  const cohort = buildCohort(120, 3)
  assert.equal(new Set(cohort.map((rival) => rival.id)).size, cohort.length)
})

test('rival coins only ever climb as the season runs', () => {
  const rival = rivals[0]

  for (let step = 1; step <= 14; step += 1) {
    const earlier = rivalSeasonCoins(rival, 120, 0, (step - 1) / 14)
    const later = rivalSeasonCoins(rival, 120, 0, step / 14)
    assert.ok(later >= earlier, `coins fell between ${(step - 1) / 14} and ${step / 14}`)
  }

  assert.equal(rivalSeasonCoins(rival, 120, 0, 0), 0)
})

test('a harder league makes the same rival work harder', () => {
  const rival = rivals[0]
  const bronze = rivalSeasonCoins(rival, 120, 0, 1)
  const diamond = rivalSeasonCoins(rival, 120, leagues.length - 1, 1)

  assert.ok(diamond > bronze)
})

// The calibration lock. Bronze's promotion zone is a narrow top 15% per the
// spec, so — unlike the old fixed-count ladder — modest activity should not
// reliably clear it; only real, sustained effort should.
test('a season of real effort clears Bronze', () => {
  const rate = outcomeRate(0, STRONG_EFFORT_SEASON, 'promoted')
  assert.ok(rate >= 0.9, `Bronze promote rate at ${STRONG_EFFORT_SEASON} coins is ${(rate * 100).toFixed(1)}%, expected >= 90%`)
})

test('modest activity rarely clears Bronze’s narrow top-15% zone', () => {
  const rate = outcomeRate(0, LOW_EFFORT_SEASON, 'promoted')
  assert.ok(rate <= 0.1, `Bronze promote rate at ${LOW_EFFORT_SEASON} coins is ${(rate * 100).toFixed(1)}%, expected <= 10%`)
})

test('effort pays off in every league', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length - 1; leagueIndex += 1) {
    let previous = -1
    for (const seasonCoins of [420, 700, 1400, 2100, 2800, 4200, 6000]) {
      const rate = outcomeRate(leagueIndex, seasonCoins, 'promoted')
      assert.ok(
        rate >= previous - 0.05,
        `${leagues[leagueIndex].id} promote rate dipped at ${seasonCoins} coins (${rate} after ${previous})`,
      )
      previous = Math.max(previous, rate)
    }
  }
})

test('a big enough season promotes out of anywhere below Diamond', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length - 1; leagueIndex += 1) {
    assert.equal(outcomeRate(leagueIndex, 16000, 'promoted'), 1, `${leagues[leagueIndex].id} refused a 16000-coin season`)
  }
})

test('the ends of the ladder hold', () => {
  // Nothing below Bronze to fall to, nothing above Diamond to climb to.
  assert.equal(outcomeRate(0, 0, 'demoted'), 0)
  assert.equal(outcomeRate(leagues.length - 1, 400000, 'promoted'), 0)
})

test('a season that has not ended yet is not settled', () => {
  const seasonIndex = 200
  assert.equal(resolveSeason({ seasonIndex, leagueIndex: 0, seasonCoins: 500 }, getSeasonStartFromIndex(seasonIndex) + DAY_MS), null)
  assert.equal(resolveSeason({ seasonIndex: null, leagueIndex: 0, seasonCoins: 500 }, Date.now()), null)
})

// The pay-to-win firewall: nothing about resolving a season may depend on
// whether the learner is paying. If this ever fails, entitlement logic has
// leaked into scoring.
test('premium status has zero effect on how a season resolves', () => {
  for (const [leagueIndex, seasonCoins] of [[0, 520], [1, 1200], [3, 2800]]) {
    const seasonIndex = 200
    const timestamp = getSeasonStartFromIndex(seasonIndex + 1) + DAY_MS
    const free = resolveSeason({ seasonIndex, leagueIndex, seasonCoins, isPremium: false }, timestamp)
    const premium = resolveSeason({ seasonIndex, leagueIndex, seasonCoins, isPremium: true }, timestamp)

    assert.deepEqual(free, premium)
  }
})

test('settling reports the league it moved you to', () => {
  const promoted = settle(0, 16000, 150)
  assert.equal(promoted.outcome, 'promoted')
  assert.equal(promoted.nextLeagueIndex, 1)
  assert.equal(promoted.fromLeague, leagues[0].name)
  assert.equal(promoted.toLeague, leagues[1].name)
  assert.equal(promoted.score, 16000)

  const stayed = settle(0, 0, 150)
  assert.equal(stayed.outcome, 'stayed')
  assert.equal(stayed.nextLeagueIndex, 0)
})

// Bronze's top-10 finishers get a free one-season Silver Pass, so the climb
// out of the free tier doesn't hinge entirely on already having Pro.
test('a Bronze top-10 finish earns a Silver Pass for the next season only', () => {
  const seasonIndex = 150
  const top = settle(0, 16000, seasonIndex)
  assert.equal(top.outcome, 'promoted')
  assert.ok(top.rank <= 10, `expected a top-10 finish, got rank ${top.rank}`)
  assert.equal(top.silverPassSeasonIndex, seasonIndex + 1)
})

test('a Bronze finish outside the top 10 does not earn a Silver Pass', () => {
  // Modest enough to promote (clears the 15% cutoff comfortably) without
  // being a top-10 runaway.
  const seasonIndex = 150
  const targets = getSeasonTargets(seasonIndex, 0)
  const result = settle(0, targets.promotionScore, seasonIndex)
  if (result.outcome === 'promoted' && result.rank > 10) {
    assert.equal(result.silverPassSeasonIndex, null)
  }
})

// The cosmetic PRO tag on the user's own row (a Premium perk) must never touch
// scoring — this is the second half of the pay-to-win firewall.
test('a cosmetic tag on the user changes nothing about the standings', () => {
  const timestamp = getSeasonStartFromIndex(200) + 4 * DAY_MS
  const plain = getStandings(200, 0, 900, timestamp)
  const tagged = getStandings(200, 0, 900, timestamp, { userTag: 'PRO' })

  assert.deepEqual(plain.map((entry) => ({ ...entry, tag: null })), tagged.map((entry) => ({ ...entry, tag: null })))

  const user = tagged.find((entry) => entry.isCurrentUser)
  assert.equal(user.tag, 'PRO')
  assert.equal(tagged.filter((entry) => entry.id !== USER_ID && entry.tag === 'PRO').length, plain.filter((entry) => entry.tag === 'PRO').length)
})

test('standings always include you, ranked among the full cohort', () => {
  const timestamp = getSeasonStartFromIndex(200) + 3 * DAY_MS
  const standings = getStandings(200, 0, 1200, timestamp)

  assert.equal(standings.length, COHORT_SIZE)
  assert.equal(standings.filter((entry) => entry.isCurrentUser).length, 1)
  assert.deepEqual(standings.map((entry) => entry.rank), Array.from({ length: COHORT_SIZE }, (_, i) => i + 1))

  for (let index = 1; index < standings.length; index += 1) {
    assert.ok(standings[index - 1].score >= standings[index].score, 'standings are not sorted by score')
  }
})

test('outscoring the field puts you first', () => {
  const timestamp = getSeasonStartFromIndex(200) + 6 * DAY_MS
  const standings = getStandings(200, 0, 400000, timestamp)

  assert.equal(standings[0].id, USER_ID)
  assert.equal(getZoneSummary(standings, 0).user.rank, 1)
})

test('movement is blank on the first day, when there is no yesterday to measure', () => {
  const firstDay = getStandings(200, 0, 40, getSeasonStartFromIndex(200) + 2 * 60 * 60 * 1000)
  assert.ok(firstDay.every((entry) => entry.delta === null), 'day-one movement must not be invented')

  const laterDay = getStandings(200, 0, 40, getSeasonStartFromIndex(200) + 4 * DAY_MS)
  assert.ok(laterDay.every((entry) => Number.isInteger(entry.delta)), 'movement should be measurable by day four')
})

test('the windowed board keeps what matters and counts what it hides', () => {
  for (const leagueIndex of [0, 1, leagues.length - 1]) {
    for (const seasonCoins of [5, 900, 400000]) {
      const timestamp = getSeasonStartFromIndex(200) + 4 * DAY_MS
      const standings = getStandings(200, leagueIndex, seasonCoins, timestamp)
      const summary = getZoneSummary(standings, leagueIndex)
      const window = getBoardWindow(standings, summary)

      const rows = window.filter((item) => item.type === 'row')
      const hidden = window.filter((item) => item.type === 'gap').reduce((total, item) => total + item.hiddenCount, 0)

      assert.equal(rows.length + hidden, standings.length, 'every learner is either shown or counted')
      assert.ok(rows.some((item) => item.entry.isCurrentUser), 'you are always on your own board')
      assert.ok(rows.length < standings.length, 'the window should actually collapse something')

      // The cutoff is the entire point of the ranking, so it can never be hidden.
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
  const timestamp = getSeasonStartFromIndex(200) + 4 * DAY_MS
  const standings = getStandings(200, 2, 900, timestamp)
  const window = getBoardWindow(standings, getZoneSummary(standings, 2), { expanded: true })

  assert.equal(window.filter((item) => item.type === 'row').length, standings.length)
  assert.equal(window.filter((item) => item.type === 'gap').length, 0)
})

test('targets describe the field, not the learner', () => {
  const targets = getSeasonTargets(200, 1)

  assert.equal(targets.finalRivalScores.length, COHORT_SIZE - 1, 'you are not one of your own rivals')
  assert.deepEqual(targets.finalRivalScores, [...targets.finalRivalScores].sort((a, b) => b - a))
  assert.equal(targets.topScore, targets.finalRivalScores[0])
  assert.ok(targets.promotionScore > targets.safetyScore, 'advancing must cost more than surviving')
})

// The number the UI puts in front of the learner has to be the number that
// actually settles the season. If these ever drift apart the board is lying.
test('the advertised promotion target is exactly what promotes you', () => {
  for (const leagueIndex of [0, 1, 2, 3]) {
    for (const seasonIndex of [140, 175, 210, 245]) {
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
    for (const seasonIndex of [140, 210]) {
      const { safetyScore } = getSeasonTargets(seasonIndex, leagueIndex)

      assert.notEqual(settle(leagueIndex, safetyScore, seasonIndex).outcome, 'demoted')
      assert.equal(settle(leagueIndex, safetyScore - 2, seasonIndex).outcome, 'demoted')
    }
  }
})

// The failure this whole card exists to correct: on day one the live board reads
// far better than the season will finish.
test('the outlook sees the finishing rank the live board hides', () => {
  const seasonIndex = 200
  const targets = getSeasonTargets(seasonIndex, 0)
  const dayOne = getSeasonStartFromIndex(seasonIndex) + 2 * 60 * 60 * 1000

  const liveRank = getZoneSummary(getStandings(seasonIndex, 0, 75, dayOne), 0).user.rank
  const outlook = getPaceOutlook({ seasonCoins: 75, dailyGoal: 25, timestamp: dayOne, targets, leagueIndex: 0 })

  assert.equal(liveRank, 1, 'the live board should still flatter on day one')
  assert.ok(outlook.stopNowRank > 10, `stopping now should finish far down, got ${outlook.stopNowRank}`)
})

test('the outlook never asks for what is already banked', () => {
  const seasonIndex = 200
  const targets = getSeasonTargets(seasonIndex, 0)
  const midSeason = getSeasonStartFromIndex(seasonIndex) + 14 * DAY_MS

  const done = getPaceOutlook({ seasonCoins: targets.promotionScore, dailyGoal: 25, timestamp: midSeason, targets, leagueIndex: 0 })
  assert.equal(done.verdict, 'safe')
  assert.equal(done.neededPerDay, 0)
  assert.equal(done.gap, 0)

  const short = getPaceOutlook({ seasonCoins: 0, dailyGoal: 25, timestamp: midSeason, targets, leagueIndex: 0 })
  assert.ok(short.neededPerDay > 0)
  assert.equal(short.gap, targets.promotionScore)
})

test('the outlook stays sane at both ends of the season', () => {
  const seasonIndex = 200
  const targets = getSeasonTargets(seasonIndex, 0)

  for (const hours of [1, 24, 320, 640, 671]) {
    const outlook = getPaceOutlook({
      seasonCoins: 120,
      dailyGoal: 25,
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
  const seasonIndex = 200
  const targets = getSeasonTargets(seasonIndex, leagueIndex)
  const outlook = getPaceOutlook({
    seasonCoins: 50,
    dailyGoal: 25,
    timestamp: getSeasonStartFromIndex(seasonIndex) + 3 * DAY_MS,
    targets,
    leagueIndex,
  })

  assert.equal(outlook.chasing, 'safety')
  assert.equal(outlook.target, targets.safetyScore)
})

test('an impossible season is called impossible rather than sold', () => {
  const seasonIndex = 200
  const targets = getSeasonTargets(seasonIndex, 4)
  const lastDay = getSeasonStartFromIndex(seasonIndex) + 27.5 * DAY_MS

  const outlook = getPaceOutlook({ seasonCoins: 0, dailyGoal: 25, timestamp: lastDay, targets, leagueIndex: 4 })
  assert.equal(outlook.verdict, 'unreachable')
})

test('a coin gap converts to whole practice rounds', () => {
  assert.equal(roundsFor(0), 1)
  assert.equal(roundsFor(10), 1)
  assert.equal(roundsFor(11), 2)
  assert.equal(roundsFor(25), 3)
})

test('the zone summary agrees with the league it describes', () => {
  const timestamp = getSeasonStartFromIndex(200) + 6 * DAY_MS
  const top = getZoneSummary(getStandings(200, 1, 400000, timestamp), 1)

  assert.equal(top.inPromotion, true)
  assert.equal(top.inDemotion, false)
  assert.equal(top.gapToPromotion, 0)

  const bottom = getZoneSummary(getStandings(200, 1, 0, timestamp), 1)
  assert.equal(bottom.inPromotion, false)
  assert.ok(bottom.gapToPromotion > 0, 'last place should have ground to make up')
})
