import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLessonFlow } from './lessonFlow.js'

function makeLesson(conceptCount) {
  return {
    id: 'test-lesson',
    completion: {},
    concepts: Array.from({ length: conceptCount }, (_, index) => ({
      id: `concept-${index + 1}`,
      title: `Concept ${index + 1}`,
      transition: {},
      activities: [
        { id: `concept-${index + 1}-learn`, type: 'article' },
        { id: `concept-${index + 1}-check`, type: 'quiz' },
      ],
    })),
  }
}

test('builds a one-concept lesson without an intermediate transition', () => {
  const flow = buildLessonFlow(makeLesson(1))

  assert.deepEqual(flow.map((step) => step.kind), ['activity', 'activity', 'complete'])
})

test('inserts a transition between two concepts', () => {
  const flow = buildLessonFlow(makeLesson(2))

  assert.deepEqual(flow.map((step) => step.kind), [
    'activity',
    'activity',
    'transition',
    'activity',
    'activity',
    'complete',
  ])
  assert.equal(flow[2].nextConcept.title, 'Concept 2')
})

test('supports three ordered concepts and ends once with lesson completion', () => {
  const flow = buildLessonFlow(makeLesson(3))

  assert.equal(flow.filter((step) => step.kind === 'transition').length, 2)
  assert.equal(flow.at(-1).kind, 'complete')
  assert.equal(flow.length, 9)
})
