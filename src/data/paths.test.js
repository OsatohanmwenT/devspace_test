import test from 'node:test'
import assert from 'node:assert/strict'
import { explorePaths, getPath } from './paths.js'

for (const [pathId, lessonId] of [
  ['technical-project-coordinator', 'technical-teams-basics'],
  ['digital-marketing', 'digital-marketing-basics'],
  ['data-analyst', 'data-analysis-basics'],
]) {
  test(`${pathId} resolves to its own six region curriculum`, () => {
    const path = getPath(pathId)

    assert.equal(path.id, pathId)
    assert.equal(path.cards.length, 6)
    assert.equal(path.cards[0].state, 'current')
    assert.equal(path.cards[0].lessons[0].id, lessonId)
    assert.ok(path.cards.slice(1).every((region) => region.state === 'locked'))
    assert.ok(path.cards.slice(1).every((region) => region.lessons.every((lesson) => lesson.state === 'locked')))
  })
}

test('non coding paths never inherit machine learning lesson ids', () => {
  const machineLearningIds = new Set(getPath('machine-learning').cards.flatMap((region) => region.lessons.map((lesson) => lesson.id)))

  for (const pathId of ['technical-project-coordinator', 'digital-marketing', 'data-analyst']) {
    const lessonIds = getPath(pathId).cards.flatMap((region) => region.lessons.map((lesson) => lesson.id))
    assert.ok(lessonIds.every((lessonId) => !machineLearningIds.has(lessonId)))
  }
})

test('digital marketing is discoverable in the business and marketing category', () => {
  const path = explorePaths.find((item) => item.id === 'digital-marketing')

  assert.equal(path?.category, 'Business & Marketing')
  assert.deepEqual(path?.tools, ['Audience', 'Content', 'Analytics'])
})
