import test from 'node:test'
import assert from 'node:assert/strict'
import { COHORT_SIZE, leagues } from '../data/leagues.js'
import { rivals } from '../data/rivals.js'
import { getWeekStartFromIndex } from './week.js'
import {
  buildCohort,
  getBoardWindow,
  getPaceOutlook,
  getStandings,
  getWeekTargets,
  getZoneSummary,
  resolveWeek,
  rivalWeeklyXp,
  roundsFor,
  USER_ID,
} from './leagueSim.js'

const DAY_MS = 24 * 60 * 60 * 1000

// A fixed window so these rates are reproducible. Widen it and the numbers move
// slightly; the thresholds below have room for that.
const WINDOW_START = 100
const WINDOW_SIZE = 200

// The onboarding daily goal floor is 25 XP/day (dailyGoalXp in data/onboarding.js),
// so a learner who hits the smallest goal the app ever sets them, every single
// day, arrives at the boundary with this much.
const FLOOR_GOAL_WEEK = 175
// Roughly the same learner showing up three days in seven.
const HALF_EFFORT_WEEK = 105

// resolveWeek only settles a week that is already over, so score it from the
// following week.
function settle(leagueIndex, weeklyXp, weekIndex) {
  return resolveWeek(
    { weekIndex, leagueIndex, weeklyXp },
    getWeekStartFromIndex(weekIndex + 1) + DAY_MS,
  )
}

function outcomeRate(leagueIndex, weeklyXp, outcome) {
  let hits = 0
  for (let offset = 0; offset < WINDOW_SIZE; offset += 1) {
    if (settle(leagueIndex, weeklyXp, WINDOW_START + offset).outcome === outcome) hits += 1
  }
  return hits / WINDOW_SIZE
}

test('a cohort is drawn once per week and never re-rolled', () => {
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

test('rival XP only ever climbs as the week runs', () => {
  const rival = rivals[0]

  for (let step = 1; step <= 14; step += 1) {
    const earlier = rivalWeeklyXp(rival, 120, 0, (step - 1) / 14)
    const later = rivalWeeklyXp(rival, 120, 0, step / 14)
    assert.ok(later >= earlier, `XP fell between ${(step - 1) / 14} and ${step / 14}`)
  }

  assert.equal(rivalWeeklyXp(rival, 120, 0, 0), 0)
})

test('a harder league makes the same rival work harder', () => {
  const rival = rivals[0]
  const bronze = rivalWeeklyXp(rival, 120, 0, 1)
  const diamond = rivalWeeklyXp(rival, 120, leagues.length - 1, 1)

  assert.ok(diamond > bronze)
})

// The calibration lock. Bronze never demotes, so a learner who cannot clear this
// bar is stuck there permanently — which is exactly what happened before the
// pace rebalance, when this rate was 13%.
test('hitting the smallest daily goal all week gets you out of Bronze', () => {
  const rate = outcomeRate(0, FLOOR_GOAL_WEEK, 'promoted')
  assert.ok(rate >= 0.95, `Bronze promote rate at ${FLOOR_GOAL_WEEK} px is ${(rate * 100).toFixed(1)}%, expected >= 95%`)
})

test('half-hearted weeks still do not get you out of Bronze', () => {
  const rate = outcomeRate(0, HALF_EFFORT_WEEK, 'promoted')
  assert.ok(rate <= 0.35, `Bronze promote rate at ${HALF_EFFORT_WEEK} px is ${(rate * 100).toFixed(1)}%, expected <= 35%`)
})

test('effort pays off in every league', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length - 1; leagueIndex += 1) {
    let previous = -1
    for (const weeklyXp of [105, 175, 350, 525, 700, 1050, 1500]) {
      const rate = outcomeRate(leagueIndex, weeklyXp, 'promoted')
      assert.ok(
        rate >= previous - 0.05,
        `${leagues[leagueIndex].id} promote rate dipped at ${weeklyXp} px (${rate} after ${previous})`,
      )
      previous = Math.max(previous, rate)
    }
  }
})

test('a big enough week promotes out of anywhere below Diamond', () => {
  for (let leagueIndex = 0; leagueIndex < leagues.length - 1; leagueIndex += 1) {
    assert.equal(outcomeRate(leagueIndex, 4000, 'promoted'), 1, `${leagues[leagueIndex].id} refused a 4000 px week`)
  }
})

test('the ends of the ladder hold', () => {
  // Nothing below Bronze to fall to, nothing above Diamond to climb to.
  assert.equal(outcomeRate(0, 0, 'demoted'), 0)
  assert.equal(outcomeRate(leagues.length - 1, 100000, 'promoted'), 0)
})

test('a week that has not ended yet is not settled', () => {
  const weekIndex = 200
  assert.equal(resolveWeek({ weekIndex, leagueIndex: 0, weeklyXp: 500 }, getWeekStartFromIndex(weekIndex) + DAY_MS), null)
  assert.equal(resolveWeek({ weekIndex: null, leagueIndex: 0, weeklyXp: 500 }, Date.now()), null)
})

// The pay-to-win firewall: nothing about resolving a week may depend on
// whether the learner is paying. If this ever fails, entitlement logic has
// leaked into scoring.
test('premium status has zero effect on how a week resolves', () => {
  for (const [leagueIndex, weeklyXp] of [[0, 130], [1, 300], [3, 700]]) {
    const weekIndex = 200
    const timestamp = getWeekStartFromIndex(weekIndex + 1) + DAY_MS
    const free = resolveWeek({ weekIndex, leagueIndex, weeklyXp, isPremium: false }, timestamp)
    const premium = resolveWeek({ weekIndex, leagueIndex, weeklyXp, isPremium: true }, timestamp)

    assert.deepEqual(free, premium)
  }
})

test('settling reports the league it moved you to', () => {
  const promoted = settle(0, 4000, 150)
  assert.equal(promoted.outcome, 'promoted')
  assert.equal(promoted.nextLeagueIndex, 1)
  assert.equal(promoted.fromLeague, leagues[0].name)
  assert.equal(promoted.toLeague, leagues[1].name)
  assert.equal(promoted.score, 4000)

  const stayed = settle(0, 0, 150)
  assert.equal(stayed.outcome, 'stayed')
  assert.equal(stayed.nextLeagueIndex, 0)
})

// The cosmetic PRO tag on the user's own row (a Premium perk) must never touch
// scoring — this is the second half of the pay-to-win firewall.
test('a cosmetic tag on the user changes nothing about the standings', () => {
  const timestamp = getWeekStartFromIndex(200) + 4 * DAY_MS
  const plain = getStandings(200, 0, 300, timestamp)
  const tagged = getStandings(200, 0, 300, timestamp, { userTag: 'PRO' })

  assert.deepEqual(plain.map((entry) => ({ ...entry, tag: null })), tagged.map((entry) => ({ ...entry, tag: null })))

  const user = tagged.find((entry) => entry.isCurrentUser)
  assert.equal(user.tag, 'PRO')
  assert.equal(tagged.filter((entry) => entry.id !== USER_ID && entry.tag === 'PRO').length, plain.filter((entry) => entry.tag === 'PRO').length)
})

test('standings always include you, ranked among the full cohort', () => {
  const timestamp = getWeekStartFromIndex(200) + 3 * DAY_MS
  const standings = getStandings(200, 0, 400, timestamp)

  assert.equal(standings.length, COHORT_SIZE)
  assert.equal(standings.filter((entry) => entry.isCurrentUser).length, 1)
  assert.deepEqual(standings.map((entry) => entry.rank), Array.from({ length: COHORT_SIZE }, (_, i) => i + 1))

  for (let index = 1; index < standings.length; index += 1) {
    assert.ok(standings[index - 1].score >= standings[index].score, 'standings are not sorted by score')
  }
})

test('outscoring the field puts you first', () => {
  const timestamp = getWeekStartFromIndex(200) + 6 * DAY_MS
  const standings = getStandings(200, 0, 100000, timestamp)

  assert.equal(standings[0].id, USER_ID)
  assert.equal(getZoneSummary(standings, 0).user.rank, 1)
})

test('movement is blank on the first day, when there is no yesterday to measure', () => {
  const firstDay = getStandings(200, 0, 40, getWeekStartFromIndex(200) + 2 * 60 * 60 * 1000)
  assert.ok(firstDay.every((entry) => entry.delta === null), 'day-one movement must not be invented')

  const laterDay = getStandings(200, 0, 40, getWeekStartFromIndex(200) + 4 * DAY_MS)
  assert.ok(laterDay.every((entry) => Number.isInteger(entry.delta)), 'movement should be measurable by day four')
})

test('the windowed board keeps what matters and counts what it hides', () => {
  for (const leagueIndex of [0, 1, leagues.length - 1]) {
    for (const weeklyXp of [5, 300, 100000]) {
      const timestamp = getWeekStartFromIndex(200) + 4 * DAY_MS
      const standings = getStandings(200, leagueIndex, weeklyXp, timestamp)
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
  const timestamp = getWeekStartFromIndex(200) + 4 * DAY_MS
  const standings = getStandings(200, 2, 300, timestamp)
  const window = getBoardWindow(standings, getZoneSummary(standings, 2), { expanded: true })

  assert.equal(window.filter((item) => item.type === 'row').length, standings.length)
  assert.equal(window.filter((item) => item.type === 'gap').length, 0)
})

test('targets describe the field, not the learner', () => {
  const targets = getWeekTargets(200, 1)

  assert.equal(targets.finalRivalScores.length, COHORT_SIZE - 1, 'you are not one of your own rivals')
  assert.deepEqual(targets.finalRivalScores, [...targets.finalRivalScores].sort((a, b) => b - a))
  assert.equal(targets.topScore, targets.finalRivalScores[0])
  assert.ok(targets.promotionScore > targets.safetyScore, 'advancing must cost more than surviving')
})

// The number the UI puts in front of the learner has to be the number that
// actually settles the week. If these ever drift apart the board is lying.
test('the advertised promotion target is exactly what promotes you', () => {
  for (const leagueIndex of [0, 1, 2, 4]) {
    for (const weekIndex of [140, 175, 210, 245]) {
      const { promotionScore } = getWeekTargets(weekIndex, leagueIndex)

      assert.equal(
        settle(leagueIndex, promotionScore, weekIndex).outcome,
        'promoted',
        `${leagues[leagueIndex].id} week ${weekIndex}: ${promotionScore} px should promote`,
      )
      // Landing exactly level with the cutoff rival is settled by the hash
      // tie-break, so only a px below the tie is a guaranteed miss.
      assert.notEqual(
        settle(leagueIndex, promotionScore - 2, weekIndex).outcome,
        'promoted',
        `${leagues[leagueIndex].id} week ${weekIndex}: ${promotionScore - 2} px should not promote`,
      )
    }
  }
})

test('the advertised safety target is exactly what keeps you up', () => {
  for (const leagueIndex of [1, 3, leagues.length - 1]) {
    for (const weekIndex of [140, 210]) {
      const { safetyScore } = getWeekTargets(weekIndex, leagueIndex)

      assert.notEqual(settle(leagueIndex, safetyScore, weekIndex).outcome, 'demoted')
      assert.equal(settle(leagueIndex, safetyScore - 2, weekIndex).outcome, 'demoted')
    }
  }
})

// The failure this whole card exists to correct: on day one the live board reads
// far better than the week will finish.
test('the outlook sees the finishing rank the live board hides', () => {
  const weekIndex = 200
  const targets = getWeekTargets(weekIndex, 0)
  const dayOne = getWeekStartFromIndex(weekIndex) + 2 * 60 * 60 * 1000

  const liveRank = getZoneSummary(getStandings(weekIndex, 0, 75, dayOne), 0).user.rank
  const outlook = getPaceOutlook({ weeklyXp: 75, dailyGoal: 25, timestamp: dayOne, targets, leagueIndex: 0 })

  assert.equal(liveRank, 1, 'the live board should still flatter on day one')
  assert.ok(outlook.stopNowRank > 10, `stopping now should finish far down, got ${outlook.stopNowRank}`)
})

test('the outlook never asks for what is already banked', () => {
  const weekIndex = 200
  const targets = getWeekTargets(weekIndex, 0)
  const midweek = getWeekStartFromIndex(weekIndex) + 3 * DAY_MS

  const done = getPaceOutlook({ weeklyXp: targets.promotionScore, dailyGoal: 25, timestamp: midweek, targets, leagueIndex: 0 })
  assert.equal(done.verdict, 'safe')
  assert.equal(done.neededPerDay, 0)
  assert.equal(done.gap, 0)

  const short = getPaceOutlook({ weeklyXp: 0, dailyGoal: 25, timestamp: midweek, targets, leagueIndex: 0 })
  assert.ok(short.neededPerDay > 0)
  assert.equal(short.gap, targets.promotionScore)
})

test('the outlook stays sane at both ends of the week', () => {
  const weekIndex = 200
  const targets = getWeekTargets(weekIndex, 0)

  for (const hours of [1, 24, 80, 160, 167]) {
    const outlook = getPaceOutlook({
      weeklyXp: 120,
      dailyGoal: 25,
      timestamp: getWeekStartFromIndex(weekIndex) + hours * 60 * 60 * 1000,
      targets,
      leagueIndex: 0,
    })

    assert.ok(outlook.daysLeft >= 0 && outlook.daysLeft <= 6, `daysLeft out of range at ${hours}h`)
    assert.ok(outlook.daysElapsed >= 1 && outlook.daysElapsed <= 7)
    assert.equal(outlook.daysElapsed + outlook.daysLeft, 7)
    assert.ok(Number.isFinite(outlook.neededPerDay), `neededPerDay not finite at ${hours}h`)
    assert.ok(Number.isFinite(outlook.projectedScore))
  }
})

test('Diamond chases survival because it has nothing to climb to', () => {
  const leagueIndex = leagues.length - 1
  const weekIndex = 200
  const targets = getWeekTargets(weekIndex, leagueIndex)
  const outlook = getPaceOutlook({
    weeklyXp: 50,
    dailyGoal: 25,
    timestamp: getWeekStartFromIndex(weekIndex) + 3 * DAY_MS,
    targets,
    leagueIndex,
  })

  assert.equal(outlook.chasing, 'safety')
  assert.equal(outlook.target, targets.safetyScore)
})

test('an impossible week is called impossible rather than sold', () => {
  const weekIndex = 200
  const targets = getWeekTargets(weekIndex, 4)
  const lastDay = getWeekStartFromIndex(weekIndex) + 6.5 * DAY_MS

  const outlook = getPaceOutlook({ weeklyXp: 0, dailyGoal: 25, timestamp: lastDay, targets, leagueIndex: 4 })
  assert.equal(outlook.verdict, 'unreachable')
})

test('a px gap converts to whole practice rounds', () => {
  assert.equal(roundsFor(0), 1)
  assert.equal(roundsFor(10), 1)
  assert.equal(roundsFor(11), 2)
  assert.equal(roundsFor(25), 3)
})

test('the zone summary agrees with the league it describes', () => {
  const timestamp = getWeekStartFromIndex(200) + 6 * DAY_MS
  const top = getZoneSummary(getStandings(200, 1, 100000, timestamp), 1)

  assert.equal(top.inPromotion, true)
  assert.equal(top.inDemotion, false)
  assert.equal(top.gapToPromotion, 0)
  assert.equal(top.promotionLineIndex, leagues[1].promoteCount)

  const bottom = getZoneSummary(getStandings(200, 1, 0, timestamp), 1)
  assert.equal(bottom.inPromotion, false)
  assert.ok(bottom.gapToPromotion > 0, 'last place should have ground to make up')
})
