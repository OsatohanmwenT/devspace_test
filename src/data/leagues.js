// Promotion zones are percentages of the cohort per the spec (top 15% in
// Bronze, narrowing near the top) rather than the old fixed row counts — see
// getPromoteCount/getDemoteCount below for how those turn into row counts.
// Even Bronze's zone is genuinely competitive at 15%, unlike the old ladder's
// "almost everyone advances" Bronze — that was calibrated for a fixed top-20-
// of-30 cutoff that no longer exists.
//
// `pace` scales the whole rival field, so it is the dial that decides how
// many coins a season actually costs. Coins are discrete, anti-farmed awards
// (lib/coins.js) rather than a continuous rate like XP was, so there is no
// honest "daily goal" to calibrate against — pace is tuned directly against
// the rival field instead: modest activity should rarely crack Bronze's top
// 15%, real sustained effort should reliably clear it. leagueSim.test.js
// locks these rates; change `pace` and it will tell you.
//
// These values are scaled to the content that actually exists right now —
// a handful of lessons and practice sessions, each a one-time (anti-farmed)
// coin award, capping a season's honestly-earned total well under what the
// original pace assumed a sustained daily habit would produce. Re-scale
// upward as more lessons and practice sessions get authored, using the same
// binary-search-against-leagueSim.test.js approach: raise `pace` until the
// low-effort benchmark stops promoting and the strong-effort one still does.
//
// `requiresPro` marks the leagues Bronze doesn't fund entry to — Silver and
// above need an active Pro subscription (or, for a season, a Silver Pass
// earned by finishing top 10 in Bronze — see lib/leagueAccess.js). This is
// gating, not scoring: nothing here or in leagueSim.js reads `isPremium`,
// which is what keeps Pro from ever affecting rank once someone is competing.
export const leagues = [
  { id: 'bronze', name: 'Bronze League', color: '#d98a52', promotePercent: 0.15, demotePercent: 0, requiresPro: false, pace: 0.036 },
  { id: 'silver', name: 'Silver League', color: '#c7c9d1', promotePercent: 0.15, demotePercent: 0.10, requiresPro: true, pace: 0.057 },
  { id: 'gold', name: 'Gold League', color: '#ffcf8b', promotePercent: 0.12, demotePercent: 0.10, requiresPro: true, pace: 0.081 },
  { id: 'sapphire', name: 'Sapphire League', color: '#5fb8ff', promotePercent: 0.10, demotePercent: 0.12, requiresPro: true, pace: 0.108 },
  { id: 'diamond', name: 'Diamond League', color: '#04adc0', promotePercent: 0, demotePercent: 0.15, requiresPro: true, pace: 0.138 },
]

export const COHORT_SIZE = 30

export function getLeague(index) {
  return leagues[Math.min(leagues.length - 1, Math.max(0, index))]
}

// Percentages round to whole rows against a fixed cohort size, same as the
// fixed counts they replace — kept as functions (not precomputed fields) so
// COHORT_SIZE stays the single source of truth if it ever changes.
export function getPromoteCount(league) {
  return Math.round(league.promotePercent * COHORT_SIZE)
}

export function getDemoteCount(league) {
  return Math.round(league.demotePercent * COHORT_SIZE)
}
