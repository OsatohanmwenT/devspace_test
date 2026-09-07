import test from 'node:test'
import assert from 'node:assert/strict'
import { getLessonFinish } from './lessonFinish.js'

const path = { cards: [{ id: 'basics', lessons: [{ id: 'writing-programs' }, { id: 'data-types' }] }] }
const progress = { xp: 0, dailyXp: 0, streakDays: 0, completedLessons: {} }

test('completion previews real rewards and the next authored lesson without mutating progress', () => {
  const result = getLessonFinish(path, progress, 'writing-programs')
  assert.equal(result.xp, 25)
  assert.equal(result.coins, 5)
  assert.equal(result.streakDays, 1)
  assert.equal(result.nextLesson.id, 'data-types')
  assert.deepEqual(progress.completedLessons, {})
})

test('assistance and replays award nothing but still advance learning', () => {
  for (const [saved, assisted] of [[progress, true], [{ ...progress, completedLessons: { 'writing-programs': {} } }, false]]) {
    const result = getLessonFinish(path, saved, 'writing-programs', assisted)
    assert.equal(result.xp, 0)
    assert.equal(result.coins, 0)
    assert.equal(result.nextLesson.id, 'data-types')
  }
})

test('the final lesson and unavailable content offer no dead end start button', () => {
  const done = getLessonFinish(path, { ...progress, completedLessons: { 'writing-programs': {} } }, 'data-types')
  assert.equal(done.isComplete, true)
  assert.equal(done.nextLesson, null)
  const unavailable = getLessonFinish({ cards: [{ lessons: [{ id: 'writing-programs' }, { id: 'not-authored' }] }] }, progress, 'writing-programs')
  assert.equal(unavailable.nextLesson, null)
  assert.equal(unavailable.isComplete, false)
})

test('a framework decision stops automatic lesson handoff', () => {
  const result = getLessonFinish(path, { ...progress, profile: { role: 'frontend_developer', frameworkDecision: 'pending' } }, 'program-flow')
  assert.equal(result.needsFramework, true)
  assert.equal(result.nextLesson, null)
})
