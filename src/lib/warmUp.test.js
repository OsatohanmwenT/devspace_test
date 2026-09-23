import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWarmUp, WARM_UP_ID } from './warmUp.js'

const quiz = (...ids) => ({ type: 'quiz', content: { questions: ids.map((id) => ({ id, type: 'multiple-choice' })) } })
const lessons = {
  older: { id: 'older', title: 'Older', concepts: [{ activities: [quiz('o1', 'o2')] }] },
  recent: { id: 'recent', title: 'Recent', concepts: [{ activities: [{ type: 'article' }, quiz('r1')] }] },
  empty: { id: 'empty', title: 'Empty', concepts: [{ activities: [{ type: 'article' }] }] },
}
const lookup = (id) => lessons[id] ?? null
const now = new Date(2026, 8, 23)

test('no completed lessons means no warm-up', () => {
  assert.equal(buildWarmUp({}, { lookup, now }), null)
  assert.equal(buildWarmUp({ empty: { completedAt: 'Mon Sep 21 2026' } }, { lookup, now }), null)
})

test('pulls from the most recent lesson first and tops up from earlier ones', () => {
  const warmUp = buildWarmUp(
    {
      older: { completedAt: 'Sat Sep 19 2026' },
      recent: { completedAt: 'Mon Sep 21 2026' },
      empty: { completedAt: 'Tue Sep 22 2026' },
    },
    { lookup, now },
  )
  assert.equal(warmUp.id, WARM_UP_ID)
  assert.equal(warmUp.sourceTitle, 'Recent')
  assert.equal(warmUp.questions.length, 3)
  assert.deepEqual(new Set(warmUp.questions.map((question) => question.id)), new Set(['recent:r1', 'older:o1', 'older:o2']))
})

test('never repeats a question when the pool is smaller than a round', () => {
  const warmUp = buildWarmUp({ recent: { completedAt: 'Mon Sep 21 2026' } }, { lookup, now })
  assert.deepEqual(warmUp.questions.map((question) => question.id), ['recent:r1'])
})
