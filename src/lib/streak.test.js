import test from 'node:test'
import assert from 'node:assert/strict'
import { DAY_INITIALS, WEEK_LENGTH, getStreakMessage, getStreakWeek, isActiveToday } from './streak.js'

// A fixed Friday so the labels are predictable regardless of when tests run.
const FRIDAY = new Date(2026, 7, 7)

test('the strip covers a full seven days ending today', () => {
  const week = getStreakWeek(0, null, FRIDAY)

  assert.equal(WEEK_LENGTH, 7)
  assert.equal(week.length, 7)
  assert.deepEqual(week.map((day) => day.label), ['S', 'Su', 'M', 'T', 'W', 'Th', 'F'])
  assert.equal(week.at(-1).isToday, true)
  assert.equal(week.filter((day) => day.isToday).length, 1)
})

test('no streak leaves every day inactive', () => {
  assert.equal(getStreakWeek(0, null, FRIDAY).some((day) => day.isActive), false)
})

test('a streak marks exactly the days it covers, ending on the last active day', () => {
  const week = getStreakWeek(3, FRIDAY.toDateString(), FRIDAY)

  assert.deepEqual(week.map((day) => day.isActive), [false, false, false, false, true, true, true])
})

test('a streak that ended yesterday does not light up today', () => {
  const thursday = new Date(2026, 7, 6)
  const week = getStreakWeek(2, thursday.toDateString(), FRIDAY)

  assert.deepEqual(week.map((day) => day.isActive), [false, false, false, false, true, true, false])
  assert.equal(week.at(-1).isActive, false)
})

test('a streak longer than the window fills the whole strip', () => {
  assert.equal(getStreakWeek(30, FRIDAY.toDateString(), FRIDAY).every((day) => day.isActive), true)
})

test('every label is a real day initial and every key is unique', () => {
  const week = getStreakWeek(1, FRIDAY.toDateString(), FRIDAY)

  assert.equal(week.every((day) => DAY_INITIALS.includes(day.label)), true)
  assert.equal(new Set(week.map((day) => day.key)).size, 7)
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
