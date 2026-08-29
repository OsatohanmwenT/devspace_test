// Whether a learner may compete in a given league — separate from
// entitlements.js's CAPABILITIES map because this isn't a pure premium
// boolean: a free Bronze finisher can hold a temporary Silver Pass, and the
// check needs to know which season is current to tell if that pass is still
// good. Cosmetic/QoL perks (PRO tag, streak shield, all-time board, replay
// XP, full cohort view) stay in entitlements.js; league access lives here.
//
// This is gating, not scoring — it decides whether a learner's coins count
// toward a season's competitive standings at all, never how many they earn
// or how they rank once they're in. leagueSim.js's resolveSeason never calls
// this and never reads isPremium, which is what keeps the pay-to-win
// firewall intact even though Pro now gates entry to Silver+.
export function canCompeteInLeague(progress, league, seasonIndex) {
  if (!league?.requiresPro) return true
  if (progress?.isPremium) return true
  return progress?.silverPassSeasonIndex === seasonIndex
}
