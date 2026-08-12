import test from 'node:test'
import assert from 'node:assert/strict'
import { explorePaths, getPath } from './paths.js'

for (const [pathId, lessonId] of [
  ['technical-project-coordinator', 'technical-teams-basics'],
  ['digital-marketing', 'digital-marketing-basics'],
  ['data-analyst', 'data-analysis-basics'],
  ['video-editor', 'video-editing-basics'],
  ['content-creator', 'content-creation-basics'],
  ['social-media-manager', 'social-media-basics'],
  ['graphic-designer', 'graphic-design-basics'],
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

  for (const pathId of ['technical-project-coordinator', 'digital-marketing', 'data-analyst', 'video-editor', 'content-creator', 'social-media-manager', 'graphic-designer']) {
    const lessonIds = getPath(pathId).cards.flatMap((region) => region.lessons.map((lesson) => lesson.id))
    assert.ok(lessonIds.every((lessonId) => !machineLearningIds.has(lessonId)))
  }
})

test('new creative paths use their own categories and tools', () => {
  const expected = {
    'video-editor': ['Content & Media', ['Story', 'Audio', 'Colour']],
    'content-creator': ['Content & Media', ['Ideas', 'Production', 'Publishing']],
    'social-media-manager': ['Business & Marketing', ['Strategy', 'Community', 'Analytics']],
    'graphic-designer': ['Design & Product', ['Typography', 'Layout', 'Brand design']],
  }

  for (const [id, [category, tools]] of Object.entries(expected)) {
    const path = explorePaths.find((item) => item.id === id)
    assert.equal(path?.category, category)
    assert.deepEqual(path?.tools, tools)
  }
})

test('digital marketing is discoverable in the business and marketing category', () => {
  const path = explorePaths.find((item) => item.id === 'digital-marketing')

  assert.equal(path?.category, 'Business & Marketing')
  assert.deepEqual(path?.tools, ['Audience', 'Content', 'Analytics'])
})
