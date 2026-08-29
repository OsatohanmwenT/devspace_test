// Extensions included so this module also resolves under `node --test`, which
// does not do Vite's extensionless resolution.
import { rivals } from '../data/rivals.js'
import { getLeague, getLeagueById, leagues } from '../data/leagues.js'
import { applyLeagueAccessGate, grantSilverPassIfEarned } from './leagueAccess.js'
import { getCashWinnerCount, getNextRewardTarget, getPayoutForRank } from './rewardConfig.js'
import { SYNTHETIC_RIVALS } from './syntheticRivals.js'
import { hashString, seededRandom } from './rng.js'
import { getSeasonIndex, getSeasonProgress, SEASON_DAYS } from './week.js'

export const USER_ID = 'you'
const USER_ROLE = 'Machine Learning Engineer path'
const DAY_FRACTION = 1 / SEASON_DAYS
// The full identity pool a cohort can ever be drawn from — the hand-authored
// personas first (data/rivals.js), topped up with procedurally generated ones
// (lib/syntheticRivals.js) so even Bronze's 260-person cohort never repeats a
// name.
const RIVAL_POOL = [...rivals, ...SYNTHETIC_RIVALS]

// Each season draws a fresh field, but always the same one for a given
// (season, league) pair — the cohort is never re-rolled on reload.
export function buildCohort(seasonIndex, leagueIndex) {
  const random = seededRandom('cohort', seasonIndex, leagueIndex)
  const pool = [...RIVAL_POOL]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const held = pool[index]
    pool[index] = pool[swap]
    pool[swap] = held
  }
  const cohortSize = getLeague(leagueIndex).cohortSize
  return pool.slice(0, cohortSize - 1)
}

// A rival's Season Devy Coins is a pure function of who they are, which season
// it is, and how far through it we are — so no rival state is ever stored.
export function rivalSeasonCoins(rival, seasonIndex, leagueIndex, progress) {
  const random = seededRandom('coins', rival.id, seasonIndex, leagueIndex)
  const paceScale = getLeague(leagueIndex).pace
  let total = 0

  for (let day = 0; day < SEASON_DAYS; day += 1) {
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

function buildEntries(seasonIndex, leagueIndex, userSeasonCoins, progress, userTag = null, userAvatar = null) {
  const entries = buildCohort(seasonIndex, leagueIndex).map((rival) => ({
    id: rival.id,
    name: rival.name,
    role: rival.role,
    tag: rival.tag,
    score: rivalSeasonCoins(rival, seasonIndex, leagueIndex, progress),
    isCurrentUser: false,
  }))

  entries.push({
    id: USER_ID,
    name: 'You',
    role: USER_ROLE,
    tag: userTag,
    avatarStyle: userAvatar?.avatarStyle ?? null,
    score: userSeasonCoins,
    isCurrentUser: true,
  })
  return entries
}

function withRewards(entries, leagueId) {
  return entries.map((entry) => ({ ...entry, reward: getPayoutForRank(leagueId, entry.rank) }))
}

// `userTag` is purely cosmetic (Premium's PRO badge on your own row) — it is
// never allowed to reach scoring, which is why it only ever touches the `tag`
// field on the entry object built here.
export function getStandings(seasonIndex, leagueIndex, userSeasonCoins, timestamp, options = {}) {
  const { userTag = null, userAvatar = null } = options
  const league = getLeague(leagueIndex)
  const progress = getSeasonProgress(timestamp)
  const current = withRewards(rankEntries(buildEntries(seasonIndex, leagueIndex, userSeasonCoins, progress, userTag, userAvatar)), league.id)

  // Movement is measured against where everyone stood a day ago. Less than a
  // day into the season there is no yesterday to compare against: every score
  // would be zero and the ranking would be pure tie-break order, so the
  // "movement" it produced was noise. null, not 0, so callers can tell "hasn't
  // moved" from "not measurable yet".
  const dayAgo = progress - DAY_FRACTION
  if (dayAgo <= 0) return current.map((entry) => ({ ...entry, delta: null }))

  const previousRanks = new Map(
    rankEntries(buildEntries(seasonIndex, leagueIndex, userSeasonCoins, dayAgo, userTag, userAvatar)).map((entry) => [entry.id, entry.rank]),
  )

  return current.map((entry) => ({ ...entry, delta: (previousRanks.get(entry.id) ?? entry.rank) - entry.rank }))
}

// Lifetime totals are invented once per rival and never move — they exist for
// bragging rights, not for the league.
export function getAllTimeStandings(userLifetimeCoins, userAvatar = null) {
  const entries = RIVAL_POOL.map((rival) => {
    const random = seededRandom('lifetime', rival.id)
    const seasonsActive = 1 + Math.floor(random() * 8)
    return {
      id: rival.id,
      name: rival.name,
      role: rival.role,
      tag: rival.tag,
      score: Math.round(rival.pace * rival.consistency * SEASON_DAYS * seasonsActive * (0.8 + random() * 0.4)),
      isCurrentUser: false,
      delta: 0,
    }
  })

  entries.push({ id: USER_ID, name: 'You', role: USER_ROLE, tag: null, avatarStyle: userAvatar?.avatarStyle ?? null, score: userLifetimeCoins, isCurrentUser: true, delta: 0 })
  return rankEntries(entries)
}

export function getZoneSummary(standings, leagueIndex) {
  const league = getLeague(leagueIndex)
  const user = standings.find((entry) => entry.isCurrentUser)
  const promotesAnyone = league.promoteCount > 0
  const demotesAnyone = league.demoteCount > 0
  const rewardZoneSize = Math.min(getCashWinnerCount(league.id), standings.length)

  const inPromotion = promotesAnyone && user.rank <= league.promoteCount
  const demotionRank = standings.length - league.demoteCount
  const inDemotion = demotesAnyone && user.rank > demotionRank
  const inRewardZone = user.rank <= rewardZoneSize

  const firstOutsidePromotion = standings[league.promoteCount]
  const lastInsidePromotion = standings[league.promoteCount - 1]
  const lastSafeFromDemotion = standings[demotionRank - 1]

  return {
    league,
    user,
    inPromotion,
    inDemotion,
    inRewardZone,
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
    rewardLineIndex: rewardZoneSize > 0 && rewardZoneSize < standings.length ? rewardZoneSize : -1,
  }
}

// "What do I need next?" — the closest useful target above the user's current
// position: a better reward band if one is reachable, falling back to however
// many coins the very next rank up is worth closing.
export function getNextTarget(standings, leagueIndex) {
  const league = getLeague(leagueIndex)
  const user = standings.find((entry) => entry.isCurrentUser)
  const rewardTarget = getNextRewardTarget(league.id, user.rank)

  if (rewardTarget) {
    const holder = standings[rewardTarget.rank - 1]
    return { kind: 'reward', rank: rewardTarget.rank, reward: rewardTarget.reward, coinsNeeded: Math.max(1, holder.score - user.score + 1) }
  }

  if (user.rank > 1) {
    const above = standings[user.rank - 2]
    return { kind: 'rank', rank: user.rank - 1, coinsNeeded: Math.max(1, above.score - user.score + 1) }
  }

  return null
}

// What a first-try-correct question is worth, so a gap in coins can be quoted
// as a gap in things-you-can-actually-do.
export const CONCEPT_COIN_VALUE = 1

export function eventsFor(coins) {
  return Math.max(1, Math.ceil(coins / CONCEPT_COIN_VALUE))
}

// Season coins are a pure function of the season, so the season's outcome is
// already knowable before it ends. These are the real cutoffs, not a
// forecast — which is what lets the board tell you where you actually stand
// instead of where the half-finished season makes you look.
export function getSeasonTargets(seasonIndex, leagueIndex) {
  const league = getLeague(leagueIndex)
  const finalRivalScores = buildCohort(seasonIndex, leagueIndex)
    .map((rival) => rivalSeasonCoins(rival, seasonIndex, leagueIndex, 1))
    .sort((a, b) => b - a)

  // Out-score the last rival inside the zone and you are inside it. These are
  // deliberately the *guaranteed* numbers: landing exactly level with that
  // rival resolves on rankEntries' hash tie-break, so quoting the tie itself
  // would be right only about half the time. One coin of headroom makes the
  // promise true.
  const promotionScore = league.promoteCount > 0
    ? finalRivalScores[league.promoteCount - 1] + 1
    : 0
  const cohortSize = league.cohortSize
  const safeIndex = cohortSize - league.demoteCount - 1
  const safetyScore = league.demoteCount > 0 && finalRivalScores[safeIndex] !== undefined
    ? finalRivalScores[safeIndex] + 1
    : 0

  return { promotionScore, safetyScore, topScore: finalRivalScores[0] ?? 0, finalRivalScores }
}

function rankAgainst(score, finalRivalScores) {
  return finalRivalScores.filter((rivalScore) => rivalScore > score).length + 1
}

// Where this season is actually heading. `stopNowRank` is the important one:
// early in the season rivals have only banked a fraction of their total, so
// the live ranking flatters everyone — a learner can sit at #1 on day one and
// finish 40th without ever doing anything wrong. This is what lets the UI say so.
export function getPaceOutlook({ seasonCoins, dailyGoal, timestamp, targets, leagueIndex }) {
  const league = getLeague(leagueIndex)
  const progress = getSeasonProgress(timestamp)

  const daysElapsed = Math.min(SEASON_DAYS, Math.max(1, Math.ceil(progress * SEASON_DAYS)))
  const daysLeft = SEASON_DAYS - daysElapsed

  const currentPacePerDay = seasonCoins / daysElapsed
  const projectedScore = Math.round(seasonCoins + currentPacePerDay * daysLeft)
  const stopNowRank = rankAgainst(seasonCoins, targets.finalRivalScores)
  const projectedRank = rankAgainst(projectedScore, targets.finalRivalScores)

  // Diamond has nowhere to climb to, so the line that matters there is survival.
  const chasing = league.promoteCount > 0 ? 'promotion' : 'safety'
  const target = chasing === 'promotion' ? targets.promotionScore : targets.safetyScore

  const gap = Math.max(0, target - seasonCoins)
  const neededPerDay = gap > 0 ? Math.ceil(gap / Math.max(1, daysLeft)) : 0
  const goal = dailyGoal > 0 ? dailyGoal : 1

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

// A cohort this large is more board than anyone reads, so this keeps the rows
// that carry meaning (the podium, every zone cutoff, and your own
// neighbourhood) and collapses the rest into counted gaps.
export function getBoardWindow(standings, summary, options = {}) {
  const lines = new Map()
  if (summary.promotionLineIndex >= 0 && summary.promotionLineIndex < standings.length) {
    lines.set(summary.promotionLineIndex, 'promotion-line')
  }
  if (summary.rewardLineIndex >= 0 && summary.rewardLineIndex < standings.length && summary.rewardLineIndex !== summary.promotionLineIndex) {
    lines.set(summary.rewardLineIndex, 'reward-line')
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

// Called when the stored season is behind the current one. Because rival
// coins are a pure function of the season, the finished season can be scored
// after the fact without ever having been recorded.
//
// Rank decides `rankOutcome`/`rankTarget` on its own — nothing here reads
// isPremium or leaguePasses yet, which is what keeps rank, score and reward
// identical for a free and a Premium learner (the pay-to-win firewall).
// Access is applied only afterward, and only to *which league that outcome
// actually lands them in* — never to the numbers that got them there.
export function resolveSeason(stored, timestamp) {
  if (stored.seasonIndex === null || stored.seasonIndex === undefined) return null
  if (stored.seasonIndex >= getSeasonIndex(timestamp)) return null

  const league = getLeague(stored.leagueIndex)
  const standings = withRewards(rankEntries(buildEntries(stored.seasonIndex, stored.leagueIndex, stored.seasonDevyCoins, 1)), league.id)
  const user = standings.find((entry) => entry.isCurrentUser)

  let rankOutcome = 'stayed'
  let rankTarget = stored.leagueIndex

  if (league.promoteCount > 0 && user.rank <= league.promoteCount && stored.leagueIndex < leagues.length - 1) {
    rankOutcome = 'promoted'
    rankTarget = stored.leagueIndex + 1
  } else if (league.demoteCount > 0 && user.rank > standings.length - league.demoteCount && stored.leagueIndex > 0) {
    rankOutcome = 'demoted'
    rankTarget = stored.leagueIndex - 1
  }

  const upcomingSeasonIndex = getSeasonIndex(timestamp)
  const passesAfterGrant = grantSilverPassIfEarned(stored, 0, user.rank, stored.seasonIndex)
  const passJustGranted = passesAfterGrant.length > (stored.leaguePasses?.length ?? 0)
  const gate = applyLeagueAccessGate(stored, rankTarget, upcomingSeasonIndex, passesAfterGrant)

  // A rank-earned promotion blocked by access is its own moment ("you
  // qualified, but can't enter yet") — never silently reported as 'stayed'.
  // Losing access to a league already occupied reads as a demotion, which is
  // what it is, regardless of what rank alone would have said.
  const outcome = gate.accessGranted ? rankOutcome : (rankOutcome === 'promoted' ? 'qualified' : 'demoted')
  const nextLeagueIndex = gate.leagueIndex

  return {
    seasonIndex: stored.seasonIndex,
    rank: user.rank,
    cohortSize: standings.length,
    score: stored.seasonDevyCoins,
    reward: user.reward,
    outcome,
    fromLeague: league.name,
    fromLeagueIndex: stored.leagueIndex,
    toLeague: getLeague(nextLeagueIndex).name,
    nextLeagueIndex,
    // Only meaningful when outcome is 'qualified' — the league rank alone
    // would have promoted to, for a UI that wants to name it even though the
    // learner isn't standing there yet.
    qualifiedLeagueIndex: outcome === 'qualified' ? rankTarget : null,
    qualifiedLeague: outcome === 'qualified' ? getLeague(rankTarget).name : null,
    accessVia: gate.via,
    leaguePasses: gate.leaguePasses,
    leagueAccessGrantedForSeason: upcomingSeasonIndex,
    highestQualifiedLeagueIndex: Math.max(stored.highestQualifiedLeagueIndex ?? 0, rankTarget),
    // True only the instant a top-10 Bronze finish creates the pass — not on
    // every season it happens to still be sitting there unused. That's what
    // makes it a one-time fullscreen moment rather than a recurring banner.
    passJustGranted,
  }
}

export { getLeagueById }
