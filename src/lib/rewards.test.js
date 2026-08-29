import test from 'node:test'
import assert from 'node:assert/strict'
import { getRewardForRank, LEAGUE_REWARDS, MIN_PAYOUT_THRESHOLD } from './rewards.js'

test('band lookups match the spec table at representative ranks', () => {
  assert.equal(getRewardForRank('bronze', 1), 10000)
  assert.equal(getRewardForRank('bronze', 2), 6000)
  assert.equal(getRewardForRank('bronze', 3), 4000)
  assert.equal(getRewardForRank('bronze', 7), 2000)
  assert.equal(getRewardForRank('bronze', 30), 1000)

  assert.equal(getRewardForRank('diamond', 1), 40000)
  assert.equal(getRewardForRank('diamond', 10), 4500)
})

test('rank beyond a league\'s winner count earns nothing', () => {
  assert.equal(getRewardForRank('diamond', 11), 0)
  assert.equal(getRewardForRank('sapphire', 25), 0)
})

test('an unknown league or missing rank earns nothing rather than throwing', () => {
  assert.equal(getRewardForRank('ruby', 1), 0)
  assert.equal(getRewardForRank('bronze', null), 0)
  assert.equal(getRewardForRank('bronze', 0), 0)
})

test('every league\'s bands cover at least the first 24 ranks (our smallest cohort winner count)', () => {
  for (const [leagueId, config] of Object.entries(LEAGUE_REWARDS)) {
    const coverage = Math.min(30, config.winners)
    for (let rank = 1; rank <= coverage; rank += 1) {
      assert.ok(getRewardForRank(leagueId, rank) > 0, `${leagueId} rank ${rank} should earn something`)
    }
  }
})

test('no league\'s maximum possible payout exceeds its own pool', () => {
  for (const [leagueId, config] of Object.entries(LEAGUE_REWARDS)) {
    let total = 0
    let previousMaxRank = 0
    for (const band of config.bands) {
      total += (band.maxRank - previousMaxRank) * band.amount
      previousMaxRank = band.maxRank
    }
    assert.ok(total <= config.pool, `${leagueId} bands sum to ${total}, over its ${config.pool} pool`)
  }
})

test('the season pools sum to the spec\'s ₦500,000 budget', () => {
  const total = Object.values(LEAGUE_REWARDS).reduce((sum, config) => sum + config.pool, 0)
  assert.equal(total, 500000)
})

test('the payout threshold matches the spec\'s launch default', () => {
  assert.equal(MIN_PAYOUT_THRESHOLD, 500)
})
