// Extension included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { getSeasonIndex, getWeekIndex, now } from '../lib/week.js'
import { applyStreakDecay, earnMilestones } from '../lib/streak.js'
import { can, CAPABILITIES } from '../lib/entitlements.js'
import { createMasteryRecord, getConceptKey, recordQuestionOutcome } from '../lib/mastery.js'

const STORAGE_KEY = 'devspace-progress'

const defaultProgress = {
  xp: 0,
  weekIndex: null,
  // The league's own 28-day clock — independent of `weekIndex` above, which
  // exists only to rate-limit the streak shield to once per calendar week.
  seasonIndex: null,
  leagueIndex: 0,
  streakDays: 0,
  lastActiveDate: null,
  longestStreak: 0,
  streakRestoreCredits: 0,
  earnedStreakMilestones: [],
  streakActivityDates: [],
  lastStreakProtection: null,
  // XP earned today, against the daily goal from onboarding. Tracked separately
  // from `xp` (lifetime) because it can't answer "how far through today's
  // goal am I?".
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
  // Hidden learning-evidence signal, keyed `${lessonId}:${conceptId}` (see
  // lib/mastery.js). Never rendered to the learner directly — it only
  // decides what's due for a reinforcement check.
  masteryByConcept: {},
  // A separate, visible achievement currency — never a stand-in for XP and
  // never converted to money directly (see addCoins/lib/rewardConfig.js).
  // Lifetime, never resets.
  devyCoins: 0,
  // The official leaderboard score for the current 28-day season — resets to
  // 0 each season alongside `seasonIndex`, unlike `devyCoins` above.
  seasonDevyCoins: 0,
  // Confirmed money not yet requested for bank payout. Distinct from a
  // "projected" reward (a live estimate from the current season's rank,
  // computed on demand — never stored, so it can never be confused with
  // real money) — see lib/payouts.js for the whole reward-to-payout lifecycle.
  rewardBalance: 0,
  // Everything ever confirmed, independent of payout status. Never resets.
  lifetimeRewards: 0,
  // One settled-season reward per entry, `under_review` -> `confirmed`.
  rewardHistory: [],
  // At most one payout in flight at a time: `processing` -> `sent` -> `paid`.
  // Null when nothing has been requested.
  pendingPayout: null,
  // Payouts that finished reaching `paid`, kept for the reward history screen.
  paidPayouts: [],
  // { bank, accountNumber, accountName, verified } — prepared for a future
  // real payment-processor integration; this demo only ever stores what the
  // learner typed, never calls out to anything.
  payoutMethod: null,
  // The highest league a season's *rank* has ever earned, independent of
  // whether access was actually granted — the achievement is never erased
  // just because Pro lapsed or was never bought (see lib/leagueAccess.js).
  highestQualifiedLeagueIndex: 0,
  // Earned Silver access, one season at a time — see lib/leagueAccess.js for
  // the grant/spend rules. `leagueIndex` above is only ever moved into a
  // Pro-required league by a gate that checks this array or isPremium first.
  leaguePasses: [],
  // The season `leagueIndex` was last validated for — lets a mid-season Pro
  // lapse finish out the season it already legitimately entered, while still
  // catching a `leagueIndex` that never went through the gate at all for the
  // season currently in progress. See sanitizeLeagueAccess.
  leagueAccessGrantedForSeason: null,
  // { seasonIndex, rank } — captured the first time a learner has any coins
  // on the board each season, so the season recap can show "started at #N"
  // rather than inventing a day-one rank after the fact.
  seasonStartRank: null,
}

// The pure half of loading: merge a stored payload onto the defaults and
// adopt a week/season if this is the first run. Split out from `loadProgress`
// so it can be tested under `node --test`, which has no `window`.
export function migrateProgress(stored, weekIndex, seasonIndex) {
  const merged = { ...defaultProgress, ...stored }
  if (merged.weekIndex === null) merged.weekIndex = weekIndex
  if (merged.seasonIndex === null) merged.seasonIndex = seasonIndex
  if (typeof merged.seasonDevyCoins !== 'number') merged.seasonDevyCoins = 0
  if (!Array.isArray(merged.earnedStreakMilestones)) merged.earnedStreakMilestones = []
  if (!Array.isArray(merged.streakActivityDates)) merged.streakActivityDates = []
  if (merged.longestStreak < merged.streakDays) merged.longestStreak = merged.streakDays
  if (merged.customPaths == null || typeof merged.customPaths !== 'object') merged.customPaths = {}
  if (merged.seenPageIntroductions == null || typeof merged.seenPageIntroductions !== 'object') merged.seenPageIntroductions = {}
  if (!Array.isArray(merged.pathHistory)) merged.pathHistory = []
  if (merged.masteryByConcept == null || typeof merged.masteryByConcept !== 'object') merged.masteryByConcept = {}
  if (typeof merged.devyCoins !== 'number') merged.devyCoins = 0
  if (typeof merged.rewardBalance !== 'number') merged.rewardBalance = 0
  if (typeof merged.lifetimeRewards !== 'number') merged.lifetimeRewards = 0
  if (!Array.isArray(merged.rewardHistory)) merged.rewardHistory = []
  if (!Array.isArray(merged.paidPayouts)) merged.paidPayouts = []
  if (merged.pendingPayout !== null && typeof merged.pendingPayout !== 'object') merged.pendingPayout = null
  if (merged.payoutMethod !== null && typeof merged.payoutMethod !== 'object') merged.payoutMethod = null
  // A payload saved before this field existed has real league history the
  // flat `0` default would erase — backfill from the league it actually
  // reached, not from scratch. Checked against the raw payload, since the
  // spread above already gave `merged` a numeric default either way.
  if (stored.highestQualifiedLeagueIndex === undefined) merged.highestQualifiedLeagueIndex = merged.leagueIndex
  if (!Array.isArray(merged.leaguePasses)) merged.leaguePasses = []
  if (merged.leagueAccessGrantedForSeason !== null && typeof merged.leagueAccessGrantedForSeason !== 'number') merged.leagueAccessGrantedForSeason = null
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

// This demo never calls a real payment processor — it only stores what the
// learner typed and marks it verified, standing in for what a real Kora
// integration would do after an actual bank-account lookup.
export function setPayoutMethod(current, method) {
  return { ...current, payoutMethod: { ...method, verified: true } }
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

// The one place a learner's chosen look and display name are saved — mirrors
// switchPrimaryPath's shape (a small, explicit patch onto `profile`), so the
// avatar picker and the Profile page's own name field write through the same
// path rather than each keeping their own partial update logic.
export function setAvatarChoice(current, { avatarStyle, avatarSeed, name }) {
  return {
    ...current,
    profile: {
      ...current.profile,
      avatarStyle,
      avatarSeed,
      ...(name !== undefined ? { name } : {}),
    },
  }
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return migrateProgress(raw ? JSON.parse(raw) : {}, getWeekIndex(now()), getSeasonIndex(now()))
  } catch {
    return migrateProgress({}, getWeekIndex(now()), getSeasonIndex(now()))
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

// The one place a lesson question's outcome turns into hidden learning
// evidence. Deliberately separate from applyActivity — mastery must not
// touch XP or streak, it only feeds the reinforcement-review surface.
export function recordConceptMastery(current, lessonId, conceptId, outcome, today = new Date().toDateString()) {
  const key = getConceptKey(lessonId, conceptId)
  const existing = current.masteryByConcept?.[key] ?? createMasteryRecord()
  return {
    ...current,
    masteryByConcept: { ...current.masteryByConcept, [key]: recordQuestionOutcome(existing, outcome, today) },
  }
}

// Devy Coins are a separate, visible achievement currency — this is the one
// place that touches either balance, mirroring applyActivity's role for XP.
// Every coin counts toward both the lifetime total and the current season's
// leaderboard score at once; there's no payout/conversion logic here on
// purpose — that lives in lib/rewardConfig.js, keyed by rank, never by coins.
export function addCoins(current, amount) {
  if (amount <= 0) return current
  return {
    ...current,
    devyCoins: (current.devyCoins ?? 0) + amount,
    seasonDevyCoins: (current.seasonDevyCoins ?? 0) + amount,
  }
}

// What each moment awards. Kept together as the one place that answers "how
// many coins does X earn" — there's no leaderboard/project tier here because
// this codebase has no leaderboard-payout or project-milestone feature yet.
export const CONCEPT_COIN_AWARD = 1
export const PRACTICE_COIN_AWARD = 5
export const LESSON_COIN_AWARD = 10

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

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage can be unavailable in private mode; the session still works in memory.
  }
}
