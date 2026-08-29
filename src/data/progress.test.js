import test from 'node:test'
import assert from 'node:assert/strict'
import { activatePremium, addCoins, applyActivity, deactivatePremium, getDailyXp, getPracticeXpAward, markPageIntroductionSeen, migrateProgress, PRACTICE_XP, recordConceptMastery, setAvatarChoice, setPayoutMethod } from './progress.js'

const TODAY = 'Fri Aug 07 2026'
const YESTERDAY = 'Thu Aug 06 2026'

const base = {
  xp: 100,
  dailyXp: 0,
  dailyXpDate: null,
  streakDays: 0,
  lastActiveDate: null,
}

test('earning XP moves lifetime and daily counters together', () => {
  const next = applyActivity(base, 25, TODAY)

  assert.equal(next.xp, 125)
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
  const migrated = migrateProgress({ xp: 50, weekIndex: 12 }, 20, 3)

  assert.equal(migrated.isPremium, false)
  assert.equal(migrated.xp, 50)
  assert.equal(migrated.weekIndex, 12)
})

test('a first-ever run adopts the current week and season', () => {
  assert.equal(migrateProgress({}, 20, 3).weekIndex, 20)
  assert.equal(migrateProgress({ weekIndex: 5 }, 20, 3).weekIndex, 5)
  assert.equal(migrateProgress({}, 20, 3).seasonIndex, 3)
  assert.equal(migrateProgress({ seasonIndex: 1 }, 20, 3).seasonIndex, 1)
})

test('saved progress without page introductions migrates safely', () => {
  assert.deepEqual(migrateProgress({ weekIndex: 20 }, 20, 3).seenPageIntroductions, {})
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

// The practice results screen states the award before it is banked, so the two
// have to agree — these pin the rule they now share.
test('a session never completed before pays the full practice rate', () => {
  assert.equal(getPracticeXpAward({ completedSessions: {} }, 'python-basics', TODAY), PRACTICE_XP)
})

test('a free learner replaying an already-completed session earns nothing', () => {
  const progress = { isPremium: false, completedSessions: { 'python-basics': { completedAt: YESTERDAY } } }

  assert.equal(getPracticeXpAward(progress, 'python-basics', TODAY), 0)
})

test('a premium learner earns again on a replay, but only on a new day', () => {
  const completedYesterday = { isPremium: true, completedSessions: { 'python-basics': { completedAt: YESTERDAY } } }
  const completedToday = { isPremium: true, completedSessions: { 'python-basics': { completedAt: TODAY } } }

  assert.equal(getPracticeXpAward(completedYesterday, 'python-basics', TODAY), PRACTICE_XP)
  assert.equal(getPracticeXpAward(completedToday, 'python-basics', TODAY), 0)
})

test('completing one session says nothing about another', () => {
  const progress = { isPremium: false, completedSessions: { 'python-basics': { completedAt: TODAY } } }

  assert.equal(getPracticeXpAward(progress, 'sql-select', TODAY), PRACTICE_XP)
})

test('saved progress without concept mastery migrates to an empty map', () => {
  assert.deepEqual(migrateProgress({ weekIndex: 20 }, 20, 3).masteryByConcept, {})
})

test('recording a concept outcome creates a fresh record on first write', () => {
  const next = recordConceptMastery({ ...base, masteryByConcept: {} }, 'writing-programs', 'program-execution', { correct: true, firstTryCorrect: true }, TODAY)

  const record = next.masteryByConcept['writing-programs:program-execution']
  assert.ok(record)
  assert.equal(record.attemptsTotal, 1)
  assert.equal(record.lastOutcomeCorrect, true)
})

test('recording a second concept leaves the first one untouched', () => {
  const first = recordConceptMastery({ ...base, masteryByConcept: {} }, 'writing-programs', 'program-execution', { correct: true, firstTryCorrect: true }, TODAY)
  const both = recordConceptMastery(first, 'writing-programs', 'variables-expressions', { correct: false, firstTryCorrect: false }, TODAY)

  assert.ok(both.masteryByConcept['writing-programs:program-execution'])
  assert.ok(both.masteryByConcept['writing-programs:variables-expressions'])
  assert.equal(both.masteryByConcept['writing-programs:program-execution'].attemptsTotal, 1)
})

test('recording concept mastery does not touch XP or streak', () => {
  const next = recordConceptMastery({ ...base, masteryByConcept: {} }, 'writing-programs', 'program-execution', { correct: true, firstTryCorrect: true }, TODAY)

  assert.equal(next.xp, base.xp)
  assert.equal(next.streakDays, base.streakDays)
  assert.equal(next.dailyXp, base.dailyXp)
})

test('saved progress without a coin balance migrates to zero', () => {
  const migrated = migrateProgress({ weekIndex: 20 }, 20, 3)
  assert.equal(migrated.devyCoins, 0)
  assert.equal(migrated.seasonDevyCoins, 0)
})

test('a first-ever run adopts the current season', () => {
  assert.equal(migrateProgress({}, 20, 3).seasonIndex, 3)
})

test('addCoins accumulates onto both the lifetime and season balances', () => {
  const next = addCoins(addCoins({ ...base, devyCoins: 0, seasonDevyCoins: 0 }, 5), 1)
  assert.equal(next.devyCoins, 6)
  assert.equal(next.seasonDevyCoins, 6)
})

test('addCoins ignores a non-positive amount', () => {
  const progress = { ...base, devyCoins: 3, seasonDevyCoins: 3 }
  assert.equal(addCoins(progress, 0).devyCoins, 3)
  assert.equal(addCoins(progress, -5).devyCoins, 3)
  assert.equal(addCoins(progress, 0).seasonDevyCoins, 3)
})

test('addCoins does not touch XP or streak', () => {
  const next = addCoins(base, 10)
  assert.equal(next.xp, base.xp)
  assert.equal(next.streakDays, base.streakDays)
})

// A season resets on its own 28-day clock, but a lifetime total never should
// — this is the distinction the whole "lifetime vs season" split exists for.
test('lifetime coins and season coins move together but mean different things', () => {
  const seasonReset = { ...base, devyCoins: 50, seasonDevyCoins: 0 }
  const next = addCoins(seasonReset, 10)
  assert.equal(next.devyCoins, 60, 'lifetime keeps accumulating across seasons')
  assert.equal(next.seasonDevyCoins, 10, 'season total reflects only this season so far')
})

test('saved progress without reward fields migrates to safe defaults', () => {
  const migrated = migrateProgress({ weekIndex: 20 }, 20, 3)
  assert.equal(migrated.rewardBalance, 0)
  assert.equal(migrated.lifetimeRewards, 0)
  assert.deepEqual(migrated.rewardHistory, [])
  assert.deepEqual(migrated.paidPayouts, [])
  assert.equal(migrated.pendingPayout, null)
  assert.equal(migrated.payoutMethod, null)
})

test('setPayoutMethod stores what was typed and marks it verified', () => {
  const next = setPayoutMethod(base, { bank: 'GTBank', accountNumber: '0123456789', accountName: 'Ada Lovelace' })
  assert.deepEqual(next.payoutMethod, { bank: 'GTBank', accountNumber: '0123456789', accountName: 'Ada Lovelace', verified: true })
})

test('setPayoutMethod replaces a prior method rather than merging it', () => {
  const withOld = { ...base, payoutMethod: { bank: 'Old Bank', accountNumber: '000', accountName: 'X', verified: true } }
  const next = setPayoutMethod(withOld, { bank: 'GTBank', accountNumber: '0123456789', accountName: 'Ada Lovelace' })
  assert.equal(next.payoutMethod.bank, 'GTBank')
})

test('saved progress without league-access fields migrates to safe defaults', () => {
  const migrated = migrateProgress({ weekIndex: 20, leagueIndex: 2 }, 20, 3)
  assert.equal(migrated.highestQualifiedLeagueIndex, 2, 'a payload from before this existed assumes at least its current league')
  assert.deepEqual(migrated.leaguePasses, [])
  assert.equal(migrated.leagueAccessGrantedForSeason, null)
})

test('setAvatarChoice saves a style, seed and display name together', () => {
  const withProfile = { ...base, profile: { pathId: 'machine-learning' } }
  const next = setAvatarChoice(withProfile, { avatarStyle: 'pixelArt', avatarSeed: 'ada-lovelace', name: 'Ada' })

  assert.equal(next.profile.avatarStyle, 'pixelArt')
  assert.equal(next.profile.avatarSeed, 'ada-lovelace')
  assert.equal(next.profile.name, 'Ada')
  assert.equal(next.profile.pathId, 'machine-learning', 'the rest of the profile is untouched')
})

test('setAvatarChoice leaves the name alone when none is passed', () => {
  const withName = { ...base, profile: { pathId: 'machine-learning', name: 'Ada' } }
  const next = setAvatarChoice(withName, { avatarStyle: 'bottts', avatarSeed: 'ada-lovelace' })

  assert.equal(next.profile.name, 'Ada')
})
