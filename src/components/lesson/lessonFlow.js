// A quiz block earns a dedicated "skill check" screen once it's long enough
// to feel like a real session rather than a single check-in — below that, a
// full-screen interstitial before (and a celebration right after) a single
// question is more interruption than the content justifies.
const SKILL_CHECK_SCREEN_THRESHOLD = 3

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
    const activities = concept.activities
    const firstQuizIndex = activities.findIndex((activity) => activity.type === 'quiz')
    const hasArticleBefore = activities.some((activity) => activity.type === 'article')

    // Every quiz activity in a concept runs back-to-back once the learner
    // leaves the article, as one check — so whether that check earns a
    // dedicated screen is decided once, for the whole run, not per quiz object.
    const checkQuestionTotal = firstQuizIndex === -1 ? 0 : activities
      .filter((activity) => activity.type === 'quiz')
      .reduce((sum, activity) => sum + (activity.content?.questions?.length ?? 0), 0)

    const needsSkillCheckScreen = hasArticleBefore && firstQuizIndex !== -1 && checkQuestionTotal >= SKILL_CHECK_SCREEN_THRESHOLD

    activities.forEach((activity, activityIndex) => {
      if (activityIndex === firstQuizIndex && needsSkillCheckScreen) {
        flow.push({
          id: `${concept.id}-skill-check`,
          kind: 'skill-check',
          concept,
          conceptIndex,
          quizTitle: activity.content?.title,
          quizIntro: activity.content?.intro,
        })
      }

      // Below the threshold, a question just appears as a question — no
      // inline label either. A single question is already self-evidently a
      // check; naming it as one adds more visual weight than the thing itself.
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
