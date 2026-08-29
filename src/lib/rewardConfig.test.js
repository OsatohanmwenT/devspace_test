import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getCashWinnerCount,
  getNextRewardTarget,
  getPayoutForRank,
  getRewardPool,
  LEAGUE_REWARDS,
  MIN_BANK_PAYOUT,
  SEASON_BUDGET,
  validateRewardConfig,
} from './rewardConfig.js'

test('the live config is valid — this is the launch-blocker guard itself', () => {
  assert.deepEqual(validateRewardConfig(), [])
})

test('all five league pools sum to exactly the season budget', () => {
  const total = LEAGUE_REWARDS.reduce((sum, league) => sum + league.pool, 0)
  assert.equal(total, SEASON_BUDGET)
  assert.equal(SEASON_BUDGET, 500000)
})

test('every league exists with its spec-mandated cash winner ceiling', () => {
  assert.equal(getCashWinnerCount('bronze'), 180)
  assert.equal(getCashWinnerCount('silver'), 75)
  assert.equal(getCashWinnerCount('gold'), 39)
  assert.equal(getCashWinnerCount('sapphire'), 24)
  assert.equal(getCashWinnerCount('diamond'), 10)
})

test('a config with pools over budget is rejected', () => {
  const overBudget = [
    { id: 'a', pool: 300000, cashWinnerCount: 1, bands: [{ minRank: 1, maxRank: 1, amount: 100000 }] },
    { id: 'b', pool: 300000, cashWinnerCount: 1, bands: [{ minRank: 1, maxRank: 1, amount: 100000 }] },
  ]
  const errors = validateRewardConfig(overBudget, 500000)
  assert.ok(errors.some((message) => message.includes('exceeds the season budget')))
})

test('a league whose bands promise more than its own pool is rejected', () => {
  const overPool = [
    { id: 'a', pool: 1000, cashWinnerCount: 5, bands: [{ minRank: 1, maxRank: 5, amount: 1000 }] },
  ]
  const errors = validateRewardConfig(overPool, 500000)
  assert.ok(errors.some((message) => message.includes('exceeds its pool')))
})

test('bands reaching past the cash winner ceiling are rejected', () => {
  const overCeiling = [
    { id: 'a', pool: 100000, cashWinnerCount: 3, bands: [{ minRank: 1, maxRank: 10, amount: 100 }] },
  ]
  const errors = validateRewardConfig(overCeiling, 500000)
  assert.ok(errors.some((message) => message.includes('exceeds its cash winner ceiling')))
})

test('getPayoutForRank returns the band amount, and zero past the last band', () => {
  assert.equal(getPayoutForRank('diamond', 1), 30000)
  assert.equal(getPayoutForRank('diamond', 10), 8000)
  assert.equal(getPayoutForRank('diamond', 11), 0)
  assert.equal(getPayoutForRank('diamond', 5000), 0)
})

test('getPayoutForRank returns zero for an unknown league', () => {
  assert.equal(getPayoutForRank('not-a-league', 1), 0)
})

test('getRewardPool matches the configured pool per league', () => {
  assert.equal(getRewardPool('bronze'), 90000)
  assert.equal(getRewardPool('gold'), 95000)
})

test('getNextRewardTarget points at the closest strictly-better band', () => {
  const target = getNextRewardTarget('gold', 40) // just past the last band (rank 39)
  assert.deepEqual(target, { rank: 39, reward: 1000 })

  const midTarget = getNextRewardTarget('gold', 10) // inside the 7-15 band (2000)
  assert.deepEqual(midTarget, { rank: 6, reward: 3000 }) // closest better band ends at rank 6
})

test('getNextRewardTarget is null once already in the top band', () => {
  assert.equal(getNextRewardTarget('gold', 1), null)
})

test('MIN_BANK_PAYOUT is the demo-configured threshold', () => {
  assert.equal(MIN_BANK_PAYOUT, 500)
})
