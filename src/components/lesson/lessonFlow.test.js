import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLessonFlow } from './lessonFlow.js'

function makeQuiz(conceptIndex, questionCount) {
  return {
    questions: Array.from({ length: questionCount }, (_, index) => ({
      id: `c${conceptIndex + 1}-q${index + 1}`,
      type: 'multiple-choice',
      prompt: `Question ${index + 1}`,
      options: ['a', 'b'],
      correctIndex: 0,
    })),
  }
}

function makeLesson(conceptCount, questionsPerQuiz = 1) {
  return {
    id: 'test-lesson',
    completion: {},
    concepts: Array.from({ length: conceptCount }, (_, index) => ({
      id: `concept-${index + 1}`,
      title: `Concept ${index + 1}`,
      transition: {},
      activities: [
        { id: `concept-${index + 1}-learn`, type: 'article' },
        { id: `concept-${index + 1}-check`, type: 'quiz', content: makeQuiz(index, questionsPerQuiz) },
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

test('expands a multi-question quiz into one step per question', () => {
  const flow = buildLessonFlow(makeLesson(1, 3))
  const questionSteps = flow.filter((step) => step.type === 'question')

  assert.equal(questionSteps.length, 3)
  assert.deepEqual(questionSteps.map((step) => step.questionIndex), [0, 1, 2])
  assert.deepEqual(questionSteps.map((step) => step.id), [
    'concept-1-check-c1-q1',
    'concept-1-check-c1-q2',
    'concept-1-check-c1-q3',
  ])
  // article + 3 questions + complete
  assert.equal(flow.length, 5)
})

test('carries the question payload and its owning quiz onto each step', () => {
  const [, questionStep] = buildLessonFlow(makeLesson(1, 2))

  assert.equal(questionStep.quizId, 'concept-1-check')
  assert.equal(questionStep.question.prompt, 'Question 1')
  assert.equal(questionStep.questionCount, 2)
})

test('leaves a quiz with no authored questions as a single step', () => {
  const lesson = makeLesson(1)
  lesson.concepts[0].activities[1].content = { questions: [] }

  const flow = buildLessonFlow(lesson)

  assert.equal(flow.filter((step) => step.type === 'question').length, 0)
  assert.deepEqual(flow.map((step) => step.kind), ['activity', 'activity', 'complete'])
})
