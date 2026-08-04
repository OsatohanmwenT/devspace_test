// Quiz activities are flattened to one step per question so a learner sees a
// single idea per screen and each progress segment maps to one thing to do.
function expandActivity(activity, context) {
  if (activity.type !== 'quiz') return [{ ...activity, kind: 'activity', ...context }]

  const questions = activity.content?.questions ?? []
  if (questions.length === 0) return [{ ...activity, kind: 'activity', ...context }]

  return questions.map((question, questionIndex) => ({
    id: `${activity.id}-${question.id}`,
    kind: 'activity',
    type: 'question',
    question,
    quizId: activity.id,
    questionIndex,
    questionCount: questions.length,
    ...context,
  }))
}

export function buildLessonFlow(lesson) {
  const flow = []

  lesson.concepts.forEach((concept, conceptIndex) => {
    concept.activities.forEach((activity, activityIndex) => {
      flow.push(...expandActivity(activity, { concept, conceptIndex, activityIndex }))
    })

    if (conceptIndex < lesson.concepts.length - 1) {
      flow.push({
        id: `${concept.id}-transition`,
        kind: 'transition',
        concept,
        nextConcept: lesson.concepts[conceptIndex + 1],
        transition: concept.transition,
      })
    }
  })

  flow.push({
    id: `${lesson.id}-complete`,
    kind: 'complete',
    completion: lesson.completion,
  })

  return flow
}
