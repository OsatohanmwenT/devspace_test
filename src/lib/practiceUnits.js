import { getLesson } from '../components/lesson/lessonContent.js'
import { practiceSessions } from '../data/practice.js'
import { hasAuthoredContent, isLessonComplete } from './pathProgress.js'
import { getLessonQuizQuestions, pickDailyRound } from './warmUp.js'

const UNIT_PREFIX = 'unit:'
const ROUND_SIZE = 5

export const unitPracticeId = (regionId) => `${UNIT_PREFIX}${regionId}`
export const isUnitPracticeId = (id) => typeof id === 'string' && id.startsWith(UNIT_PREFIX)

// Practice isn't a catalogue to browse — each unit (a region of the path)
// earns a practice set once its checkpoint is passed, the way Brilliant gates
// practice behind a skill check. A unit with no checkpoint unlocks once every
// lesson in it is done. The set is built from what was actually taught: the
// check questions of the unit's finished lessons, plus the catalogue sessions
// written for that unit (`unitIds` in data/practice).
export function getPracticeUnits(path, completedLessons = {}, { lookup = getLesson, sessions = practiceSessions, now = new Date() } = {}) {
  return (path?.cards ?? [])
    .filter((region) => (region.lessons ?? []).length > 0 && hasAuthoredContent(region))
    .map((region) => {
      const lessons = region.lessons
      const checkpointIndex = lessons.findIndex((lesson) => lesson.checkpoint)
      const checkpoint = checkpointIndex >= 0 ? lessons[checkpointIndex] : null
      // Everything up to and including the checkpoint is what stands between
      // the learner and this unit's practice.
      const gate = checkpoint ? lessons.slice(0, checkpointIndex + 1) : lessons
      const gateDone = gate.filter((lesson) => isLessonComplete(lesson, completedLessons)).length
      const unlocked = gateDone === gate.length

      const lessonQuestions = lessons
        .filter((lesson) => isLessonComplete(lesson, completedLessons))
        .flatMap((lesson) => {
          const content = lookup(lesson.id)
          return content ? getLessonQuizQuestions(content) : []
        })
      const catalogueQuestions = sessions
        .filter((session) => session.unitIds?.includes(region.id))
        .flatMap((session) => session.questions.map((question) => ({ ...question, id: `${session.id}:${question.id}` })))
      const pool = [...lessonQuestions, ...catalogueQuestions]
      const id = unitPracticeId(region.id)

      return {
        id,
        regionId: region.id,
        title: region.title,
        level: region.level,
        image: region.image,
        unlocked,
        requirement: checkpoint
          ? /checkpoint/i.test(checkpoint.title) ? `Pass the ${checkpoint.title}` : `Pass the ${checkpoint.title} checkpoint`
          : lessons.length === 1
            ? `Finish ${lessons[0].title}`
            : `Finish every lesson in ${region.title}`,
        gateDone,
        gateTotal: gate.length,
        questionCount: pool.length,
        session: unlocked && pool.length
          ? {
              id,
              eyebrow: 'Unit practice',
              title: region.title,
              minutes: Math.max(1, Math.round(Math.min(ROUND_SIZE, pool.length) * 0.8)),
              questions: pickDailyRound(pool, ROUND_SIZE, now),
            }
          : null,
      }
    })
}
