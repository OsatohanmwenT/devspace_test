import test from 'node:test'
import assert from 'node:assert/strict'
import { getLessonTopics, getRegionTopics, learningResources } from './learningResources.js'

test('every topic carries the fields both surfaces render', () => {
  const topics = Object.values(learningResources).flatMap((resource) => resource.topics)
  assert.ok(topics.length > 0)

  for (const topic of topics) {
    assert.ok(topic.id, 'topic needs an id')
    assert.ok(topic.title, `${topic.id} needs a title`)
    assert.ok(topic.lessonId, `${topic.id} needs a lessonId`)
    assert.ok(topic.lessonTitle, `${topic.id} needs a lessonTitle`)

    // Cheatsheet leads with code, so syntax and example must always exist.
    assert.ok(topic.cheatsheet?.syntax, `${topic.id} is missing cheatsheet syntax`)
    assert.ok(topic.cheatsheet?.example, `${topic.id} is missing cheatsheet example`)
    assert.ok(topic.cheatsheet?.rule, `${topic.id} is missing cheatsheet rule`)
    assert.ok(topic.cheatsheet?.mistake, `${topic.id} is missing cheatsheet mistake`)

    assert.ok(topic.guidebook?.mentalModel, `${topic.id} is missing a mental model`)
    assert.ok(topic.guidebook?.code, `${topic.id} is missing guidebook code`)
    assert.ok(Array.isArray(topic.guidebook?.mistakes), `${topic.id} needs a mistakes array`)
    assert.ok(topic.guidebook?.takeaway, `${topic.id} is missing a takeaway`)
  }
})

test('region topics resolve, and unknown regions return empty rather than throwing', () => {
  assert.ok(getRegionTopics('python-foundations').length > 0)
  assert.deepEqual(getRegionTopics('does-not-exist'), [])
})

test('lesson topics resolve for the in-lesson cheatsheet', () => {
  const topics = getLessonTopics('writing-programs')
  assert.ok(topics.length > 0, 'writing-programs should have reference topics')
  assert.ok(topics.every((topic) => topic.lessonId === 'writing-programs'))
})

test('a lesson with no authored reference returns empty, so the button stays hidden', () => {
  assert.deepEqual(getLessonTopics('capstone-present'), [])
  assert.deepEqual(getLessonTopics('not-a-lesson'), [])
})

test('reference is never gated — every authored topic is returned', () => {
  const region = learningResources['python-foundations']
  assert.equal(getRegionTopics('python-foundations').length, region.topics.length)
})
