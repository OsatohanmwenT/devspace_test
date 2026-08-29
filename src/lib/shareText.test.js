import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cashZoneShareText,
  inviteShareText,
  promotionShareText,
  qualifiedShareText,
  rankClimbShareText,
  seasonResultShareText,
} from './shareText.js'

test('rankClimbShareText names the real climb and the real rank', () => {
  assert.equal(rankClimbShareText({ positions: 84, rank: 117, league: 'Bronze League' }), "I climbed 84 places this season. I'm now #117 in Devspace Bronze League.")
})

test('rankClimbShareText handles a single position without a stray "s"', () => {
  assert.equal(rankClimbShareText({ positions: 1, rank: 250, league: 'Bronze League' }), "I climbed 1 place this season. I'm now #250 in Devspace Bronze League.")
})

test('cashZoneShareText includes the reward only when there is one', () => {
  assert.equal(cashZoneShareText({ league: 'Gold League', reward: 1000 }), 'I just entered a reward position in Devspace Gold League — ₦1,000 and counting.')
  assert.equal(cashZoneShareText({ league: 'Gold League', reward: 0 }), 'I just entered a reward position in Devspace Gold League.')
})

test('qualifiedShareText and promotionShareText name the league distinctly', () => {
  assert.equal(qualifiedShareText({ league: 'Silver League' }), 'I qualified for Devspace Silver League!')
  assert.equal(promotionShareText({ league: 'Silver League' }), 'SILVER LEAGUE UNLOCKED. I just moved up in Devspace.')
})

test('seasonResultShareText reads naturally for a strong season and a weak one', () => {
  const strong = seasonResultShareText({ league: 'Gold League', seasonNumber: 4, rank: 3, coins: 3482, percentile: 95 })
  assert.equal(strong, 'Devspace Gold League · Season 4 — #3, 3,482 Devy Coins, top 5%.')

  const weak = seasonResultShareText({ league: 'Bronze League', seasonNumber: 4, rank: 208, coins: 300, percentile: 20 })
  assert.equal(weak, 'Devspace Bronze League · Season 4 — #208, 300 Devy Coins, 20th percentile.')
})

test('inviteShareText makes no claim about a trackable invite mechanism that does not exist yet', () => {
  const text = inviteShareText()
  assert.equal(text, 'Come learn with me on Devspace.')
  assert.ok(!/code|link/i.test(text), 'should not imply a code or link that is not actually generated anywhere')
})
