// Weekly head-to-head. Rides the existing calendar-week cadence in
// lib/week.js (already unrelated to league seasons) rather than inventing a
// second clock. Per the spec, H2H compares verified coins earned *inside the
// window only* and must never touch official coins or league state — this
// module only ever reads a coin total in and returns a result out, the same
// shape lib/privateLeagues.js's getPrivateLeagueStandings already uses.
import { rivals } from '../data/rivals.js'
import { seededRandom } from './rng.js'
import { getWeekIndex, getWeekProgress } from './week.js'

const DAY_FRACTION = 1 / 7
const HISTORY_LIMIT = 10

// Deterministic per week: the opponent and their eventual full-week coin
// total are both knowable ahead of time, same principle as leagueSim.js's
// rival cohort, so a live comparison can be shown mid-week.
export function getWeeklyOpponent(weekIndex) {
  const random = seededRandom('h2h-opponent', weekIndex)
  return rivals[Math.floor(random() * rivals.length)]
}

// Same day-fraction accrual shape as leagueSim.js's rivalSeasonCoins, but
// scoped to a single week and never routed through any league's pace
// multiplier — H2H has no difficulty concept of its own, it's rivalry, not
// another money economy.
export function getOpponentWeekCoins(rival, weekIndex, progress) {
  const random = seededRandom('h2h-coins', rival.id, weekIndex)
  let total = 0

  for (let day = 0; day < 7; day += 1) {
    const isActiveDay = random() < rival.consistency
    const earned = isActiveDay ? Math.round(rival.pace * (0.5 + random() * 0.6)) : 0
    const dayStart = day * DAY_FRACTION
    const dayEnd = dayStart + DAY_FRACTION

    if (progress >= dayEnd) total += earned
    else if (progress > dayStart) total += Math.round(earned * ((progress - dayStart) / DAY_FRACTION))
  }

  return total
}

function settleMatch(weekIndex, userCoinsThisWeek) {
  const opponent = getWeeklyOpponent(weekIndex)
  const opponentCoins = getOpponentWeekCoins(opponent, weekIndex, 1)

  let result = 'draw'
  if (userCoinsThisWeek > opponentCoins) result = 'win'
  else if (userCoinsThisWeek < opponentCoins) result = 'loss'

  const pointsEarned = result === 'win' ? 3 : result === 'draw' ? 1 : 0

  return {
    weekIndex,
    opponentId: opponent.id,
    opponentName: opponent.name,
    userCoins: userCoinsThisWeek,
    opponentCoins,
    result,
    pointsEarned,
  }
}

// The single entry point, mirroring resolveSeason's shape: no-ops (besides
// adopting the current week on a first-ever call) until the stored week is
// actually over, then settles it and opens the next window. Returns the next
// h2h record plus the just-settled match (or null if nothing resolved).
export function advanceH2HWeek(h2h, seasonCoins, timestamp) {
  const currentWeekIndex = getWeekIndex(timestamp)

  if (h2h.weekIndex === null || h2h.weekIndex === undefined) {
    return {
      h2h: { weekIndex: currentWeekIndex, windowStartCoins: seasonCoins, points: h2h.points ?? 0, history: h2h.history ?? [] },
      resolved: null,
    }
  }

  if (h2h.weekIndex >= currentWeekIndex) return { h2h, resolved: null }

  const userCoinsThisWeek = Math.max(0, seasonCoins - h2h.windowStartCoins)
  const match = settleMatch(h2h.weekIndex, userCoinsThisWeek)

  return {
    h2h: {
      weekIndex: currentWeekIndex,
      windowStartCoins: seasonCoins,
      points: (h2h.points ?? 0) + match.pointsEarned,
      history: [match, ...(h2h.history ?? [])].slice(0, HISTORY_LIMIT),
    },
    resolved: match,
  }
}

// Live, mid-week comparison for the UI — never mutates anything.
export function getLiveH2HStanding(h2h, seasonCoins, timestamp) {
  const weekIndex = h2h.weekIndex ?? getWeekIndex(timestamp)
  const opponent = getWeeklyOpponent(weekIndex)
  const progress = getWeekProgress(timestamp)
  const opponentCoins = getOpponentWeekCoins(opponent, weekIndex, progress)
  const userCoins = Math.max(0, seasonCoins - (h2h.windowStartCoins ?? seasonCoins))

  return { weekIndex, opponentId: opponent.id, opponentName: opponent.name, userCoins, opponentCoins }
}
