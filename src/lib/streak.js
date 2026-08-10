// Streak week strip, lifted out of main.jsx so it can be tested.

export const DAY_INITIALS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S']
export const WEEK_LENGTH = 5
const DAY_MS = 24 * 60 * 60 * 1000

// The last five days ending today, with a day marked active when it falls
// inside the current streak — a streak of N days ending on lastActiveDate means
// exactly those N days were active, so no extra stored history is needed.
export function getStreakWeek(streakDays, lastActiveDate, today = new Date()) {
  const end = new Date(today)
  end.setHours(0, 0, 0, 0)

  const lastActive = lastActiveDate ? new Date(lastActiveDate) : null
  if (lastActive) lastActive.setHours(0, 0, 0, 0)

  return Array.from({ length: WEEK_LENGTH }, (_, index) => {
    const date = new Date(end.getTime() - (WEEK_LENGTH - 1 - index) * DAY_MS)
    const daysBeforeLastActive = lastActive ? Math.round((lastActive - date) / DAY_MS) : -1
    return {
      key: date.toDateString(),
      label: DAY_INITIALS[date.getDay()],
      isActive: daysBeforeLastActive >= 0 && daysBeforeLastActive < streakDays,
      isToday: index === WEEK_LENGTH - 1,
    }
  })
}

// The old copy was the fixed string "Solve 3 problems to start a streak", which
// contradicted the streak count rendered directly above it.
export function getStreakMessage(streakDays, activeToday = false) {
  if (streakDays === 0) return { text: 'Finish a lesson to start your streak', emphasis: null }
  if (activeToday) return { text: `day streak — you're covered for today`, emphasis: `${streakDays}` }
  return { text: 'Finish a lesson today to keep your streak', emphasis: null }
}

export function isActiveToday(lastActiveDate, today = new Date()) {
  return Boolean(lastActiveDate) && lastActiveDate === today.toDateString()
}
