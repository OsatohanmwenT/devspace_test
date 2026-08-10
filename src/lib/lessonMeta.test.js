import test from 'node:test'
import assert from 'node:assert/strict'
import { LESSON_MINUTES, LESSON_XP, formatLessonMeta, getLessonMeta } from './lessonMeta.js'

test('the XP and duration constants match what the rest of the app assumes', () => {
  assert.equal(LESSON_XP, 25)
  // Tied to outcomes.dailyGoalXp, which is built on one lesson per five minutes.
  assert.equal(LESSON_MINUTES, 5)
})

test('an authored lesson reports counts derived from its real flow', () => {
  const meta = getLessonMeta('writing-programs')

  assert.ok(meta, 'writing-programs should have authored content')
  assert.ok(meta.exerciseCount > 0)
  assert.equal(meta.exerciseCount, meta.questionCount + meta.articleCount)
  assert.ok(meta.conceptCount > 0)
})

// The point of returning null: most lesson ids in data/paths.js have no content,
// and the card omits the exercise count rather than inventing one.
test('an unauthored lesson reports nothing at all', () => {
  assert.equal(getLessonMeta('capstone-plan'), null)
  assert.equal(getLessonMeta('feature-basics'), null)
  assert.equal(getLessonMeta('does-not-exist'), null)
})

test('the formatted line always carries XP and duration, and a count only when known', () => {
  const authored = formatLessonMeta('writing-programs')
  assert.equal(authored[0], '+25 XP')
  assert.equal(authored[1], '~5 min')
  assert.equal(authored.length, 3)
  assert.match(authored[2], /exercises?$/)

  assert.deepEqual(formatLessonMeta('capstone-plan'), ['+25 XP', '~5 min'])
})
