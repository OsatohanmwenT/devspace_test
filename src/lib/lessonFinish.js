import { applyActivity } from '../data/progress.js'
import { getLesson } from '../components/lesson/lessonContent.js'
import { LESSON_XP } from './lessonMeta.js'
import { getLessonCoinAward } from './coins.js'
import { derivePathProgress } from './pathProgress.js'
import { isFrameworkCheckpointReady } from './onboarding.js'

export function getLessonFinish(path, progress, lessonId, assisted = false) {
  const xp = !assisted && !progress.completedLessons?.[lessonId] ? LESSON_XP : 0
  const completedLessons = { ...progress.completedLessons, [lessonId]: { completedAt: new Date().toDateString() } }
  const after = derivePathProgress(path, completedLessons)
  const needsFramework = isFrameworkCheckpointReady(progress.profile, completedLessons)
  return {
    xp,
    coins: getLessonCoinAward(progress, lessonId, assisted),
    streakDays: applyActivity(progress, xp).streakDays,
    nextLesson: !needsFramework && after.currentLesson && getLesson(after.currentLesson.id) ? after.currentLesson : null,
    needsFramework,
    isComplete: after.isComplete,
  }
}
