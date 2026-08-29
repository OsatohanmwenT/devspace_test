// One place that knows what Premium unlocks, so no component ever reads
// `progress.isPremium` directly — that would scatter the same check across the
// app and make a future free trial, grandfathered grant, or expiry rule a
// find-and-replace across files instead of an edit here.
//
// Nothing in this map may ever touch scoring. `resolveSeason` and
// `rankEntries` read only coins — never entitlement — and a test in
// leagueSim.test.js asserts a premium and a free learner with equal coins
// resolve identically. That is the pay-to-win firewall: sell status, streak
// insurance, and visibility, never rank.
//
// Whether Pro is *required* to compete in a league at all (Silver and above)
// is a separate question, answered by lib/leagueAccess.js — that's gating,
// not scoring, and it must stay out of this map and out of resolveSeason.
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
