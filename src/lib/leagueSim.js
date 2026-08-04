import { rivals } from '../data/rivals'
import { COHORT_SIZE, getLeague, leagues } from '../data/leagues'
import { hashString, seededRandom } from './rng'
import { getWeekIndex, getWeekProgress } from './week'

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

function buildEntries(weekIndex, leagueIndex, userWeeklyXp, progress) {
  const entries = buildCohort(weekIndex, leagueIndex).map((rival) => ({
    id: rival.id,
    name: rival.name,
    role: rival.role,
    tag: rival.tag,
    score: rivalWeeklyXp(rival, weekIndex, leagueIndex, progress),
    isCurrentUser: false,
  }))

  entries.push({ id: USER_ID, name: 'You', role: USER_ROLE, tag: null, score: userWeeklyXp, isCurrentUser: true })
  return entries
}

export function getStandings(weekIndex, leagueIndex, userWeeklyXp, timestamp) {
  const progress = getWeekProgress(timestamp)
  const current = rankEntries(buildEntries(weekIndex, leagueIndex, userWeeklyXp, progress))

  // Movement is measured against where everyone stood a day ago.
  const dayAgo = Math.max(0, progress - DAY_FRACTION)
  const previousRanks = new Map(
    rankEntries(buildEntries(weekIndex, leagueIndex, userWeeklyXp, dayAgo)).map((entry) => [entry.id, entry.rank]),
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
