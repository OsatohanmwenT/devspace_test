// Extension included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { getWeekIndex, now } from '../lib/week.js'
import { applyStreakDecay, earnMilestones } from '../lib/streak.js'
import { can, CAPABILITIES } from '../lib/entitlements.js'

const STORAGE_KEY = 'devspace-progress'

const defaultProgress = {
  xp: 0,
  weeklyXp: 0,
  weekIndex: null,
  leagueIndex: 0,
  streakDays: 0,
  lastActiveDate: null,
  longestStreak: 0,
  streakRestoreCredits: 0,
  earnedStreakMilestones: [],
  streakActivityDates: [],
  lastStreakProtection: null,
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
  // Entitlement. Absent from any payload stored before this field existed —
  // the spread below supplies `false`, since JSON can't encode `undefined` to
  // defeat it, so no migration step is needed.
  isPremium: false,
  premiumPlanId: null,
  // Kept even after cancelling, so a later re-subscribe doesn't reset tenure.
  premiumSince: null,
  // The weekIndex a streak shield was last spent, so it can be spent at most
  // once a week.
  streakShieldWeek: null,
}

// The pure half of loading: merge a stored payload onto the defaults and adopt
// a week if this is the first run. Split out from `loadProgress` so it can be
// tested under `node --test`, which has no `window`.
export function migrateProgress(stored, weekIndex) {
  const merged = { ...defaultProgress, ...stored }
  if (merged.weekIndex === null) merged.weekIndex = weekIndex
  if (!Array.isArray(merged.earnedStreakMilestones)) merged.earnedStreakMilestones = []
  if (!Array.isArray(merged.streakActivityDates)) merged.streakActivityDates = []
  if (merged.longestStreak < merged.streakDays) merged.longestStreak = merged.streakDays
  return merged
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return migrateProgress(raw ? JSON.parse(raw) : {}, getWeekIndex(now()))
  } catch {
    return migrateProgress({}, getWeekIndex(now()))
  }
}

// Every way of earning XP — a lesson, a practice session, starting a mission —
// touches the same four counters plus the streak. Keeping that in one place is
// what makes the daily goal trustworthy: `dailyXp` has to roll over on a new
// day, and it only takes one caller forgetting for the ring to read wrong.
export function applyActivity(current, xpGain, today = new Date().toDateString()) {
  const isNewDay = current.dailyXpDate !== today
  const decay = applyStreakDecay(
    current,
    today,
    can(current, CAPABILITIES.STREAK_SHIELD),
  )
  const nextStreakDays = current.lastActiveDate === today ? decay.streakDays : decay.streakDays + 1
  const earnedStreakMilestones = [...(current.earnedStreakMilestones ?? [])]
  const newMilestones = earnMilestones(nextStreakDays, earnedStreakMilestones)
  const streakActivityDates = current.streakActivityDates ?? []
  const nextActivityDates = streakActivityDates.includes(today)
    ? streakActivityDates
    : [...streakActivityDates, today].slice(-30)

  return {
    ...current,
    xp: current.xp + xpGain,
    weeklyXp: current.weeklyXp + xpGain,
    dailyXp: (isNewDay ? 0 : current.dailyXp) + xpGain,
    dailyXpDate: today,
    streakDays: nextStreakDays,
    lastActiveDate: today,
    longestStreak: Math.max(current.longestStreak ?? 0, nextStreakDays),
    streakRestoreCredits: decay.streakRestoreCredits + newMilestones.restores,
    earnedStreakMilestones: [...earnedStreakMilestones, ...newMilestones.days],
    streakActivityDates: nextActivityDates,
    lastStreakProtection: decay.protection,
    streakShieldWeek: decay.streakShieldWeek,
  }
}

// Today's XP is stale once the date rolls over, so reading it has to check the
// stamp rather than trusting the stored number.
export function getDailyXp(progress, today = new Date().toDateString()) {
  return progress.dailyXpDate === today ? progress.dailyXp : 0
}

// There is no billing behind this — it is a demo activation the learner can
// turn off any time (see PlansView). `premiumSince` is set only the first time,
// so re-subscribing after cancelling keeps the original tenure.
export function activatePremium(current, planId, today = new Date().toDateString()) {
  return {
    ...current,
    isPremium: true,
    premiumPlanId: planId,
    premiumSince: current.premiumSince ?? today,
  }
}

export function deactivatePremium(current) {
  return { ...current, isPremium: false, premiumPlanId: null }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable in private mode; the session still works in memory.
  }
}
