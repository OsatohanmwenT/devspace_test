import test from 'node:test'
import assert from 'node:assert/strict'
import { writingProgramsLesson } from './lessonContent.js'
import { buildLessonFlow } from './lessonFlow.js'

// Locks the shape from the "deepen writing-programs" pass: more concepts,
// same content depth, but capped at 5 questions total — no more/harder
// practice, per the explicit correction that drove this rebuild.
test('writing-programs has four concepts and no more than five questions total', () => {
  assert.equal(writingProgramsLesson.concepts.length, 4)

  const flow = buildLessonFlow(writingProgramsLesson)
  const questionSteps = flow.filter((step) => step.type === 'question')
  assert.equal(questionSteps.length, 5)
})

test('a transition follows every concept except the last', () => {
  const flow = buildLessonFlow(writingProgramsLesson)
  const transitions = flow.filter((step) => step.kind === 'transition')

  assert.equal(transitions.length, 3)
  assert.deepEqual(transitions.map((step) => step.nextConcept.id), [
    'variables-expressions',
    'naming-comments',
    'putting-it-together',
  ])
})

// Every quiz here stays small enough that no concept earns a skill-check
// interstitial — consistent with "not harder", and confirms the question
// redistribution didn't accidentally stack three onto one concept.
test('no concept crosses the skill-check threshold', () => {
  const flow = buildLessonFlow(writingProgramsLesson)
  assert.equal(flow.filter((step) => step.kind === 'skill-check').length, 0)
})

test('the lesson ends with exactly one completion step', () => {
  const flow = buildLessonFlow(writingProgramsLesson)
  assert.equal(flow.at(-1).kind, 'complete')
  assert.equal(flow.filter((step) => step.kind === 'complete').length, 1)
})

// Every article that carries personality narration has a full spoken layer
// (an intro, and a spoken line per section) — a half-authored article would
// silently fall back to verbatim text section-by-section, which is allowed,
// but this lesson was fully authored, so it should have none of those gaps.
test('every article in the lesson has a spokenIntro and a spoken line per section', () => {
  for (const concept of writingProgramsLesson.concepts) {
    for (const activity of concept.activities) {
      if (activity.type !== 'article') continue
      const article = activity.content
      assert.ok(article.spokenIntro?.length > 0, `${activity.id} is missing spokenIntro`)
      for (const section of article.sections ?? []) {
        assert.ok(section.spoken?.length > 0, `${activity.id} section "${section.title}" is missing spoken text`)
      }
    }
  }
})

// Same guarantee for quizzes — every quiz activity in this lesson should
// have a spokenIntro so Devy's commentary never falls back to the generic
// line for content that was meant to be fully voiced.
test('every quiz in the lesson has a spokenIntro', () => {
  for (const concept of writingProgramsLesson.concepts) {
    for (const activity of concept.activities) {
      if (activity.type !== 'quiz') continue
      assert.ok(activity.content.spokenIntro?.length > 0, `${activity.id} is missing spokenIntro`)
    }
  }
})
