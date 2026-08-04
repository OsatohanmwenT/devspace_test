export function buildLessonFlow(lesson) {
  const flow = []

  lesson.concepts.forEach((concept, conceptIndex) => {
    concept.activities.forEach((activity, activityIndex) => {
      flow.push({
        ...activity,
        kind: 'activity',
        concept,
        conceptIndex,
        activityIndex,
      })
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
