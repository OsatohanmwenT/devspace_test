// What a lesson card is allowed to claim.
//
// Lessons carry no duration, no per-lesson XP and no exercise count in the
// data. Rather than authoring those numbers by hand — the same unverifiable
// literal that made `progressValue` untrustworthy — the UI shows two product
// constants plus one count that is genuinely derivable, and omits the count
// entirely for the lessons that have no content yet.

import { getLesson } from '../components/lesson/lessonContent.js'
import { buildLessonFlow } from '../components/lesson/lessonFlow.js'

// Every lesson completion awards the same XP; this was a magic literal repeated
// three times in main.jsx.
export const LESSON_XP = 25

// The same basis as the daily XP goal, which assumes roughly one lesson per
// five minutes (see outcomes.dailyGoalXp in data/onboarding.js). Deriving a
// per-lesson estimate instead would make the goal ring stop meaning anything.
export const LESSON_MINUTES = 5

// Null for the many lesson ids that have no authored content — callers render
// the exercise count conditionally rather than guessing at one.
export function getLessonMeta(lessonId) {
  const lesson = getLesson(lessonId)
  if (!lesson) return null

  const flow = buildLessonFlow(lesson)
  const activities = flow.filter((step) => step.kind === 'activity')

  return {
    exerciseCount: activities.length,
    questionCount: activities.filter((step) => step.type === 'question').length,
    articleCount: activities.filter((step) => step.type === 'article').length,
    conceptCount: lesson.concepts.length,
  }
}

export function formatLessonMeta(lessonId) {
  const parts = [`+${LESSON_XP} XP`, `~${LESSON_MINUTES} min`]
  const meta = getLessonMeta(lessonId)
  if (meta) parts.push(meta.exerciseCount === 1 ? '1 exercise' : `${meta.exerciseCount} exercises`)
  return parts
}
