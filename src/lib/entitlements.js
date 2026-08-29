// One place that knows what Premium unlocks, so no component ever reads
// `progress.isPremium` directly — that would scatter the same check across the
// app and make a future free trial, grandfathered grant, or expiry rule a
// find-and-replace across files instead of an edit here.
//
// Nothing in this map may ever touch scoring. `resolveSeason` and
// `rankEntries` (lib/leagueSim.js) read only Devy Coins — never entitlement —
// and a test in leagueSim.test.js asserts a premium and a free learner with
// equal coins resolve to the same rank, score and reward. That is the
// pay-to-win firewall: sell status, streak insurance, visibility, and which
// league tier you may compete in — never rank within one.
//
// SILVER_PLUS_LEAGUES is that last one: it gates *participation* in Silver
// and above, not standing once there. lib/leagueAccess.js is where that gate
// actually lives — it checks this capability first, then falls back to a
// learner's own earned League Pass, since Pro is not the only legitimate way
// in (see BRONZE_PASS_RANK_THRESHOLD).
export const CAPABILITIES = {
  PRO_TAG: 'pro-tag',
  ALL_TIME_BOARD: 'all-time-board',
  STREAK_SHIELD: 'streak-shield',
  REPLAY_XP: 'replay-xp',
  FULL_COHORT: 'full-cohort',
  SILVER_PLUS_LEAGUES: 'silver-plus-leagues',
}

const PREMIUM_ONLY = new Set(Object.values(CAPABILITIES))

export function can(progress, capability) {
  if (!PREMIUM_ONLY.has(capability)) return true
  return Boolean(progress?.isPremium)
}
