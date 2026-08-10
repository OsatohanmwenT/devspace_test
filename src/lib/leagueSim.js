// Extensions included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { rivals } from '../data/rivals.js'
import { COHORT_SIZE, getLeague, leagues } from '../data/leagues.js'
import { hashString, seededRandom } from './rng.js'
import { getWeekIndex, getWeekProgress } from './week.js'

export const USER_ID = 'you'
const USER_ROLE = 'Machine Learning Engineer path'
const DAY_FRACTION = 1 / 7

// Each week draws a fresh field, but always the same one for a given
// (week, league) pair — the cohort is never re-rolled on reload.
export function buildCohort(weekIndex, leagueIndex) {
  const random = seededRandom('cohort', weekIndex, leagueIndex)
  const pool = [...rivals]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const held = pool[index]
    pool[index] = pool[swap]
    pool[swap] = held
  }
  return pool.slice(0, COHORT_SIZE - 1)
}

// A rival's XP is a pure function of who they are, which week it is, and how
// far through that week we are — so no rival state is ever stored.
export function rivalWeeklyXp(rival, weekIndex, leagueIndex, progress) {
  const random = seededRandom('xp', rival.id, weekIndex, leagueIndex)
  const paceScale = getLeague(leagueIndex).pace
  let total = 0

  for (let day = 0; day < 7; day += 1) {
    const isActiveDay = random() < rival.consistency
    const earned = isActiveDay ? Math.round(rival.pace * paceScale * (0.55 + random() * 0.9)) : 0
    const dayStart = day * DAY_FRACTION
    const dayEnd = dayStart + DAY_FRACTION

    if (progress >= dayEnd) total += earned
    else if (progress > dayStart) total += Math.round(earned * ((progress - dayStart) / DAY_FRACTION))
  }

  return total
}

// Ties break on a stable hash rather than array order, so equal scores never
// cause rows to swap places between renders.
function rankEntries(entries) {
  return [...entries]
    .sort((a, b) => b.score - a.score || hashString(a.id) - hashString(b.id))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

function buildEntries(weekIndex, leagueIndex, userWeeklyXp, progress, userTag = null) {
  const entries = buildCohort(weekIndex, leagueIndex).map((rival) => ({
    id: rival.id,
    name: rival.name,
    role: rival.role,
    tag: rival.tag,
    score: rivalWeeklyXp(rival, weekIndex, leagueIndex, progress),
    isCurrentUser: false,
  }))

  entries.push({ id: USER_ID, name: 'You', role: USER_ROLE, tag: userTag, score: userWeeklyXp, isCurrentUser: true })
  return entries
}

// `userTag` is purely cosmetic (Premium's PRO badge on your own row) — it is
// never allowed to reach scoring, which is why it only ever touches the `tag`
// field on the entry object built here.
export function getStandings(weekIndex, leagueIndex, userWeeklyXp, timestamp, options = {}) {
  const { userTag = null } = options
  const progress = getWeekProgress(timestamp)
  const current = rankEntries(buildEntries(weekIndex, leagueIndex, userWeeklyXp, progress, userTag))

  // Movement is measured against where everyone stood a day ago. Less than a day
  // into the week there is no yesterday to compare against: every score would be
  // zero and the ranking would be pure tie-break order, so the "movement" it
  // produced was noise — whole rows claiming to have climbed twenty places.
  // null, not 0, so callers can tell "hasn't moved" from "not measurable yet".
  const dayAgo = progress - DAY_FRACTION
  if (dayAgo <= 0) return current.map((entry) => ({ ...entry, delta: null }))

  const previousRanks = new Map(
    rankEntries(buildEntries(weekIndex, leagueIndex, userWeeklyXp, dayAgo, userTag)).map((entry) => [entry.id, entry.rank]),
  )

  return current.map((entry) => ({ ...entry, delta: (previousRanks.get(entry.id) ?? entry.rank) - entry.rank }))
}

// Lifetime totals are invented once per rival and never move — they exist for
// bragging rights, not for the league.
export function getAllTimeStandings(userXp) {
  const entries = rivals.map((rival) => {
    const random = seededRandom('lifetime', rival.id)
    const weeksActive = 6 + Math.floor(random() * 30)
    return {
      id: rival.id,
      name: rival.name,
      role: rival.role,
      tag: rival.tag,
      score: Math.round(rival.pace * rival.consistency * 7 * weeksActive * (0.8 + random() * 0.4)),
      isCurrentUser: false,
      delta: 0,
    }
  })

  entries.push({ id: USER_ID, name: 'You', role: USER_ROLE, tag: null, score: userXp, isCurrentUser: true, delta: 0 })
  return rankEntries(entries)
}

export function getZoneSummary(standings, leagueIndex) {
  const league = getLeague(leagueIndex)
  const user = standings.find((entry) => entry.isCurrentUser)
  const promotesAnyone = league.promoteCount > 0
  const demotesAnyone = league.demoteCount > 0

  const inPromotion = promotesAnyone && user.rank <= league.promoteCount
  const demotionRank = standings.length - league.demoteCount
  const inDemotion = demotesAnyone && user.rank > demotionRank

  const firstOutsidePromotion = standings[league.promoteCount]
  const lastInsidePromotion = standings[league.promoteCount - 1]
  const lastSafeFromDemotion = standings[demotionRank - 1]

  return {
    league,
    user,
    inPromotion,
    inDemotion,
    promotesAnyone,
    // How much more the user needs to break into the promotion zone.
    gapToPromotion: !inPromotion && promotesAnyone && lastInsidePromotion
      ? Math.max(1, lastInsidePromotion.score - user.score + 1)
      : 0,
    // How much cushion they have over the first person outside it.
    promotionCushion: inPromotion && firstOutsidePromotion ? user.score - firstOutsidePromotion.score : 0,
    // How much they need to climb out of the demotion zone.
    gapToSafety: inDemotion && lastSafeFromDemotion ? Math.max(1, lastSafeFromDemotion.score - user.score + 1) : 0,
    promotionLineIndex: promotesAnyone ? league.promoteCount : -1,
    demotionLineIndex: demotesAnyone ? demotionRank : -1,
  }
}

const DAYS_IN_WEEK = 7
// What a practice round is worth, so a gap in px can be quoted as a gap in
// things-you-can-actually-do.
export const XP_PER_ROUND = 10

export function roundsFor(px) {
  return Math.max(1, Math.ceil(px / XP_PER_ROUND))
}

// Rival XP is a pure function of the week, so the scores that will decide this
// week are already knowable on Monday. These are the real cutoffs, not a
// forecast — which is what lets the board tell you where you actually stand
// instead of where the half-finished week makes you look.
export function getWeekTargets(weekIndex, leagueIndex) {
  const league = getLeague(leagueIndex)
  const finalRivalScores = buildCohort(weekIndex, leagueIndex)
    .map((rival) => rivalWeeklyXp(rival, weekIndex, leagueIndex, 1))
    .sort((a, b) => b - a)

  // Out-score the last rival inside the zone and you are inside it. These are
  // deliberately the *guaranteed* numbers: landing exactly level with that rival
  // resolves on rankEntries' hash tie-break, so quoting the tie itself would be
  // right only about half the time. One px of headroom makes the promise true.
  const promotionScore = league.promoteCount > 0
    ? finalRivalScores[league.promoteCount - 1] + 1
    : 0
  const safeIndex = COHORT_SIZE - league.demoteCount - 1
  const safetyScore = league.demoteCount > 0 && finalRivalScores[safeIndex] !== undefined
    ? finalRivalScores[safeIndex] + 1
    : 0

  return { promotionScore, safetyScore, topScore: finalRivalScores[0] ?? 0, finalRivalScores }
}

function rankAgainst(score, finalRivalScores) {
  return finalRivalScores.filter((rivalScore) => rivalScore > score).length + 1
}

// Where this week is actually heading. `stopNowRank` is the important one: early
// in the week rivals have only banked a fraction of their total, so the live
// ranking flatters everyone — a learner can sit at #1 on Monday and finish 25th
// without ever doing anything wrong. This is what lets the UI say so.
export function getPaceOutlook({ weeklyXp, dailyGoal, timestamp, targets, leagueIndex }) {
  const league = getLeague(leagueIndex)
  const progress = getWeekProgress(timestamp)

  const daysElapsed = Math.min(DAYS_IN_WEEK, Math.max(1, Math.ceil(progress * DAYS_IN_WEEK)))
  const daysLeft = DAYS_IN_WEEK - daysElapsed

  const currentPacePerDay = weeklyXp / daysElapsed
  const projectedScore = Math.round(weeklyXp + currentPacePerDay * daysLeft)
  const stopNowRank = rankAgainst(weeklyXp, targets.finalRivalScores)
  const projectedRank = rankAgainst(projectedScore, targets.finalRivalScores)

  // Diamond has nowhere to climb to, so the line that matters there is survival.
  const chasing = league.promoteCount > 0 ? 'promotion' : 'safety'
  const target = chasing === 'promotion' ? targets.promotionScore : targets.safetyScore

  const gap = Math.max(0, target - weeklyXp)
  const neededPerDay = gap > 0 ? Math.ceil(gap / Math.max(1, daysLeft)) : 0
  const goal = dailyGoal > 0 ? dailyGoal : 25

  let verdict = 'on-track'
  if (gap === 0) verdict = 'safe'
  else if (neededPerDay > goal * 3) verdict = 'unreachable'
  else if (neededPerDay > goal * 1.5) verdict = 'behind'
  else if (projectedScore >= target * 1.15) verdict = 'ahead'

  return {
    chasing,
    target,
    daysLeft,
    daysElapsed,
    currentPacePerDay: Math.round(currentPacePerDay),
    projectedScore,
    projectedRank,
    stopNowRank,
    gap,
    neededPerDay,
    verdict,
  }
}

const PODIUM_ROWS = 3
const ROWS_BEFORE_LINE = 2
const ROWS_AFTER_LINE = 1
const ROWS_AROUND_USER = 2

function flattenWindow(standings, shown, lines) {
  const out = []
  let hidden = 0

  for (let index = 0; index < standings.length; index += 1) {
    if (!shown.has(index)) {
      hidden += 1
      continue
    }
    if (hidden > 0) {
      out.push({ type: 'gap', hiddenCount: hidden })
      hidden = 0
    }
    const line = lines.get(index)
    if (line) out.push({ type: line })
    out.push({ type: 'row', entry: standings[index] })
  }

  if (hidden > 0) out.push({ type: 'gap', hiddenCount: hidden })
  return out
}

// Thirty rows is more board than anyone reads, and in Bronze the promotion
// cutoff sits at row 20 — so the one line that gives the ranking any stakes was
// two screens below where anyone looked. This keeps the rows that carry meaning
// (the podium, both cutoffs, and your own neighbourhood) and collapses the rest
// into counted gaps.
export function getBoardWindow(standings, summary, options = {}) {
  const lines = new Map()
  if (summary.promotionLineIndex >= 0 && summary.promotionLineIndex < standings.length) {
    lines.set(summary.promotionLineIndex, 'promotion-line')
  }
  if (summary.demotionLineIndex >= 0 && summary.demotionLineIndex < standings.length) {
    lines.set(summary.demotionLineIndex, 'demotion-line')
  }

  const shown = new Set()
  const keep = (from, to) => {
    for (let index = Math.max(0, from); index <= Math.min(standings.length - 1, to); index += 1) shown.add(index)
  }

  if (options.expanded) {
    keep(0, standings.length - 1)
    return flattenWindow(standings, shown, lines)
  }

  keep(0, PODIUM_ROWS - 1)
  for (const index of lines.keys()) keep(index - ROWS_BEFORE_LINE, index + ROWS_AFTER_LINE)
  keep(summary.user.rank - 1 - ROWS_AROUND_USER, summary.user.rank - 1 + ROWS_AROUND_USER)

  return flattenWindow(standings, shown, lines)
}

// Called when the stored week is behind the current one. Because rival XP is a
// pure function of the week index, the finished week can be scored after the
// fact without ever having been recorded.
export function resolveWeek(stored, timestamp) {
  if (stored.weekIndex === null || stored.weekIndex === undefined) return null
  if (stored.weekIndex >= getWeekIndex(timestamp)) return null

  const standings = rankEntries(buildEntries(stored.weekIndex, stored.leagueIndex, stored.weeklyXp, 1))
  const rank = standings.find((entry) => entry.isCurrentUser).rank
  const league = getLeague(stored.leagueIndex)

  let outcome = 'stayed'
  let nextLeagueIndex = stored.leagueIndex

  if (league.promoteCount > 0 && rank <= league.promoteCount && stored.leagueIndex < leagues.length - 1) {
    outcome = 'promoted'
    nextLeagueIndex = stored.leagueIndex + 1
  } else if (league.demoteCount > 0 && rank > standings.length - league.demoteCount && stored.leagueIndex > 0) {
    outcome = 'demoted'
    nextLeagueIndex = stored.leagueIndex - 1
  }

  return {
    weekIndex: stored.weekIndex,
    rank,
    score: stored.weeklyXp,
    outcome,
    fromLeague: league.name,
    toLeague: getLeague(nextLeagueIndex).name,
    nextLeagueIndex,
  }
}
