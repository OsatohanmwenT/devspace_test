// Extension included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { getWeekIndex, now } from '../lib/week.js'

const STORAGE_KEY = 'devspace-progress'

const defaultProgress = {
  xp: 0,
  weeklyXp: 0,
  weekIndex: null,
  leagueIndex: 0,
  streakDays: 0,
  lastActiveDate: null,
  // XP earned today, against the daily goal from onboarding. Tracked separately
  // from `xp` (lifetime) and `weeklyXp` because neither can answer "how far
  // through today's goal am I?".
  dailyXp: 0,
  dailyXpDate: null,
  lastLeagueResult: null,
  completedSessions: {},
  completedLessons: {},
  // Absent until onboarding completes — its absence is the first-run signal.
  profile: null,
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const stored = raw ? { ...defaultProgress, ...JSON.parse(raw) } : { ...defaultProgress }
    // First run: adopt the current week so the league starts counting immediately.
    if (stored.weekIndex === null) stored.weekIndex = getWeekIndex(now())
    return stored
  } catch {
    return { ...defaultProgress, weekIndex: getWeekIndex(now()) }
  }
}

// Every way of earning XP — a lesson, a practice session, starting a mission —
// touches the same four counters plus the streak. Keeping that in one place is
// what makes the daily goal trustworthy: `dailyXp` has to roll over on a new
// day, and it only takes one caller forgetting for the ring to read wrong.
export function applyActivity(current, xpGain, today = new Date().toDateString()) {
  const isNewDay = current.dailyXpDate !== today

  return {
    ...current,
    xp: current.xp + xpGain,
    weeklyXp: current.weeklyXp + xpGain,
    dailyXp: (isNewDay ? 0 : current.dailyXp) + xpGain,
    dailyXpDate: today,
    streakDays: current.lastActiveDate === today ? current.streakDays : current.streakDays + 1,
    lastActiveDate: today,
  }
}

// Today's XP is stale once the date rolls over, so reading it has to check the
// stamp rather than trusting the stored number.
export function getDailyXp(progress, today = new Date().toDateString()) {
  return progress.dailyXpDate === today ? progress.dailyXp : 0
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable in private mode; the session still works in memory.
  }
}
