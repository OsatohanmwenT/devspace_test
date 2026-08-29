// Hidden per-concept learning-evidence signal. Never rendered as a number —
// it exists to decide whether a concept is due for reinforcement, and to
// eventually distinguish a clean first-try answer from a lucky guess once
// this feeds anything visible. Pure and today-as-parameter, same shape as
// streak.js, so it stays testable without a DOM or a clock.

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(today, days) {
  const date = startOfDay(today)
  date.setDate(date.getDate() + days)
  return date.toDateString()
}

// Concept ids in this codebase are hyphenated (e.g. "program-execution"), so
// the split has to stop at the first colon rather than any colon.
export function getConceptKey(lessonId, conceptId) {
  return `${lessonId}:${conceptId}`
}

export function parseConceptKey(key) {
  const separatorIndex = key.indexOf(':')
  return { lessonId: key.slice(0, separatorIndex), conceptId: key.slice(separatorIndex + 1) }
}

export function createMasteryRecord() {
  return {
    score: 0,
    attemptsTotal: 0,
    correctFirstTry: 0,
    lastPracticedDate: null,
    lastOutcomeCorrect: null,
    reviewStreak: 0,
    dueForReviewDate: null,
  }
}

// The scoring rule is intentionally simple: it only has to order concepts by
// how cleanly they were understood, never justify itself to a learner.
const SCORE_DELTA = {
  firstTryCorrect: 12,
  retryCorrect: 5,
  resolvedWrong: -8,
}

function clampScore(score) {
  return Math.min(100, Math.max(0, score))
}

// Base interval by score tier, plus a small bonus for a run of clean
// resolutions — a minimal spaced-repetition surrogate, not a full SM-2
// implementation. Computed from the *post-update* score/streak so the very
// first correct answer already earns a real interval.
export function computeNextReviewDate(score, reviewStreak, today) {
  const base = score >= 80 ? 7 : score >= 50 ? 3 : 1
  const bonus = Math.min(reviewStreak, 3)
  const interval = Math.min(base + bonus, 21)
  return addDays(today, interval)
}

export function recordQuestionOutcome(record, { correct, firstTryCorrect }, today) {
  const delta = firstTryCorrect ? SCORE_DELTA.firstTryCorrect : correct ? SCORE_DELTA.retryCorrect : SCORE_DELTA.resolvedWrong
  const nextScore = clampScore(record.score + delta)
  const nextReviewStreak = correct ? record.reviewStreak + 1 : 0

  return {
    score: nextScore,
    attemptsTotal: record.attemptsTotal + 1,
    correctFirstTry: record.correctFirstTry + (firstTryCorrect ? 1 : 0),
    lastPracticedDate: today,
    lastOutcomeCorrect: correct,
    reviewStreak: nextReviewStreak,
    dueForReviewDate: computeNextReviewDate(nextScore, nextReviewStreak, today),
  }
}

export function isDueForReview(record, today) {
  if (!record?.dueForReviewDate) return false
  return startOfDay(today) >= startOfDay(record.dueForReviewDate)
}

// Most-overdue first, so a Home surface offering just one concept always
// offers the one that has waited longest rather than whichever key iterates
// first.
export function findDueConcepts(masteryByConcept, today) {
  return Object.entries(masteryByConcept ?? {})
    .filter(([, record]) => isDueForReview(record, today))
    .map(([conceptKey, record]) => ({ conceptKey, record }))
    .sort((a, b) => startOfDay(a.record.dueForReviewDate) - startOfDay(b.record.dueForReviewDate))
}
