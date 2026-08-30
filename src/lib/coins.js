// Season Devy Coins are earned only for verified, non-repeat learning — the
// anti-farming rule from the spec. Unlike XP's getPracticeXpAward (see
// data/progress.js), there is no Premium branch here at all: diminishing
// returns apply identically to everyone, since coins are what the
// leaderboard ranks on and Pro must never touch that.
export const COIN_AWARDS = {
  // First time a lesson's concept is completed.
  CONCEPT_MASTERED: 5,
  // First time a practice session is completed.
  FIRST_PRACTICE: 8,
  // No surface exists yet to drive these — retention/reinforcement checks and
  // failure-then-correction tracking aren't implemented — but the spec names
  // them, so the table documents the rate for when they are:
  // REINFORCEMENT: 6, CORRECTION_AFTER_FAILURE: 3
}

// Mirrors getPracticeXpAward's shape: full award the first time, nothing on
// any repeat, so the same `completedSessions`/`completedLessons` records that
// already gate XP also gate coins.
export function getPracticeCoinAward(progress, sessionId) {
  const priorCompletion = progress.completedSessions?.[sessionId]
  return priorCompletion ? 0 : COIN_AWARDS.FIRST_PRACTICE
}

// `assisted` is the Earn It First rule: opening Devy before a first attempt
// on any question forfeits this completion's reward, the same way a repeat
// completion already does — one lever, two triggers.
export function getLessonCoinAward(progress, lessonId, assisted = false) {
  if (assisted) return 0
  const priorCompletion = progress.completedLessons?.[lessonId]
  return priorCompletion ? 0 : COIN_AWARDS.CONCEPT_MASTERED
}
