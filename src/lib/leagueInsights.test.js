import test from 'node:test'
import assert from 'node:assert/strict'
import { buildInsightsCsv, buildReminder, getLeagueInsights, getSeasonDay, getSeasonDayDate, pickStars } from './leagueInsights.js'
import { rivals } from '../data/rivals.js'
import { rivalDailyCoins, rivalSeasonCoins, USER_ID } from './leagueSim.js'
import { createPrivateLeague, getPrivateLeagueStandings, LEAGUE_KINDS } from './privateLeagues.js'
import { getSeasonStartFromIndex } from './season.js'
import { logSeasonCoins } from '../data/progress.js'

const DAY_MS = 24 * 60 * 60 * 1000
const SEASON = 34
const midSeason = getSeasonStartFromIndex(SEASON) + 10.5 * DAY_MS

function classLeague(options = {}) {
  const next = createPrivateLeague({ privateLeagues: {} }, 'Year 11 Coding Cup', '🏆', { id: 'class-1', code: 'ABC234', kind: 'class', ...options })
  return next.privateLeagues['class-1']
}

test('a rival season total is exactly the sum of their days', () => {
  for (const rival of rivals.slice(0, 10)) {
    for (const progress of [0, 0.3, 0.77, 1]) {
      const daily = rivalDailyCoins(rival, SEASON, 1, progress)
      assert.equal(daily.reduce((a, b) => a + b, 0), rivalSeasonCoins(rival, SEASON, 1, progress))
    }
  }
})

test('a class league starts with a real class-sized roster', () => {
  const league = classLeague()
  const [min, max] = LEAGUE_KINDS.class.starting
  assert.equal(league.kind, 'class')
  assert.ok(league.memberRivalIds.length >= min && league.memberRivalIds.length <= max)
})

test('an organizer-only league leaves the organizer off the board', () => {
  const league = classLeague({ organizerOnly: true })
  const standings = getPrivateLeagueStandings(league, 500, SEASON)
  assert.equal(standings.some((entry) => entry.id === USER_ID), false)

  const insights = getLeagueInsights(league, { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 500 } })
  assert.equal(insights.participants.some((entry) => entry.isCurrentUser), false)
})

test('only class leagues can be organizer-only', () => {
  const next = createPrivateLeague({ privateLeagues: {} }, 'Crew', '🚀', { id: 'f', code: 'ABC235', organizerOnly: true })
  assert.equal(next.privateLeagues.f.organizerOnly, false)
})

test('dashboard totals agree with the standings', () => {
  const league = classLeague()
  const progress = (midSeason - getSeasonStartFromIndex(SEASON)) / (28 * DAY_MS)
  const standings = getPrivateLeagueStandings(league, 7, SEASON, { seasonProgress: progress })
  const insights = getLeagueInsights(league, { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 7 } })

  for (const entry of standings) {
    const participant = insights.participants.find((row) => row.id === entry.id)
    assert.equal(participant.score, entry.score, entry.id)
    assert.equal(participant.rank, entry.rank, entry.id)
  }
  assert.equal(insights.kpis.totalCoins, standings.reduce((total, entry) => total + entry.score, 0))
})

test('days after today are marked future and hold no coins', () => {
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason })
  assert.equal(insights.today, 10)
  assert.ok(insights.dailyTotals.slice(11).every((day) => day.isFuture && day.coins === 0))
})

test('the learner’s own days come from the coin log', () => {
  const log = logSeasonCoins(logSeasonCoins(null, 4, midSeason), 3, midSeason - DAY_MS)
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 7, coinLog: log } })
  const you = insights.participants.find((row) => row.isCurrentUser)

  assert.equal(you.daily[10], 4)
  assert.equal(you.daily[9], 3)
  assert.equal(you.last7, 7)
  assert.equal(you.streak, 2)
  assert.equal(you.lastActive, 0)
})

test('someone who never earned a coin is flagged as not started', () => {
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 0 } })
  const you = insights.participants.find((row) => row.isCurrentUser)
  assert.equal(you.status.id, 'inactive')
  assert.ok(insights.needsAttention.some((row) => row.isCurrentUser))
})

test('the season day index is clamped to the season', () => {
  assert.equal(getSeasonDay(getSeasonStartFromIndex(SEASON) + 1000), 0)
  assert.equal(getSeasonDay(getSeasonStartFromIndex(SEASON + 1) - 1000), 27)
})

test('the CSV has one row per participant and quotes awkward names', () => {
  const league = { ...classLeague(), name: 'Cup, "Finals"' }
  const insights = getLeagueInsights(league, { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 2 } })
  const lines = buildInsightsCsv(league, insights).split('\n')

  assert.equal(lines.length, insights.participants.length + 2)
  assert.equal(lines[0], '"Cup, ""Finals"" — season standings"')
})

test('coins earned before the coin log still count as activity via activity dates', () => {
  const activityDates = [getSeasonDayDate(SEASON, 9).toDateString(), getSeasonDayDate(SEASON, 10).toDateString()]
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 13, activityDates } })
  const you = insights.participants.find((row) => row.isCurrentUser)

  assert.equal(you.activeDays, 2)
  assert.equal(you.lastActive, 0)
  assert.equal(you.streak, 2)
  assert.notEqual(you.status.id, 'inactive')
})

test('rank movement compares against a week ago, and is absent in week one', () => {
  const late = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason })
  assert.ok(late.participants.every((row) => Number.isInteger(row.rankChange)))
  assert.equal(late.participants.reduce((total, row) => total + row.rankChange, 0), 0)

  const early = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: getSeasonStartFromIndex(SEASON) + 3 * DAY_MS })
  assert.ok(early.participants.every((row) => row.rankChange === null))
})

test('each participant knows the gap to the person above', () => {
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason })
  const [first, second] = insights.participants
  assert.equal(first.gapAbove, null)
  assert.equal(second.gapAbove, first.score - second.score)
})

test('reminders name the gap, the leader, or that someone has not started', () => {
  const league = classLeague()
  const insights = getLeagueInsights(league, { seasonIndex: SEASON, timestamp: midSeason, user: { seasonCoins: 0 } })
  const [leader, second] = insights.participants
  const you = insights.participants.find((row) => row.isCurrentUser)

  assert.match(buildReminder(league, leader, insights), /you're leading/)
  assert.match(buildReminder(league, second, insights), new RegExp(`behind ${leader.name}`))
  assert.match(buildReminder(league, you, insights), /haven't earned a coin yet/)
  assert.match(buildReminder(league, second, insights), /17 days left/)
})

const person = (id, fields) => ({ id, name: id, rank: 1, score: 0, last7: 0, prev7: 0, weekDelta: 0, activeDays: 0, streak: 0, ...fields })

test('the rising star is the biggest real jump over last week', () => {
  const people = [
    person('small-bump', { rank: 1, last7: 20, prev7: 17, weekDelta: 3 }),
    person('doubled', { rank: 2, last7: 16, prev7: 8, weekDelta: 8 }),
    person('slipped', { rank: 3, last7: 2, prev7: 9, weekDelta: -7 }),
  ]
  const { rising } = pickStars(people, 13)
  assert.deepEqual(rising.map((entry) => entry.id), ['doubled'])
})

test('no rising star in the first week — there is no last week to beat', () => {
  const people = [person('a', { last7: 10, prev7: 0, weekDelta: 10 })]
  assert.deepEqual(pickStars(people, 5).rising, [])
})

test('the consistent star shows up most, not earns most', () => {
  const people = [
    person('big-spender', { rank: 1, score: 90, activeDays: 8 }),
    person('every-day', { rank: 4, score: 30, activeDays: 14, streak: 14 }),
    person('most-days', { rank: 2, score: 60, activeDays: 12, streak: 3 }),
  ]
  const { consistent } = pickStars(people, 13)
  assert.deepEqual(consistent.map((entry) => entry.id), ['every-day', 'most-days'])
})

test('nobody is consistent after only a few days', () => {
  const people = [person('a', { activeDays: 3, streak: 3 })]
  assert.deepEqual(pickStars(people, 2).consistent, [])
})

test('stars are marked on the participant rows', () => {
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason })
  for (const kind of ['rising', 'consistent']) {
    const star = insights.stars[kind][0]
    if (!star) continue
    assert.ok(insights.participants.find((row) => row.id === star.id).stars.includes(kind))
    assert.equal(insights.participants.filter((row) => row.stars.includes(kind)).length, 1)
  }
})

test('weekly breakdown adds up to the season and hides future days', () => {
  const insights = getLeagueInsights(classLeague(), { seasonIndex: SEASON, timestamp: midSeason })
  assert.equal(insights.currentWeek, 1)
  for (const row of insights.participants) {
    assert.equal(row.weeks.reduce((total, week) => total + week.coins, 0), row.score)
    assert.equal(row.weeks[1].days.filter((day) => day === null).length, 3)
    assert.ok(row.weeks[3].days.every((day) => day === null))
  }
})
