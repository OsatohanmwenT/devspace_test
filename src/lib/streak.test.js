import test from 'node:test'
import assert from 'node:assert/strict'
import { applyStreakDecay, DAY_INITIALS, WEEK_LENGTH, earnMilestones, getStreakHistory, getStreakMessage, getStreakWeek, isActiveToday, resolveStreak, STREAK_MILESTONES } from './streak.js'

// A fixed Friday so the labels are predictable regardless of when tests run.
const FRIDAY = new Date(2026, 7, 7)

test('the strip covers the whole window ending today', () => {
  const week = getStreakWeek(0, null, FRIDAY)

  assert.equal(WEEK_LENGTH, 5)
  assert.equal(week.length, 5)
  assert.deepEqual(week.map((day) => day.label), ['M', 'T', 'W', 'Th', 'F'])
  assert.equal(week.at(-1).isToday, true)
  assert.equal(week.filter((day) => day.isToday).length, 1)
})

test('no streak leaves every day inactive', () => {
  assert.equal(getStreakWeek(0, null, FRIDAY).some((day) => day.isActive), false)
})

test('a streak marks exactly the days it covers, ending on the last active day', () => {
  const week = getStreakWeek(3, FRIDAY.toDateString(), FRIDAY)

  assert.deepEqual(week.map((day) => day.isActive), [false, false, true, true, true])
})

test('a streak that ended yesterday does not light up today', () => {
  const thursday = new Date(2026, 7, 6)
  const week = getStreakWeek(2, thursday.toDateString(), FRIDAY)

  assert.deepEqual(week.map((day) => day.isActive), [false, false, true, true, false])
  assert.equal(week.at(-1).isActive, false)
})

test('a streak longer than the window fills the whole strip', () => {
  assert.equal(getStreakWeek(30, FRIDAY.toDateString(), FRIDAY).every((day) => day.isActive), true)
})

test('every label is a real day initial and every key is unique', () => {
  const week = getStreakWeek(1, FRIDAY.toDateString(), FRIDAY)

  assert.equal(week.every((day) => DAY_INITIALS.includes(day.label)), true)
  assert.equal(new Set(week.map((day) => day.key)).size, 5)
})

test('the streak message agrees with the count shown beside it', () => {
  assert.equal(getStreakMessage(0).text, 'Finish a lesson to start your streak')
  assert.equal(getStreakMessage(0).emphasis, null)

  const covered = getStreakMessage(1, true)
  assert.equal(covered.emphasis, '1')
  assert.match(covered.text, /covered for today/)

  assert.match(getStreakMessage(4, false).text, /keep your streak/)
})

test('activity today is read from the stored date string', () => {
  assert.equal(isActiveToday(FRIDAY.toDateString(), FRIDAY), true)
  assert.equal(isActiveToday(new Date(2026, 7, 6).toDateString(), FRIDAY), false)
  assert.equal(isActiveToday(null, FRIDAY), false)
})

const TODAY = new Date(2026, 7, 10).toDateString() // Mon
const YESTERDAY = new Date(2026, 7, 9).toDateString() // Sun
const TWO_DAYS_AGO = new Date(2026, 7, 8).toDateString() // Sat — exactly one missed day (Sun)
const THREE_DAYS_AGO = new Date(2026, 7, 7).toDateString() // Fri — more than a shield covers

test('a streak survives a day already counted or the day right before it', () => {
  assert.equal(resolveStreak(4, TODAY, TODAY), 4)
  assert.equal(resolveStreak(4, YESTERDAY, TODAY), 4)
})

test('a streak resets once more than a day has passed', () => {
  assert.equal(resolveStreak(4, THREE_DAYS_AGO, TODAY), 0)
})

test('there is nothing to resolve without a streak or a start date', () => {
  assert.equal(resolveStreak(0, YESTERDAY, TODAY), 0)
  assert.equal(resolveStreak(4, null, TODAY), 4)
})

test('a free learner loses the streak on a missed day', () => {
  const next = applyStreakDecay({ streakDays: 5, lastActiveDate: THREE_DAYS_AGO, streakShieldWeek: null, weekIndex: 40 }, TODAY, false)
  assert.equal(next.streakDays, 0)
  assert.equal(next.streakShieldWeek, null)
})

test('a premium learner spends a shield to survive exactly one missed day', () => {
  const next = applyStreakDecay({ streakDays: 5, lastActiveDate: TWO_DAYS_AGO, streakShieldWeek: null, weekIndex: 40 }, TODAY, true)
  assert.equal(next.streakDays, 5, 'the shield should have covered the gap')
  assert.equal(next.streakShieldWeek, 40, 'the shield should be marked spent for this week')
  assert.equal(next.protection, 'shield')
})

test('a shield already spent this week does not cover a second gap', () => {
  const next = applyStreakDecay({ streakDays: 5, lastActiveDate: TWO_DAYS_AGO, streakShieldWeek: 40, weekIndex: 40 }, TODAY, true)
  assert.equal(next.streakDays, 0, 'one shield should not cover two gaps in the same week')
})

test('an earned restore covers one missed day but not a longer gap', () => {
  const oneMissedDay = applyStreakDecay({ streakDays: 5, lastActiveDate: new Date(2026, 7, 8).toDateString(), streakShieldWeek: null, streakRestoreCredits: 1, weekIndex: 40 }, TODAY, false)
  const longerGap = applyStreakDecay({ streakDays: 5, lastActiveDate: THREE_DAYS_AGO, streakShieldWeek: null, streakRestoreCredits: 1, weekIndex: 40 }, TODAY, false)

  assert.equal(oneMissedDay.streakDays, 5)
  assert.equal(oneMissedDay.streakRestoreCredits, 0)
  assert.equal(oneMissedDay.protection, 'restore')
  assert.equal(longerGap.streakDays, 0)
  assert.equal(longerGap.streakRestoreCredits, 1)
})

test('the modal activity history covers 30 days and backfills the live streak', () => {
  const history = getStreakHistory(3, FRIDAY.toDateString(), [], FRIDAY)

  assert.equal(history.length, 30)
  assert.equal(history.slice(-3).every((day) => day.isActive), true)
  assert.equal(history.at(-1).isToday, true)
})

// The ladder should open with a reachable win rather than making a new learner
// wait a full week before anything happens.
test('the ladder rises and starts within the first few days', () => {
  const days = STREAK_MILESTONES.map((tier) => tier.days)

  assert.deepEqual([...days].sort((a, b) => a - b), days, 'tiers must be in ascending order')
  assert.equal(new Set(days).size, days.length, 'tiers must be unique')
  assert.ok(days[0] <= 3, 'the first tier should be an early win')
  assert.ok(STREAK_MILESTONES.every((tier) => tier.restores >= 1), 'every tier must be worth something')
  assert.ok(STREAK_MILESTONES.at(-1).restores > STREAK_MILESTONES[0].restores, 'later tiers should be worth more')
})

test('nothing is earned before the first tier', () => {
  assert.deepEqual(earnMilestones(0), { days: [], restores: 0 })
  assert.deepEqual(earnMilestones(2), { days: [], restores: 0 })
})

test('reaching a tier banks exactly that tier', () => {
  assert.deepEqual(earnMilestones(3), { days: [3], restores: 1 })
})

test('tiers already banked are never granted twice', () => {
  assert.deepEqual(earnMilestones(7, [3, 7]), { days: [], restores: 0 })
  assert.deepEqual(earnMilestones(7, [3]), { days: [7], restores: 1 })
})

test('a leap past several tiers banks each one it passed', () => {
  const { days, restores } = earnMilestones(30)

  assert.deepEqual(days, [3, 7, 14, 30])
  assert.equal(restores, 5, '1 + 1 + 1 + 2')
})

test('a gap that does not break the streak spends nothing', () => {
  const next = applyStreakDecay({ streakDays: 5, lastActiveDate: YESTERDAY, streakShieldWeek: null, weekIndex: 40 }, TODAY, true)
  assert.equal(next.streakDays, 5)
  assert.equal(next.streakShieldWeek, null, 'a shield should not be spent when nothing needed saving')
})
