// The one source of truth for season reward money — no component may invent a
// payout number or a "1 coin = ₦X" conversion. Everything here reads from
// `LEAGUE_REWARDS`, and the module refuses to load at all if the numbers
// don't add up (see the validation guard at the bottom).

export const SEASON_BUDGET = 500000

// The smallest confirmed reward that triggers an actual bank transfer —
// anything below this accumulates in the learner's Reward Balance instead of
// generating a payout every season. Demo value; production would tune this
// against real transfer fees.
export const MIN_BANK_PAYOUT = 500

// Payout bands are ordered by ascending rank (= descending amount) and never
// overlap. `cashWinnerCount` is the hard ceiling on how many ranks a league
// may ever pay — it exists independently of how many bands are configured,
// so a future band redesign can't silently exceed it without the validator
// catching it.
export const LEAGUE_REWARDS = [
  {
    id: 'bronze',
    pool: 90000,
    cashWinnerCount: 180,
    bands: [
      { minRank: 1, maxRank: 1, amount: 5000 },
      { minRank: 2, maxRank: 2, amount: 3000 },
      { minRank: 3, maxRank: 3, amount: 2000 },
      { minRank: 4, maxRank: 10, amount: 1000 },
      { minRank: 11, maxRank: 30, amount: 500 },
      { minRank: 31, maxRank: 75, amount: 200 },
      { minRank: 76, maxRank: 180, amount: 100 },
    ],
  },
  {
    id: 'silver',
    pool: 80000,
    cashWinnerCount: 75,
    bands: [
      { minRank: 1, maxRank: 1, amount: 8000 },
      { minRank: 2, maxRank: 2, amount: 5000 },
      { minRank: 3, maxRank: 3, amount: 3500 },
      { minRank: 4, maxRank: 6, amount: 2000 },
      { minRank: 7, maxRank: 15, amount: 1000 },
      { minRank: 16, maxRank: 35, amount: 500 },
      { minRank: 36, maxRank: 75, amount: 200 },
    ],
  },
  {
    id: 'gold',
    pool: 95000,
    cashWinnerCount: 39,
    bands: [
      { minRank: 1, maxRank: 1, amount: 10000 },
      { minRank: 2, maxRank: 2, amount: 7000 },
      { minRank: 3, maxRank: 3, amount: 5000 },
      { minRank: 4, maxRank: 6, amount: 3000 },
      { minRank: 7, maxRank: 15, amount: 2000 },
      { minRank: 16, maxRank: 39, amount: 1000 },
    ],
  },
  {
    id: 'sapphire',
    pool: 105000,
    cashWinnerCount: 24,
    bands: [
      { minRank: 1, maxRank: 1, amount: 15000 },
      { minRank: 2, maxRank: 2, amount: 10000 },
      { minRank: 3, maxRank: 3, amount: 7000 },
      { minRank: 4, maxRank: 6, amount: 5000 },
      { minRank: 7, maxRank: 12, amount: 3000 },
      { minRank: 13, maxRank: 24, amount: 2000 },
    ],
  },
  {
    id: 'diamond',
    pool: 130000,
    cashWinnerCount: 10,
    bands: [
      { minRank: 1, maxRank: 1, amount: 30000 },
      { minRank: 2, maxRank: 2, amount: 20000 },
      { minRank: 3, maxRank: 3, amount: 15000 },
      { minRank: 4, maxRank: 5, amount: 12000 },
      { minRank: 6, maxRank: 10, amount: 8000 },
    ],
  },
]

function findLeague(leagueId) {
  return LEAGUE_REWARDS.find((league) => league.id === leagueId) ?? null
}

// Every rule from spec section 3: each league's bands must never promise more
// than its own pool, and every league's pool must never promise more than the
// season budget. Returns a list of human-readable problems — empty means
// valid. Takes the config as parameters (defaulting to the live one) so tests
// can check a deliberately broken config without re-implementing this logic.
export function validateRewardConfig(leagueRewards = LEAGUE_REWARDS, seasonBudget = SEASON_BUDGET) {
  const errors = []
  const poolTotal = leagueRewards.reduce((total, league) => total + league.pool, 0)
  if (poolTotal > seasonBudget) {
    errors.push(`League pools total ₦${poolTotal.toLocaleString()}, which exceeds the season budget of ₦${seasonBudget.toLocaleString()}`)
  }

  for (const league of leagueRewards) {
    const bandTotal = league.bands.reduce((total, band) => total + band.amount * (band.maxRank - band.minRank + 1), 0)
    if (bandTotal > league.pool) {
      errors.push(`${league.id}: payout bands total ₦${bandTotal.toLocaleString()}, which exceeds its pool of ₦${league.pool.toLocaleString()}`)
    }
    const highestBandedRank = league.bands.reduce((max, band) => Math.max(max, band.maxRank), 0)
    if (highestBandedRank > league.cashWinnerCount) {
      errors.push(`${league.id}: bands pay out to rank ${highestBandedRank}, which exceeds its cash winner ceiling of ${league.cashWinnerCount}`)
    }
  }

  return errors
}

// Fails fast at import time rather than letting a broken config quietly reach
// the UI — an invalid reward setup is a launch blocker, not a rendering detail.
const configErrors = validateRewardConfig()
if (configErrors.length > 0) {
  throw new Error(`Invalid reward configuration:\n${configErrors.join('\n')}`)
}

// Rank selects the band; there is no formula converting a coin total into a
// currency amount anywhere in this codebase.
export function getPayoutForRank(leagueId, rank) {
  const league = findLeague(leagueId)
  if (!league) return 0
  const band = league.bands.find((candidate) => rank >= candidate.minRank && rank <= candidate.maxRank)
  return band?.amount ?? 0
}

export function getRewardPool(leagueId) {
  return findLeague(leagueId)?.pool ?? 0
}

export function getCashWinnerCount(leagueId) {
  return findLeague(leagueId)?.cashWinnerCount ?? 0
}

// The closest rank that would pay strictly more than the current one — the
// band immediately better than wherever `rank` currently sits, whether inside
// a band or past the last one entirely. Null once already in the top band.
export function getNextRewardTarget(leagueId, rank) {
  const league = findLeague(leagueId)
  if (!league) return null

  let closestBetterBand = null
  for (const band of league.bands) {
    if (band.maxRank < rank) closestBetterBand = band
  }

  return closestBetterBand ? { rank: closestBetterBand.maxRank, reward: closestBetterBand.amount } : null
}
