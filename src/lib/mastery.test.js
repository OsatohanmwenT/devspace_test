import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeNextReviewDate,
  createMasteryRecord,
  findDueConcepts,
  getConceptKey,
  isDueForReview,
  parseConceptKey,
  recordQuestionOutcome,
} from './mastery.js'

const MONDAY = new Date(2026, 7, 3)
const today = MONDAY.toDateString()

test('getConceptKey/parseConceptKey round-trip, including a hyphenated concept id', () => {
  const key = getConceptKey('writing-programs', 'program-execution')
  assert.equal(key, 'writing-programs:program-execution')
  assert.deepEqual(parseConceptKey(key), { lessonId: 'writing-programs', conceptId: 'program-execution' })
})

test('a fresh record starts at zero and is never due', () => {
  const record = createMasteryRecord()
  assert.equal(record.score, 0)
  assert.equal(record.dueForReviewDate, null)
  assert.equal(isDueForReview(record, today), false)
})

test('score rises more for a first-try-correct answer than a retry-correct one', () => {
  const fresh = createMasteryRecord()
  const firstTry = recordQuestionOutcome(fresh, { correct: true, firstTryCorrect: true }, today)
  const retried = recordQuestionOutcome(fresh, { correct: true, firstTryCorrect: false }, today)
  assert.ok(firstTry.score > retried.score)
})

test('a resolved-wrong answer lowers the score and resets the review streak', () => {
  const fresh = createMasteryRecord()
  const afterCorrect = recordQuestionOutcome(fresh, { correct: true, firstTryCorrect: true }, today)
  const afterWrong = recordQuestionOutcome(afterCorrect, { correct: false, firstTryCorrect: false }, today)
  assert.ok(afterWrong.score < afterCorrect.score)
  assert.equal(afterWrong.reviewStreak, 0)
})

test('score clamps at 100 and never goes negative', () => {
  let record = createMasteryRecord()
  for (let i = 0; i < 20; i += 1) record = recordQuestionOutcome(record, { correct: true, firstTryCorrect: true }, today)
  assert.equal(record.score, 100)

  let low = createMasteryRecord()
  for (let i = 0; i < 20; i += 1) low = recordQuestionOutcome(low, { correct: false, firstTryCorrect: false }, today)
  assert.equal(low.score, 0)
})

test('attemptsTotal and correctFirstTry count resolutions, not raw attempts', () => {
  const fresh = createMasteryRecord()
  const first = recordQuestionOutcome(fresh, { correct: true, firstTryCorrect: true }, today)
  const second = recordQuestionOutcome(first, { correct: true, firstTryCorrect: false }, today)
  assert.equal(second.attemptsTotal, 2)
  assert.equal(second.correctFirstTry, 1)
})

test('computeNextReviewDate scales with score tier', () => {
  const low = computeNextReviewDate(10, 0, today)
  const mid = computeNextReviewDate(50, 0, today)
  const high = computeNextReviewDate(80, 0, today)
  assert.equal(low, addDaysForTest(1))
  assert.equal(mid, addDaysForTest(3))
  assert.equal(high, addDaysForTest(7))
})

test('computeNextReviewDate adds a capped review-streak bonus', () => {
  assert.equal(computeNextReviewDate(80, 3, today), addDaysForTest(10))
  assert.equal(computeNextReviewDate(80, 10, today), addDaysForTest(10))
})

test('isDueForReview treats due-today as due, and the day before as not due', () => {
  const record = { dueForReviewDate: today }
  assert.equal(isDueForReview(record, today), true)

  const tomorrow = new Date(MONDAY.getTime() + 24 * 60 * 60 * 1000).toDateString()
  assert.equal(isDueForReview({ dueForReviewDate: tomorrow }, today), false)
})

test('findDueConcepts filters to due records and sorts most-overdue first', () => {
  const twoDaysAgo = new Date(MONDAY.getTime() - 2 * 24 * 60 * 60 * 1000).toDateString()
  const yesterday = new Date(MONDAY.getTime() - 24 * 60 * 60 * 1000).toDateString()
  const tomorrow = new Date(MONDAY.getTime() + 24 * 60 * 60 * 1000).toDateString()

  const masteryByConcept = {
    'lesson-a:concept-1': { dueForReviewDate: yesterday },
    'lesson-a:concept-2': { dueForReviewDate: twoDaysAgo },
    'lesson-a:concept-3': { dueForReviewDate: tomorrow },
    'lesson-a:concept-4': { dueForReviewDate: null },
  }

  const due = findDueConcepts(masteryByConcept, today)
  assert.deepEqual(due.map((entry) => entry.conceptKey), ['lesson-a:concept-2', 'lesson-a:concept-1'])
})

function addDaysForTest(days) {
  const date = new Date(MONDAY)
  date.setDate(date.getDate() + days)
  return date.toDateString()
}
