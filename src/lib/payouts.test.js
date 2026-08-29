import test from 'node:test'
import assert from 'node:assert/strict'
import {
  advancePayout,
  confirmDueRewards,
  createRewardEntry,
  getPayoutStage,
  getReviewHoursRemaining,
  isEligibleForPayout,
  isReviewComplete,
  PROCESSING_WINDOW_HOURS,
  requestPayout,
  REVIEW_WINDOW_HOURS,
  SENT_WINDOW_HOURS,
} from './payouts.js'

const HOUR_MS = 60 * 60 * 1000
const NOW = new Date(2026, 7, 7).getTime()

function seasonResult(overrides = {}) {
  return { seasonIndex: 12, fromLeague: 'Gold League', rank: 6, score: 3200, reward: 3000, ...overrides }
}

test('a reward season starts under review, holding its numbers', () => {
  const entry = createRewardEntry(seasonResult(), NOW)
  assert.equal(entry.status, 'under_review')
  assert.equal(entry.reward, 3000)
  assert.equal(entry.confirmedAt, null)
})

test('a season with no reward needs no review — it confirms immediately', () => {
  const entry = createRewardEntry(seasonResult({ reward: 0 }), NOW)
  assert.equal(entry.status, 'confirmed')
  assert.equal(entry.confirmedAt, NOW)
})

test('review is not complete before the window closes, and is once it does', () => {
  const entry = createRewardEntry(seasonResult(), NOW)
  assert.equal(isReviewComplete(entry, NOW + (REVIEW_WINDOW_HOURS - 1) * HOUR_MS), false)
  assert.equal(isReviewComplete(entry, NOW + REVIEW_WINDOW_HOURS * HOUR_MS), true)
})

test('getReviewHoursRemaining counts down to zero and never goes negative', () => {
  const entry = createRewardEntry(seasonResult(), NOW)
  assert.equal(getReviewHoursRemaining(entry, NOW), REVIEW_WINDOW_HOURS)
  assert.equal(getReviewHoursRemaining(entry, NOW + REVIEW_WINDOW_HOURS * HOUR_MS), 0)
  assert.equal(getReviewHoursRemaining(entry, NOW + (REVIEW_WINDOW_HOURS + 100) * HOUR_MS), 0)
})

test('confirmDueRewards leaves an entry alone until its review window closes', () => {
  const current = { rewardHistory: [createRewardEntry(seasonResult(), NOW)], rewardBalance: 0, lifetimeRewards: 0 }
  const tooEarly = confirmDueRewards(current, NOW + 1 * HOUR_MS)

  assert.equal(tooEarly.rewardHistory[0].status, 'under_review')
  assert.equal(tooEarly.rewardBalance, 0)
})

test('confirmDueRewards moves a matured reward into the balance and lifetime total', () => {
  const current = { rewardHistory: [createRewardEntry(seasonResult(), NOW)], rewardBalance: 500, lifetimeRewards: 1000 }
  const confirmed = confirmDueRewards(current, NOW + REVIEW_WINDOW_HOURS * HOUR_MS)

  assert.equal(confirmed.rewardHistory[0].status, 'confirmed')
  assert.equal(confirmed.rewardBalance, 3500, 'the 3000 reward joins the existing 500 balance')
  assert.equal(confirmed.lifetimeRewards, 4000, 'lifetime accumulates the same way')
})

test('confirmDueRewards never double-confirms an already-confirmed entry', () => {
  const once = confirmDueRewards({ rewardHistory: [createRewardEntry(seasonResult(), NOW)], rewardBalance: 0, lifetimeRewards: 0 }, NOW + REVIEW_WINDOW_HOURS * HOUR_MS)
  const twice = confirmDueRewards(once, NOW + (REVIEW_WINDOW_HOURS + 10) * HOUR_MS)

  assert.equal(twice.rewardBalance, 3000)
  assert.equal(twice.lifetimeRewards, 3000)
})

test('isEligibleForPayout requires enough balance and no payout already in flight', () => {
  assert.equal(isEligibleForPayout({ rewardBalance: 500 }, 500), true)
  assert.equal(isEligibleForPayout({ rewardBalance: 499 }, 500), false)
  assert.equal(isEligibleForPayout({ rewardBalance: 500, pendingPayout: { status: 'processing' } }, 500), false)
})

test('requestPayout moves the whole balance into pending, leaving nothing behind', () => {
  const next = requestPayout({ rewardBalance: 1500 }, NOW)
  assert.equal(next.rewardBalance, 0)
  assert.equal(next.pendingPayout.amount, 1500)
  assert.equal(next.pendingPayout.status, 'processing')
})

test('requestPayout is a no-op with nothing to pay out, or a payout already running', () => {
  assert.deepEqual(requestPayout({ rewardBalance: 0 }, NOW), { rewardBalance: 0 })
  const withPending = { rewardBalance: 200, pendingPayout: { amount: 500, status: 'sent' } }
  assert.deepEqual(requestPayout(withPending, NOW), withPending)
})

test('a payout stages itself from processing through sent to paid over its own clock', () => {
  const pending = { amount: 1000, status: 'processing', requestedAt: NOW }
  assert.equal(getPayoutStage(pending, NOW), 'processing')
  assert.equal(getPayoutStage(pending, NOW + (PROCESSING_WINDOW_HOURS - 1) * HOUR_MS), 'processing')
  assert.equal(getPayoutStage(pending, NOW + PROCESSING_WINDOW_HOURS * HOUR_MS), 'sent')
  assert.equal(getPayoutStage(pending, NOW + (PROCESSING_WINDOW_HOURS + SENT_WINDOW_HOURS) * HOUR_MS), 'paid')
})

test('getPayoutStage is null with nothing pending', () => {
  assert.equal(getPayoutStage(null, NOW), null)
})

test('advancePayout closes out a paid payout into history, clearing pending', () => {
  const current = { pendingPayout: { amount: 1000, status: 'processing', requestedAt: NOW }, paidPayouts: [] }
  const paidAt = NOW + (PROCESSING_WINDOW_HOURS + SENT_WINDOW_HOURS) * HOUR_MS
  const next = advancePayout(current, paidAt)

  assert.equal(next.pendingPayout, null)
  assert.equal(next.paidPayouts.length, 1)
  assert.equal(next.paidPayouts[0].amount, 1000)
  assert.equal(next.paidPayouts[0].status, 'paid')
  assert.equal(next.paidPayouts[0].paidAt, paidAt)
})

test('advancePayout updates the status in place while still in flight', () => {
  const current = { pendingPayout: { amount: 1000, status: 'processing', requestedAt: NOW } }
  const next = advancePayout(current, NOW + PROCESSING_WINDOW_HOURS * HOUR_MS)

  assert.equal(next.pendingPayout.status, 'sent')
  assert.equal(next.pendingPayout.amount, 1000)
})

test('advancePayout is a no-op with nothing pending, and once nothing changed', () => {
  assert.deepEqual(advancePayout({ pendingPayout: null }, NOW), { pendingPayout: null })
  const stable = { pendingPayout: { amount: 500, status: 'sent', requestedAt: NOW } }
  assert.equal(advancePayout(stable, NOW + (PROCESSING_WINDOW_HOURS + 1) * HOUR_MS), stable)
})
