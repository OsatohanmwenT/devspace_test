import { getDailyXp } from '../data/progress.js'

// Today's three quests — the one definition Home's checklist and the
// end-of-lesson / end-of-practice progress screens all read, so a quest can't
// say "done" in one place and "0/1" in another.
export function getDailyQuests({ dailyXp = 0, xpGoal = 1, lessonDoneToday = false, practiceDoneToday = false }) {
  return [
    { id: 'xp', label: `Earn ${xpGoal} XP`, current: Math.min(dailyXp, xpGoal), target: xpGoal },
    { id: 'lesson', label: 'Finish a lesson', current: lessonDoneToday ? 1 : 0, target: 1 },
    { id: 'practice', label: 'Warm up or practice', current: practiceDoneToday ? 1 : 0, target: 1 },
  ].map((quest) => ({ ...quest, done: quest.current >= quest.target }))
}

const doneOn = (record, today) => Object.values(record ?? {}).some((entry) => entry?.completedAt === today)

export function getDailyQuestsFromProgress(progress, xpGoal, today = new Date().toDateString()) {
  return getDailyQuests({
    dailyXp: getDailyXp(progress, today),
    xpGoal,
    lessonDoneToday: doneOn(progress.completedLessons, today),
    practiceDoneToday: doneOn(progress.completedSessions, today),
  })
}

// True when any quest moved between two snapshots — the progress screen only
// earns its place when there's something to show filling up.
export function questsAdvanced(before, after) {
  return after.some((quest, index) => quest.current > (before[index]?.current ?? 0))
}
