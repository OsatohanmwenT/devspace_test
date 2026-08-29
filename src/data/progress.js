// Extension included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { getSeasonIndex, now } from '../lib/season.js'
// The streak shield/restore gate is "once per calendar week" — a real week,
// not the 28-day league season — so it keeps its own clock read via week.js
// rather than reusing the league's seasonIndex.
import { getWeekIndex, now as weekNow } from '../lib/week.js'
import { applyStreakDecay, earnMilestones } from '../lib/streak.js'
import { can, CAPABILITIES } from '../lib/entitlements.js'

const STORAGE_KEY = 'devspace-progress'

const defaultProgress = {
  xp: 0,
  // The leaderboard's ranking currency. Resets each season; distinct from
  // `xp`, which is persistent learning growth and never resets.
  seasonCoins: 0,
  // Historical total across all seasons — status/history only, never ranked.
  lifetimeCoins: 0,
  seasonIndex: null,
  leagueIndex: 0,
  // Set to the season index a Bronze top-10 finish earns a free Silver Pass
  // for; null otherwise. Valid only for that one season — see
  // lib/leagueAccess.js.
  silverPassSeasonIndex: null,
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
  // Learner-generated project/topic paths, keyed by id, shaped like an
  // authored path (see data/paths.js buildCustomPathRecord) so any of them
  // can become `profile.pathId` and flow through Home/Paths/Profile exactly
  // like a career path.
  customPaths: {},
  seenPageIntroductions: {},
  // Path ids the learner has made primary before switching away. A path
  // that stops being primary isn't lost — it's pushed here so "Also
  // learning" can offer it back rather than silently dropping it.
  pathHistory: [],
  // Leagues the learner created or joined by code, keyed by id — see
  // lib/privateLeagues.js. Ranked by the same seasonCoins everyone already
  // has; never touches official promotion/demotion or coin totals.
  privateLeagues: {},
  // Confirmed rewards not yet paid out — see lib/rewards.js and
  // components/leaderboard/PayoutCenter.jsx.
  rewardBalance: 0,
  // History/status only, never paid out from directly.
  lifetimeRewards: 0,
  // Most recent seasons' reward outcomes, newest first — [{ seasonIndex, leagueId, rank, amount }].
  seasonRewardHistory: [],
  // Completed payout requests — [{ id, amount, requestedAt, paidAt }].
  payoutHistory: [],
  // Demo-only bank details, never transmitted anywhere — { bankName, accountNumber, accountName }.
  payoutProfile: null,
  // Weekly head-to-head — see lib/h2h.js. Rides the calendar week (not the
  // league season), and never touches leagueIndex/seasonCoins itself.
  h2h: { weekIndex: null, windowStartCoins: 0, points: 0, history: [] },
}

// The pure half of loading: merge a stored payload onto the defaults and adopt
// a season if this is the first run. Split out from `loadProgress` so it can
// be tested under `node --test`, which has no `window`.
//
// A weekly cadence doesn't map onto a 28-day one, so a payload saved before
// seasons existed (recognizable by having the old `weekIndex`/`weeklyXp`
// shape but no `seasonIndex`) gets a clean cutover rather than a conversion:
// league state resets to the current season, Bronze, 0 coins. Learning state
// (xp, streaks, completions, Premium) is untouched.
export function migrateProgress(stored, seasonIndex) {
  const isPreSeason = stored && typeof stored === 'object' && 'weekIndex' in stored && !('seasonIndex' in stored)
  const merged = { ...defaultProgress, ...stored }
  if (isPreSeason) {
    delete merged.weekIndex
    delete merged.weeklyXp
    merged.seasonCoins = 0
    merged.seasonIndex = null
    merged.leagueIndex = 0
    merged.silverPassSeasonIndex = null
    merged.lastLeagueResult = null
  }
  if (merged.seasonIndex === null) merged.seasonIndex = seasonIndex
  if (!Array.isArray(merged.earnedStreakMilestones)) merged.earnedStreakMilestones = []
  if (!Array.isArray(merged.streakActivityDates)) merged.streakActivityDates = []
  if (merged.longestStreak < merged.streakDays) merged.longestStreak = merged.streakDays
  if (merged.customPaths == null || typeof merged.customPaths !== 'object') merged.customPaths = {}
  if (merged.seenPageIntroductions == null || typeof merged.seenPageIntroductions !== 'object') merged.seenPageIntroductions = {}
  if (!Array.isArray(merged.pathHistory)) merged.pathHistory = []
  if (merged.privateLeagues == null || typeof merged.privateLeagues !== 'object') merged.privateLeagues = {}
  if (!Array.isArray(merged.seasonRewardHistory)) merged.seasonRewardHistory = []
  if (!Array.isArray(merged.payoutHistory)) merged.payoutHistory = []
  if (merged.payoutProfile != null && typeof merged.payoutProfile !== 'object') merged.payoutProfile = null
  if (merged.h2h == null || typeof merged.h2h !== 'object') merged.h2h = { weekIndex: null, windowStartCoins: 0, points: 0, history: [] }
  if (!Array.isArray(merged.h2h.history)) merged.h2h = { ...merged.h2h, history: [] }
  return merged
}

// Adds or updates a learner-generated path record. Kept separate from
// switchPrimaryPath so building a route and making it primary are two
// explicit steps, not one hidden inside the other.
export function saveCustomPath(current, pathRecord) {
  return { ...current, customPaths: { ...current.customPaths, [pathRecord.id]: pathRecord } }
}

export function markPageIntroductionSeen(current, introductionId) {
  return { ...current, seenPageIntroductions: { ...current.seenPageIntroductions, [introductionId]: true } }
}

// Makes `pathId` the primary path (`profile.pathId`). The path it replaces
// isn't lost — it's pushed onto history so "Also learning" can offer it
// back, deduped so switching back and forth doesn't pile up repeats.
export function switchPrimaryPath(current, pathId) {
  const previousPathId = current.profile?.pathId
  const history = previousPathId && previousPathId !== pathId
    ? [previousPathId, ...current.pathHistory.filter((id) => id !== previousPathId && id !== pathId)]
    : current.pathHistory.filter((id) => id !== pathId)
  return {
    ...current,
    pathHistory: history.slice(0, 5),
    profile: { ...current.profile, pathId },
  }
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return migrateProgress(raw ? JSON.parse(raw) : {}, getSeasonIndex(now()))
  } catch {
    return migrateProgress({}, getSeasonIndex(now()))
  }
}

// Every way of earning XP — a lesson, a practice session, starting a mission —
// touches the same three counters plus the streak. Keeping that in one place is
// what makes the daily goal trustworthy: `dailyXp` has to roll over on a new
// day, and it only takes one caller forgetting for the ring to read wrong.
//
// This only ever touches `xp` (lifetime learning growth) — never the
// leaderboard's Season Devy Coins. Coins are awarded separately by
// `applyCoins`, because the spec's anti-farming rule means they aren't
// earned by the same events XP is (a same-day retry is worth XP to Premium
// but never worth coins to anyone).
export function applyActivity(current, xpGain, today = new Date().toDateString(), timestamp = weekNow()) {
  const isNewDay = current.dailyXpDate !== today
  const decay = applyStreakDecay(
    { ...current, weekIndex: getWeekIndex(timestamp) },
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

// The only place Season Devy Coins are ever added, mirroring applyActivity's
// shape. No Premium branch — see lib/coins.js for why.
export function applyCoins(current, coinGain) {
  if (coinGain <= 0) return current
  return {
    ...current,
    seasonCoins: current.seasonCoins + coinGain,
    lifetimeCoins: current.lifetimeCoins + coinGain,
  }
}

// Practice awards a flat rate, mirroring LESSON_XP.
export const PRACTICE_XP = 10

// Free learners only earn XP the first time a session is completed. Premium
// also earns it on a replay, but only once per day. The results screen has to
// state the award before it is banked, and `recordPracticeCompletion` has to
// bank exactly that amount — so the rule lives here rather than in either.
export function getPracticeXpAward(progress, sessionId, today = new Date().toDateString()) {
  const priorCompletion = progress.completedSessions?.[sessionId]
  if (!priorCompletion) return PRACTICE_XP
  if (priorCompletion.completedAt !== today && can(progress, CAPABILITIES.REPLAY_XP)) return PRACTICE_XP
  return 0
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

// Returns whether the write actually landed — most callers don't check
// (the in-memory state already updated regardless), but a large payload
// (e.g. a profile photo data URL) can legitimately blow the browser's
// storage quota, and that failure is otherwise silent: the UI would keep
// believing the save worked until the next reload lost it. Callers that
// can react to a failed save (a save-and-notify flow) should check this.
export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    // Storage can be unavailable in private mode, or full/over quota; the
    // session still works in memory.
    return false
  }
}
