import test from 'node:test'
import assert from 'node:assert/strict'
import { applyActivity, getDailyXp } from './progress.js'

const TODAY = 'Fri Aug 07 2026'
const YESTERDAY = 'Thu Aug 06 2026'

const base = {
  xp: 100,
  weeklyXp: 35,
  dailyXp: 0,
  dailyXpDate: null,
  streakDays: 0,
  lastActiveDate: null,
}

test('earning XP moves lifetime, weekly and daily counters together', () => {
  const next = applyActivity(base, 25, TODAY)

  assert.equal(next.xp, 125)
  assert.equal(next.weeklyXp, 60)
  assert.equal(next.dailyXp, 25)
  assert.equal(next.dailyXpDate, TODAY)
})

test('a second activity on the same day accumulates', () => {
  const next = applyActivity(applyActivity(base, 25, TODAY), 10, TODAY)

  assert.equal(next.dailyXp, 35)
  assert.equal(next.xp, 135)
})

// The reset that makes the goal ring honest — without it, yesterday's XP would
// carry over and the ring would open the day already full.
test('the daily counter resets on a new day while lifetime XP does not', () => {
  const yesterday = applyActivity(base, 50, YESTERDAY)
  const today = applyActivity(yesterday, 25, TODAY)

  assert.equal(yesterday.dailyXp, 50)
  assert.equal(today.dailyXp, 25)
  assert.equal(today.dailyXpDate, TODAY)
  assert.equal(today.xp, 175)
  assert.equal(today.weeklyXp, 110)
})

test('the streak advances once per day, not once per activity', () => {
  const first = applyActivity(base, 25, TODAY)
  const second = applyActivity(first, 10, TODAY)

  assert.equal(first.streakDays, 1)
  assert.equal(second.streakDays, 1)
  assert.equal(applyActivity(second, 25, 'Sat Aug 08 2026').streakDays, 2)
})

test('reading today XP ignores a stale stamp', () => {
  assert.equal(getDailyXp({ dailyXp: 50, dailyXpDate: TODAY }, TODAY), 50)
  assert.equal(getDailyXp({ dailyXp: 50, dailyXpDate: YESTERDAY }, TODAY), 0)
  assert.equal(getDailyXp({ dailyXp: 0, dailyXpDate: null }, TODAY), 0)
})

test('unrelated fields survive untouched', () => {
  const next = applyActivity({ ...base, completedLessons: { a: 1 }, profile: { pathId: 'x' } }, 25, TODAY)

  assert.deepEqual(next.completedLessons, { a: 1 })
  assert.deepEqual(next.profile, { pathId: 'x' })
})
