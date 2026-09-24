import { getLesson } from '../components/lesson/lessonContent.js'

export const WARM_UP_ID = 'warm-up'
const WARM_UP_SIZE = 3
const DAY_MS = 86400000

// Most recently completed first. completedAt is a toDateString(), so lessons
// finished on the same day tie — the later insertion wins, which is the order
// they were actually completed in.
function recentLessonIds(completedLessons) {
  return Object.entries(completedLessons ?? {})
    .map(([id, entry], order) => ({ id, time: Date.parse(entry?.completedAt) || 0, order }))
    .sort((a, b) => b.time - a.time || b.order - a.order)
    .map((entry) => entry.id)
}

// A lesson's check questions, ids prefixed with the lesson so questions from
// different lessons can share one round without colliding.
export function getLessonQuizQuestions(lesson) {
  return lesson.concepts.flatMap((concept) =>
    concept.activities
      .filter((activity) => activity.type === 'quiz')
      .flatMap((activity) => activity.content.questions),
  ).map((question) => ({ ...question, id: `${lesson.id}:${question.id}` }))
}

// Up to `size` questions from `pool`, starting at a point that moves once a
// day — the same round all day, a different one tomorrow, never a repeat
// within a round.
export function pickDailyRound(pool, size, now = new Date()) {
  if (!pool.length) return []
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / DAY_MS)
  const start = dayIndex % pool.length
  return Array.from({ length: Math.min(size, pool.length) }, (_, index) => pool[(start + index) % pool.length])
}

// A short review round built from the check questions of the lessons the
// learner finished last — the most recent lesson first, topped up from the one
// before it when it doesn't have enough. The starting question rotates daily so
// coming back on consecutive days doesn't replay the identical round.
export function buildWarmUp(completedLessons, { lookup = getLesson, now = new Date() } = {}) {
  const pool = []
  let sourceTitle = null
  for (const id of recentLessonIds(completedLessons)) {
    const lesson = lookup(id)
    if (!lesson) continue
    const questions = getLessonQuizQuestions(lesson)
    if (!questions.length) continue
    sourceTitle ??= lesson.title
    pool.push(...questions)
    if (pool.length >= WARM_UP_SIZE * 2) break
  }
  if (!pool.length) return null

  const questions = pickDailyRound(pool, WARM_UP_SIZE, now)

  return {
    id: WARM_UP_ID,
    eyebrow: 'Warm up',
    title: 'Warm-up',
    minutes: 1,
    sourceTitle,
    questions,
  }
}
