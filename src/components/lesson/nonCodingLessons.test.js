import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLessonFlow } from './lessonFlow.js'
import { digitalMarketingLesson, technicalTeamsLesson } from './nonCodingLessons.js'

for (const lesson of [technicalTeamsLesson, digitalMarketingLesson]) {
  test(`${lesson.title} follows the standard lesson flow`, () => {
    const activities = lesson.concepts.flatMap((concept) => concept.activities)
    const flow = buildLessonFlow(lesson)

    assert.deepEqual(activities.map((activity) => activity.type), ['article', 'quiz'])
    assert.deepEqual(flow.map((step) => step.type ?? step.kind), ['article', 'question', 'question', 'complete'])
  })
}
