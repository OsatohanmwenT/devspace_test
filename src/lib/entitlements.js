// One place that knows what Premium unlocks, so no component ever reads
// `progress.isPremium` directly — that would scatter the same check across the
// app and make a future free trial, grandfathered grant, or expiry rule a
// find-and-replace across files instead of an edit here.
//
// Nothing in this map may ever touch scoring. `resolveWeek` and `rankEntries`
// read only XP — never entitlement — and a test in progress.test.js asserts a
// premium and a free learner with equal XP resolve identically. That is the
// pay-to-win firewall: sell status, streak insurance, and visibility, never rank.
export const CAPABILITIES = {
  PRO_TAG: 'pro-tag',
  ALL_TIME_BOARD: 'all-time-board',
  STREAK_SHIELD: 'streak-shield',
  REPLAY_XP: 'replay-xp',
  FULL_COHORT: 'full-cohort',
}

const PREMIUM_ONLY = new Set(Object.values(CAPABILITIES))

export function can(progress, capability) {
  if (!PREMIUM_ONLY.has(capability)) return true
  return Boolean(progress?.isPremium)
}
