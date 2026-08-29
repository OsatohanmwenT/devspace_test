import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildClimbCard,
  buildH2HWinCard,
  buildLeagueUnlockedCard,
  buildRewardZoneCard,
  buildTopPercentCard,
} from './shareCards.js'

function assertCardShape(card) {
  assert.ok(card.headline?.length > 0)
  assert.ok(card.subtext?.length > 0)
  assert.ok(card.statLine?.length > 0)
}

test('every builder returns a complete card', () => {
  assertCardShape(buildLeagueUnlockedCard('Silver League'))
  assertCardShape(buildClimbCard(12))
  assertCardShape(buildRewardZoneCard(1000))
  assertCardShape(buildTopPercentCard(4, 30))
  assertCardShape(buildH2HWinCard('Stefano'))
})

test('the climb card states the exact number of places', () => {
  const card = buildClimbCard(7)
  assert.match(card.headline, /7/)
})

test('the reward card formats the naira amount with thousands separators', () => {
  const card = buildRewardZoneCard(22000)
  assert.match(card.headline, /22,000/)
})

test('the percentile card rounds up so #1 always reads as top 1%, never top 0%', () => {
  const card = buildTopPercentCard(1, 30)
  assert.match(card.headline, /top 1%|top 3%/)
  assert.doesNotMatch(card.headline, /top 0%/)
})
