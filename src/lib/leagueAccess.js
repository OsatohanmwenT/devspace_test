// Who may actually compete in a Pro-gated league — separate from ranking
// (lib/leagueSim.js), which never reads any of this. Rank decides *where you
// qualify to*; this module decides whether you're allowed to stand there.
import { getLeague } from '../data/leagues.js'
import { can, CAPABILITIES } from './entitlements.js'

// Only Bronze finishers earn a pass, and only into Silver — the spec doesn't
// describe a pass into Gold/Sapphire/Diamond, so this module doesn't invent one.
export const BRONZE_PASS_RANK_THRESHOLD = 10
export const PASS_LEAGUE_ID = 'silver'

export function findUsablePass(leaguePasses, leagueId, seasonIndex) {
  return (leaguePasses ?? []).find((pass) => pass.leagueId === leagueId && !pass.used && pass.usableSeasonIndex === seasonIndex) ?? null
}

// A learner who finished top 10 in Bronze earns one season of Silver access,
// usable the very next season — not this one, and not indefinitely. Guarded
// against granting twice for the same season if resolution ever ran twice.
export function grantSilverPassIfEarned(current, bronzeLeagueIndex, rank, seasonIndex) {
  if (current.leagueIndex !== bronzeLeagueIndex || rank > BRONZE_PASS_RANK_THRESHOLD) return current.leaguePasses ?? []
  const already = (current.leaguePasses ?? []).some((pass) => pass.leagueId === PASS_LEAGUE_ID && pass.grantedSeasonIndex === seasonIndex)
  if (already) return current.leaguePasses ?? []

  const pass = { leagueId: PASS_LEAGUE_ID, grantedSeasonIndex: seasonIndex, usableSeasonIndex: seasonIndex + 1, used: false }
  return [...(current.leaguePasses ?? []), pass]
}

function markPassUsed(leaguePasses, leagueId, seasonIndex) {
  return leaguePasses.map((pass) => (
    pass.leagueId === leagueId && pass.usableSeasonIndex === seasonIndex && !pass.used
      ? { ...pass, used: true }
      : pass
  ))
}

// Applies to a rank-computed target league, whichever direction it came from
// (promotion, demotion, or simply continuing) — a league that requires Pro
// requires it regardless of how a learner would otherwise have arrived there.
// Not granted means parked in Bronze, the one tier that needs no access at all.
export function applyLeagueAccessGate(progress, targetLeagueIndex, upcomingSeasonIndex, leaguePasses) {
  const league = getLeague(targetLeagueIndex)
  if (!league.proRequired) {
    return { leagueIndex: targetLeagueIndex, leaguePasses, accessGranted: true, via: 'free' }
  }
  if (can(progress, CAPABILITIES.SILVER_PLUS_LEAGUES)) {
    return { leagueIndex: targetLeagueIndex, leaguePasses, accessGranted: true, via: 'pro' }
  }
  const pass = findUsablePass(leaguePasses, league.id, upcomingSeasonIndex)
  if (pass) {
    return { leagueIndex: targetLeagueIndex, leaguePasses: markPassUsed(leaguePasses, league.id, upcomingSeasonIndex), accessGranted: true, via: 'pass' }
  }
  return { leagueIndex: 0, leaguePasses, accessGranted: false, via: null }
}

// Self-heals against a `leagueIndex` that doesn't match a grant recorded for
// the season currently in progress — the "deep link straight into Silver"
// case, where nothing ever ran the gate above for this exact season. A
// learner legitimately granted access at the season's start keeps it for the
// rest of that season even if Pro lapses mid-season; this only catches a
// league/season combination the gate never actually produced.
export function sanitizeLeagueAccess(progress, currentSeasonIndex) {
  const league = getLeague(progress.leagueIndex)
  if (!league.proRequired) return progress
  if (progress.leagueAccessGrantedForSeason === currentSeasonIndex) return progress
  return { ...progress, leagueIndex: 0 }
}

// Copy-facing label for the CTA a result screen should offer, derived from
// how access was (or wasn't) granted — never hand-picked by the caller.
export function getAccessCta(via) {
  if (via === 'pro') return { label: 'Enter Silver', kind: 'enter' }
  if (via === 'pass') return { label: 'Use Silver Pass', kind: 'pass' }
  return { label: 'Unlock Silver with Pro', kind: 'locked' }
}
