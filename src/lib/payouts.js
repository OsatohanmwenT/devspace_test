// The reward lifecycle from season close to bank deposit. Two separate
// things move through this, on their own clocks:
//
// - A reward *entry* (one per settled season): under_review -> confirmed.
//   Confirming moves its amount out of nowhere and into rewardBalance.
// - A payout *request* (one at a time, covering the whole balance at the
//   moment it's requested): processing -> sent -> paid, or on_hold / failed.
//
// Every status named in the product spec appears somewhere in this file or
// the UI that reads it: projected (the live, not-yet-settled season card),
// under_review, confirmed, balance_available (derived — see
// isEligibleForPayout), processing, sent, paid, on_hold, failed.
const HOUR_MS = 60 * 60 * 1000

// Demo-length windows. Real values would be tuned against actual review and
// bank-transfer turnaround; these exist so the flow can be walked end-to-end
// using the same `?simOffset=` fast-forward the season/week clocks already
// use, rather than a second, parallel "demo speed" mechanism.
export const REVIEW_WINDOW_HOURS = 48
export const PROCESSING_WINDOW_HOURS = 24
export const SENT_WINDOW_HOURS = 24

export const REWARD_ENTRY_STATUSES = ['under_review', 'confirmed', 'on_hold']
export const PAYOUT_STATUSES = ['processing', 'sent', 'paid', 'on_hold', 'failed']

// A season that settled with no reward isn't worth a review cycle — nothing
// is going to confirm into money, so it's recorded but never blocks on time.
export function createRewardEntry(seasonResult, now) {
  return {
    seasonIndex: seasonResult.seasonIndex,
    leagueName: seasonResult.fromLeague,
    rank: seasonResult.rank,
    seasonCoins: seasonResult.score,
    reward: seasonResult.reward,
    status: seasonResult.reward > 0 ? 'under_review' : 'confirmed',
    reviewStartedAt: now,
    confirmedAt: seasonResult.reward > 0 ? null : now,
  }
}

export function isReviewComplete(entry, now) {
  return now - entry.reviewStartedAt >= REVIEW_WINDOW_HOURS * HOUR_MS
}

export function getReviewHoursRemaining(entry, now) {
  return Math.max(0, Math.ceil((entry.reviewStartedAt + REVIEW_WINDOW_HOURS * HOUR_MS - now) / HOUR_MS))
}

// The checklist is display copy, not fraud logic — there's nothing to
// actually detect in a single-learner demo. What it stands in for is real:
// mastery already gated whether an event earned a coin at all (see
// lib/mastery.js and the firstTryCorrect-only coin awards), so "activity
// verification" here is documenting a check the system already made earlier,
// not deferring it to this screen.
export const REVIEW_CHECKLIST = [
  { id: 'activity', label: 'Activity verification', detail: 'Coins came from genuine first-try answers, not repeated mastered content.' },
  { id: 'duplicate', label: 'Duplicate/farming check', detail: 'No submission counted toward your season total more than once.' },
  { id: 'project', label: 'Project validation', detail: 'Any project milestones behind your Coins were actually completed.' },
  { id: 'eligibility', label: 'Eligibility review', detail: 'Your account and payout profile meet the season\'s reward terms.' },
]

// Applies every reward entry whose review window has closed — called once per
// render from the progress layer, the same way resolveSeason settles a
// finished season without ever having "waited" for it in real time.
export function confirmDueRewards(current, now) {
  const history = current.rewardHistory ?? []
  let balanceGain = 0
  let lifetimeGain = 0

  const nextHistory = history.map((entry) => {
    if (entry.status !== 'under_review' || !isReviewComplete(entry, now)) return entry
    balanceGain += entry.reward
    lifetimeGain += entry.reward
    return { ...entry, status: 'confirmed', confirmedAt: now }
  })

  if (balanceGain === 0) return current

  return {
    ...current,
    rewardHistory: nextHistory,
    rewardBalance: (current.rewardBalance ?? 0) + balanceGain,
    lifetimeRewards: (current.lifetimeRewards ?? 0) + lifetimeGain,
  }
}

export function isEligibleForPayout(current, minBankPayout) {
  return (current.rewardBalance ?? 0) >= minBankPayout && !current.pendingPayout
}

// Requesting a payout moves the whole balance out of "available" and into
// "pending" — the two must never double-count the same naira, which is the
// whole reason this is one function rather than two call sites each doing
// half of it.
export function requestPayout(current, now) {
  const amount = current.rewardBalance ?? 0
  if (amount <= 0 || current.pendingPayout) return current

  return {
    ...current,
    rewardBalance: 0,
    pendingPayout: { amount, status: 'processing', requestedAt: now },
  }
}

// Where a payout's own clock puts it right now — pure, so the UI and a test
// can both ask "what should this say" without waiting on real time.
export function getPayoutStage(pendingPayout, now) {
  if (!pendingPayout) return null
  const elapsedHours = (now - pendingPayout.requestedAt) / HOUR_MS
  if (elapsedHours >= PROCESSING_WINDOW_HOURS + SENT_WINDOW_HOURS) return 'paid'
  if (elapsedHours >= PROCESSING_WINDOW_HOURS) return 'sent'
  return 'processing'
}

// Applies that clock to progress — once "paid", the pending payout closes out
// and its amount is done moving (it already left rewardBalance when
// requested, and lifetimeRewards was already credited on confirmation).
export function advancePayout(current, now) {
  if (!current.pendingPayout) return current
  const stage = getPayoutStage(current.pendingPayout, now)
  if (stage === current.pendingPayout.status) return current
  if (stage === 'paid') {
    return {
      ...current,
      pendingPayout: null,
      paidPayouts: [...(current.paidPayouts ?? []), { ...current.pendingPayout, status: 'paid', paidAt: now }],
    }
  }
  return { ...current, pendingPayout: { ...current.pendingPayout, status: stage } }
}
