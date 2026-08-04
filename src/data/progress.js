import { getWeekIndex, now } from '../lib/week'

const STORAGE_KEY = 'devspace-progress'

const defaultProgress = {
  xp: 0,
  weeklyXp: 0,
  weekIndex: null,
  leagueIndex: 0,
  streakDays: 0,
  lastActiveDate: null,
  lastLeagueResult: null,
  completedSessions: {},
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

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable in private mode; the session still works in memory.
  }
}
