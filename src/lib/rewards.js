// Launch payout bands, verbatim from the spec, keyed by league id. Our
// simulated cohort never exceeds COHORT_SIZE (30 — see data/leagues.js),
// and every league's bands already cover ranks 1-30 before their real
// winner counts run out, so these are used exactly as specified rather
// than rescaled for a smaller cohort.
export const LEAGUE_REWARDS = {
  bronze: {
    pool: 90000,
    winners: 180,
    bands: [
      { maxRank: 1, amount: 10000 },
      { maxRank: 2, amount: 6000 },
      { maxRank: 3, amount: 4000 },
      { maxRank: 10, amount: 2000 },
      { maxRank: 30, amount: 1000 },
      { maxRank: 70, amount: 500 },
      { maxRank: 120, amount: 200 },
      { maxRank: 180, amount: 100 },
    ],
  },
  silver: {
    pool: 80000,
    winners: 75,
    bands: [
      { maxRank: 1, amount: 10000 },
      { maxRank: 2, amount: 7000 },
      { maxRank: 3, amount: 5000 },
      { maxRank: 10, amount: 2000 },
      { maxRank: 20, amount: 1500 },
      { maxRank: 40, amount: 800 },
      { maxRank: 60, amount: 500 },
      { maxRank: 75, amount: 200 },
    ],
  },
  gold: {
    pool: 95000,
    winners: 39,
    bands: [
      { maxRank: 1, amount: 15000 },
      { maxRank: 2, amount: 10000 },
      { maxRank: 3, amount: 7000 },
      { maxRank: 8, amount: 4000 },
      { maxRank: 15, amount: 3000 },
      { maxRank: 25, amount: 1500 },
      { maxRank: 39, amount: 500 },
    ],
  },
  sapphire: {
    pool: 105000,
    winners: 24,
    bands: [
      { maxRank: 1, amount: 22000 },
      { maxRank: 2, amount: 14000 },
      { maxRank: 3, amount: 9000 },
      { maxRank: 6, amount: 6000 },
      { maxRank: 12, amount: 4000 },
      { maxRank: 20, amount: 2000 },
      { maxRank: 24, amount: 500 },
    ],
  },
  diamond: {
    pool: 130000,
    winners: 10,
    bands: [
      { maxRank: 1, amount: 40000 },
      { maxRank: 2, amount: 25000 },
      { maxRank: 3, amount: 15000 },
      { maxRank: 5, amount: 10000 },
      { maxRank: 8, amount: 7000 },
      { maxRank: 10, amount: 4500 },
    ],
  },
}

// Confirmed rewards accumulate here; below this, Devspace doesn't force a
// bank transfer for every micro-reward (spec section 18).
export const MIN_PAYOUT_THRESHOLD = 500

export function getRewardForRank(leagueId, rank) {
  const config = LEAGUE_REWARDS[leagueId]
  if (!config || !rank || rank > config.winners) return 0
  const band = config.bands.find((entry) => rank <= entry.maxRank)
  return band?.amount ?? 0
}
