export const DAY_INITIALS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S']
export const WEEK_LENGTH = 5
// Tier spacing follows the standard habit curve — an early win at day 3 so a
// new learner banks something before motivation fades, the first real
// achievement at a week, habit-formed at a month, then identity-level runs.
// The old 7/21/50/100 had no early win and put the first reward a full week
// out, which is the longest stretch of the whole ladder with nothing on it.
//
// Restores escalate because a longer streak is worth more to protect: losing a
// 60-day run should not cost the same single credit as losing a 3-day one.
export const STREAK_MILESTONES = [
  { days: 3, restores: 1, label: 'Getting going' },
  { days: 7, restores: 1, label: 'One week' },
  { days: 14, restores: 1, label: 'Two weeks' },
  { days: 30, restores: 2, label: 'One month' },
  { days: 60, restores: 2, label: 'Two months' },
  { days: 100, restores: 3, label: 'One hundred days' },
]

// The one place that decides what a streak length has earned. `progress.js`
// used to keep its own copy of the tier list, so changing the ladder in the UI
// silently granted the old rewards.
export function earnMilestones(streakDays, earnedDays = []) {
  const already = new Set(earnedDays)
  const earned = STREAK_MILESTONES.filter((tier) => streakDays >= tier.days && !already.has(tier.days))
  return {
    days: earned.map((tier) => tier.days),
    restores: earned.reduce((total, tier) => total + tier.restores, 0),
  }
}
// Four escalating bands matching the original day-range design (1-7 / 8-30 /
// 31-100 / 100+). There's no new mascot art behind any of this — the "growth"
// is entirely color/copy intensity layered on the same three Devy moods, so
// this only ever needs to return a treatment, never an asset path.
export const STREAK_ERAS = [
  { id: 'spark', minDays: 1, label: 'Warming up', accentClass: 'text-[#f5a623]', bgClass: 'bg-[#f5a623]', glowClass: 'shadow-[0_0_0_3px_rgba(245,166,35,0.18)]' },
  { id: 'climb', minDays: 8, label: 'Climbing', accentClass: 'text-[#ff9d3d]', bgClass: 'bg-[#ff9d3d]', glowClass: 'shadow-[0_0_0_4px_rgba(255,157,61,0.24)]' },
  { id: 'world', minDays: 31, label: 'New world unlocked', accentClass: 'text-[#ff7a3d]', bgClass: 'bg-[#ff7a3d]', glowClass: 'shadow-[0_0_0_5px_rgba(255,122,61,0.3)]' },
  { id: 'legend', minDays: 100, label: 'Legendary streak', accentClass: 'text-[#f0c964]', bgClass: 'bg-[#f0c964]', glowClass: 'shadow-[0_0_0_6px_rgba(240,201,100,0.38)]' },
]

export function getStreakEra(streakDays) {
  return [...STREAK_ERAS].reverse().find((era) => streakDays >= era.minDays) ?? STREAK_ERAS[0]
}

// The UI needs to know not just "what's been earned" but "what was *just*
// earned" to fire a one-time celebration rather than re-showing it every
// render — this is the one place that answers that, so nothing downstream
// re-derives it by diffing arrays itself.
export function findNewestMilestone(previousEarned = [], nextEarned = []) {
  const newlyEarnedDays = nextEarned.filter((day) => !previousEarned.includes(day))
  if (newlyEarnedDays.length === 0) return null
  const highestDay = Math.max(...newlyEarnedDays)
  return STREAK_MILESTONES.find((tier) => tier.days === highestDay) ?? null
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function getStreakWeek(streakDays, lastActiveDate, today = new Date()) {
  const end = startOfDay(today)
  const lastActive = lastActiveDate ? startOfDay(lastActiveDate) : null

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

export function getStreakMessage(streakDays, activeToday = false) {
  if (streakDays === 0) return { text: 'Finish a lesson to start your streak', emphasis: null }
  if (activeToday) return { text: `day streak — you're covered for today`, emphasis: `${streakDays}` }
  return { text: 'Finish a lesson today to keep your streak', emphasis: null }
}

export function isActiveToday(lastActiveDate, today = new Date()) {
  return Boolean(lastActiveDate) && lastActiveDate === today.toDateString()
}

export function getStreakHistory(streakDays, lastActiveDate, dates = [], today = new Date()) {
  const knownDates = new Set(dates)
  if (lastActiveDate && streakDays > 0) {
    const lastActive = startOfDay(lastActiveDate)
    for (let index = 0; index < Math.min(streakDays, 30); index += 1) {
      knownDates.add(new Date(lastActive.getTime() - index * DAY_MS).toDateString())
    }
  }

  const end = startOfDay(today)
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(end.getTime() - (29 - index) * DAY_MS)
    const key = date.toDateString()
    return { key, isActive: knownDates.has(key), isToday: index === 29 }
  })
}

export function getTimeUntilMidnight(now = new Date()) {
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const remaining = Math.max(0, midnight - now)
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

export function resolveStreak(streakDays, lastActiveDate, today = new Date().toDateString()) {
  if (!lastActiveDate || streakDays === 0 || lastActiveDate === today) return streakDays
  const daysSince = Math.round((startOfDay(today) - startOfDay(lastActiveDate)) / DAY_MS)
  return daysSince <= 1 ? streakDays : 0
}

export function applyStreakDecay({ streakDays, lastActiveDate, streakShieldWeek, weekIndex, streakRestoreCredits = 0 }, today, hasShield) {
  const survives = resolveStreak(streakDays, lastActiveDate, today)
  if (survives === streakDays) return { streakDays, streakShieldWeek, streakRestoreCredits, protection: null }

  const daysSince = Math.round((startOfDay(today) - startOfDay(lastActiveDate)) / DAY_MS)
  if (daysSince === 2 && hasShield && streakShieldWeek !== weekIndex) {
    return { streakDays, streakShieldWeek: weekIndex, streakRestoreCredits, protection: 'shield' }
  }
  if (daysSince === 2 && streakRestoreCredits > 0) {
    return { streakDays, streakShieldWeek, streakRestoreCredits: streakRestoreCredits - 1, protection: 'restore' }
  }
  return { streakDays: 0, streakShieldWeek, streakRestoreCredits, protection: null }
}
