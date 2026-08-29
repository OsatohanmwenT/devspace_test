// Pure content builders for shareable growth cards — no rendering, no
// state. Each returns { headline, subtext, statLine }; ShareCardModal.jsx
// is the only place that turns these into markup.

export function buildLeagueUnlockedCard(leagueName) {
  return {
    headline: `${leagueName} unlocked`,
    subtext: 'Verified learning earned this — not luck, not spend.',
    statLine: `Now competing in ${leagueName}`,
  }
}

// Only meant to be called for positive movement — callers already have the
// delta in hand (getStandings already computes it) and should check it's
// > 0 before reaching for this, the same way getPaceOutlook trusts its
// callers to pass sane inputs rather than guarding internally.
export function buildClimbCard(placesClimbed) {
  return {
    headline: `I climbed ${placesClimbed} place${placesClimbed === 1 ? '' : 's'}`,
    subtext: 'Verified learning, not luck.',
    statLine: `+${placesClimbed} today`,
  }
}

export function buildRewardZoneCard(amount) {
  return {
    headline: `I entered the ₦${amount.toLocaleString()} reward zone`,
    subtext: 'Cash rewards for verified, consistent learning.',
    statLine: `₦${amount.toLocaleString()} projected`,
  }
}

export function buildTopPercentCard(rank, cohortSize) {
  const percentile = Math.max(1, Math.round((rank / cohortSize) * 100))
  return {
    headline: `I finished in the top ${percentile}%`,
    subtext: 'Ranked against real competitive learners.',
    statLine: `#${rank} of ${cohortSize}`,
  }
}

export function buildH2HWinCard(opponentName) {
  return {
    headline: `I won my head-to-head against ${opponentName}`,
    subtext: 'One-on-one, verified coins only.',
    statLine: 'H2H win',
  }
}
