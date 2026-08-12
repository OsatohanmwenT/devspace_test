import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLessonFlow } from './lessonFlow.js'
import { contentCreationLesson, digitalMarketingLesson, graphicDesignLesson, socialMediaLesson, technicalTeamsLesson, videoEditingLesson } from './nonCodingLessons.js'

for (const lesson of [technicalTeamsLesson, digitalMarketingLesson, videoEditingLesson, contentCreationLesson, socialMediaLesson, graphicDesignLesson]) {
  test(`${lesson.title} follows the standard lesson flow`, () => {
    const activities = lesson.concepts.flatMap((concept) => concept.activities)
    const flow = buildLessonFlow(lesson)

    assert.deepEqual(activities.map((activity) => activity.type), ['article', 'quiz'])
    const expected = lesson === technicalTeamsLesson || lesson === digitalMarketingLesson
      ? ['article', 'question', 'question', 'complete']
      : ['article', 'question', 'complete']
    assert.deepEqual(flow.map((step) => step.type ?? step.kind), expected)
  })
}
