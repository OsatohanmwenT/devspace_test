import test from 'node:test'
import assert from 'node:assert/strict'
import { activatePremium, applyActivity, deactivatePremium, getDailyXp, markPageIntroductionSeen, migrateProgress } from './progress.js'

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

// A payload saved before isPremium existed has no such key at all — this is the
// migration path, and it has to produce `false`, not `undefined`.
test('a payload saved before Premium existed gets the free default', () => {
  const migrated = migrateProgress({ xp: 50, weekIndex: 12 }, 20)

  assert.equal(migrated.isPremium, false)
  assert.equal(migrated.xp, 50)
  assert.equal(migrated.weekIndex, 12)
})

test('a first-ever run adopts the current week', () => {
  assert.equal(migrateProgress({}, 20).weekIndex, 20)
  assert.equal(migrateProgress({ weekIndex: 5 }, 20).weekIndex, 5)
})

test('saved progress without page introductions migrates safely', () => {
  assert.deepEqual(migrateProgress({ weekIndex: 20 }, 20).seenPageIntroductions, {})
})

test('marking an introduction as seen preserves other page introductions', () => {
  const next = markPageIntroductionSeen({ ...base, seenPageIntroductions: { leaderboard: true } }, 'custom-path')

  assert.deepEqual(next.seenPageIntroductions, { leaderboard: true, 'custom-path': true })
})

test('activating premium sets the plan and starts tenure', () => {
  const next = activatePremium(base, 'annual', TODAY)

  assert.equal(next.isPremium, true)
  assert.equal(next.premiumPlanId, 'annual')
  assert.equal(next.premiumSince, TODAY)
  assert.equal(next.xp, base.xp, 'activating premium must not touch learning state')
})

test('re-activating does not reset when you started', () => {
  const first = activatePremium(base, 'monthly', YESTERDAY)
  const upgraded = activatePremium(first, 'annual', TODAY)

  assert.equal(upgraded.premiumPlanId, 'annual')
  assert.equal(upgraded.premiumSince, YESTERDAY, 'tenure should survive a plan change')
})

test('cancelling clears the plan but keeps tenure and all learning state', () => {
  const premium = activatePremium({ ...base, completedLessons: { a: 1 } }, 'annual', YESTERDAY)
  const cancelled = deactivatePremium(premium)

  assert.equal(cancelled.isPremium, false)
  assert.equal(cancelled.premiumPlanId, null)
  assert.equal(cancelled.premiumSince, YESTERDAY)
  assert.deepEqual(cancelled.completedLessons, { a: 1 })
})

// applyActivity spreads `...current` first, so this is really a regression
// lock against someone rewriting it to build the next object from scratch.
test('a free learner returning after a gap starts the streak over', () => {
  const stale = { ...base, streakDays: 6, lastActiveDate: 'Tue Aug 04 2026' }
  const next = applyActivity(stale, 10, TODAY)

  assert.equal(next.streakDays, 1, 'today counts, but the old run is gone')
})

test('a premium learner returning after one missed day keeps the streak', () => {
  // lastActiveDate is Wed; TODAY is Fri — Thursday was missed, a two-day gap
  // that would break a free streak outright.
  const stale = activatePremium({ ...base, streakDays: 6, lastActiveDate: 'Wed Aug 05 2026', weekIndex: 40 }, 'annual', 'Wed Aug 05 2026')
  const next = applyActivity(stale, 10, TODAY)

  assert.equal(next.streakDays, 7, 'the shield covers the gap, then today extends it')
  assert.equal(next.streakShieldWeek, 40, 'the shield should be marked spent for the current week')
})

test('a milestone grants its restore credits only once', () => {
  const nearMilestone = { ...base, streakDays: 6, lastActiveDate: YESTERDAY, earnedStreakMilestones: [3] }
  const earned = applyActivity(nearMilestone, 10, TODAY)
  const repeated = applyActivity(earned, 10, TODAY)

  assert.equal(earned.streakDays, 7)
  assert.equal(earned.streakRestoreCredits, 1)
  assert.deepEqual(earned.earnedStreakMilestones, [3, 7])
  assert.equal(repeated.streakRestoreCredits, 1)
})

// Jumping straight past several tiers (a restored streak, or seed data) has to
// bank every tier crossed, not just the highest one.
test('crossing several tiers at once banks all of their credits', () => {
  const leap = { ...base, streakDays: 13, lastActiveDate: YESTERDAY }
  const earned = applyActivity(leap, 10, TODAY)

  assert.equal(earned.streakDays, 14)
  assert.deepEqual(earned.earnedStreakMilestones, [3, 7, 14])
  assert.equal(earned.streakRestoreCredits, 3)
})

// Later tiers are worth more than one credit — a regression here would quietly
// flatten the ladder back to one-per-tier.
test('higher tiers grant more credits than early ones', () => {
  const nearMonth = { ...base, streakDays: 29, lastActiveDate: YESTERDAY, earnedStreakMilestones: [3, 7, 14] }
  const earned = applyActivity(nearMonth, 10, TODAY)

  assert.equal(earned.streakDays, 30)
  assert.equal(earned.streakRestoreCredits, 2)
})

test('a restore credit saves exactly one missed day for a free learner', () => {
  // Already holds the day-3 tier, as anyone on a 5-day streak would — otherwise
  // crossing it here would bank a fresh credit and mask the one being spent.
  const stale = { ...base, streakDays: 5, lastActiveDate: 'Wed Aug 05 2026', streakRestoreCredits: 1, weekIndex: 40, earnedStreakMilestones: [3] }
  const next = applyActivity(stale, 10, TODAY)

  assert.equal(next.streakDays, 6)
  assert.equal(next.streakRestoreCredits, 0)
  assert.equal(next.lastStreakProtection, 'restore')
})

test('activity dates are unique and retain only the latest 30 entries', () => {
  const dates = Array.from({ length: 30 }, (_, index) => new Date(2026, 6, index + 1).toDateString())
  const next = applyActivity({ ...base, streakActivityDates: dates }, 10, TODAY)
  const repeated = applyActivity(next, 10, TODAY)

  assert.equal(next.streakActivityDates.length, 30)
  assert.equal(next.streakActivityDates.includes(TODAY), true)
  assert.equal(repeated.streakActivityDates.length, 30)
})

test('earning XP does not disturb premium status', () => {
  const premium = activatePremium(base, 'annual', YESTERDAY)
  const next = applyActivity(premium, 25, TODAY)

  assert.equal(next.isPremium, true)
  assert.equal(next.premiumPlanId, 'annual')
})
