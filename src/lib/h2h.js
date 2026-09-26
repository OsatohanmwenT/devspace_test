// Weekly head-to-head. Rides the existing calendar-week cadence in
// lib/week.js (already unrelated to league seasons) rather than inventing a
// second clock. Per the spec, H2H compares verified coins earned *inside the
// window only* and must never touch official coins or league state — this
// module only ever reads a coin total in and returns a result out, the same
// shape lib/privateLeagues.js's getPrivateLeagueStandings already uses.
import { getLeague } from '../data/leagues.js'
import { rivals } from '../data/rivals.js'
import { seededRandom } from './rng.js'
import { getSeasonIndex } from './season.js'
import { getWeekIndex, getWeekProgress, getWeekStartFromIndex } from './week.js'

const DAY_FRACTION = 1 / 7
const HISTORY_LIMIT = 10
const CANDIDATE_COUNT = 4

// Deterministic per week: the opponent and their eventual full-week coin
// total are both knowable ahead of time, same principle as leagueSim.js's
// rival cohort, so a live comparison can be shown mid-week.
//
// `chosenOpponentId` lets a learner pick their own rival for the week (see
// getOpponentCandidates) instead of only ever getting whoever the default
// draw lands on — if it doesn't resolve to a real rival, this falls straight
// back to the original deterministic pick, so callers that never pass it
// (existing tests included) see no change in behavior.
export function getWeeklyOpponent(weekIndex, chosenOpponentId) {
  if (chosenOpponentId) {
    const chosen = rivals.find((rival) => rival.id === chosenOpponentId)
    if (chosen) return chosen
  }
  const random = seededRandom('h2h-opponent', weekIndex)
  return rivals[Math.floor(random() * rivals.length)]
}

// A short, deterministic shortlist a learner can pick this week's rival
// from — the default matchup is always included (as the first entry) so
// "not choosing" and "choosing the default" are the same matchup.
export function getOpponentCandidates(weekIndex) {
  const defaultOpponent = getWeeklyOpponent(weekIndex)
  const random = seededRandom('h2h-candidates', weekIndex)
  const pool = rivals.filter((rival) => rival.id !== defaultOpponent.id)
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const held = pool[index]
    pool[index] = pool[swap]
    pool[swap] = held
  }
  return [defaultOpponent, ...pool.slice(0, CANDIDATE_COUNT - 1)]
}

// Same day-fraction accrual shape as leagueSim.js's rivalSeasonCoins, scoped
// to a single week. It rides the learner's league pace for the same reason
// the official board does: coins are scarce, anti-farmed awards, so a rival
// earning at raw persona pace (~200/week) would out-earn a whole Bronze
// season of honest work and every matchup would be a foregone loss.
export function getOpponentWeekCoins(rival, weekIndex, progress, leagueIndex = 0) {
  const random = seededRandom('h2h-coins', rival.id, weekIndex)
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

// A rough "what does this rival usually put up" figure for the picker — the
// expected value of the weekly draw above, not any particular week's total,
// so it can't be used to peek at how a matchup will actually go.
export function getTypicalWeekCoins(rival, leagueIndex = 0) {
  return Math.max(1, Math.round(rival.pace * getLeague(leagueIndex).pace * rival.consistency * 7))
}

function settleMatch(weekIndex, userCoinsThisWeek, chosenOpponentId, leagueIndex) {
  const opponent = getWeeklyOpponent(weekIndex, chosenOpponentId)
  const opponentCoins = getOpponentWeekCoins(opponent, weekIndex, 1, leagueIndex)

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
export function advanceH2HWeek(h2h, seasonCoins, timestamp, leagueIndex = 0) {
  const currentWeekIndex = getWeekIndex(timestamp)

  if (h2h.weekIndex === null || h2h.weekIndex === undefined) {
    return {
      h2h: { weekIndex: currentWeekIndex, windowStartCoins: seasonCoins, points: h2h.points ?? 0, history: h2h.history ?? [], chosenOpponentId: null },
      resolved: null,
    }
  }

  if (h2h.weekIndex >= currentWeekIndex) return { h2h, resolved: null }

  const userCoinsThisWeek = Math.max(0, seasonCoins - h2h.windowStartCoins)
  const match = settleMatch(h2h.weekIndex, userCoinsThisWeek, h2h.chosenOpponentId, leagueIndex)

  return {
    h2h: {
      weekIndex: currentWeekIndex,
      windowStartCoins: seasonCoins,
      points: (h2h.points ?? 0) + match.pointsEarned,
      history: [match, ...(h2h.history ?? [])].slice(0, HISTORY_LIMIT),
      // A new week always starts unpicked — last week's choice shouldn't
      // silently carry over to an opponent the learner never chose.
      chosenOpponentId: null,
    },
    resolved: match,
  }
}

// A learner can pick their rival for the *current, still-open* week only —
// past weeks are already settled, and picking for a future week that hasn't
// opened yet has nothing to attach to. The pick is also once per week: the
// live score is visible, so a free swap would just mean switching to
// whoever is losing on Saturday night.
export function chooseH2HOpponent(h2h, opponentId) {
  if (h2h.weekIndex === null || h2h.weekIndex === undefined) return h2h
  if (h2h.chosenOpponentId) return h2h
  if (!rivals.some((rival) => rival.id === opponentId)) return h2h
  return { ...h2h, chosenOpponentId: opponentId }
}

// Live, mid-week comparison for the UI — never mutates anything.
export function getLiveH2HStanding(h2h, seasonCoins, timestamp, leagueIndex = 0) {
  const weekIndex = h2h.weekIndex ?? getWeekIndex(timestamp)
  const opponent = getWeeklyOpponent(weekIndex, h2h.chosenOpponentId)
  const progress = getWeekProgress(timestamp)
  const opponentCoins = getOpponentWeekCoins(opponent, weekIndex, progress, leagueIndex)
  const userCoins = Math.max(0, seasonCoins - (h2h.windowStartCoins ?? seasonCoins))

  return { weekIndex, opponentId: opponent.id, opponentName: opponent.name, opponentRole: opponent.role, userCoins, opponentCoins }
}

// Seasons are exactly four weeks on the same Sunday-23:00 boundary, so a
// week's season is just the season its first hour falls in.
export function getSeasonIndexForWeek(weekIndex) {
  return getSeasonIndex(getWeekStartFromIndex(weekIndex) + 60 * 60 * 1000)
}

// Season record, points, and current streak — purely derived from history,
// so it stays correct no matter how matches were settled. Pass a
// seasonIndex to scope it to that season; "season points" used to be a
// running total that never reset, which is what this replaces.
export function getH2HRecord(history, seasonIndex) {
  const matches = seasonIndex === undefined
    ? (history ?? [])
    : (history ?? []).filter((match) => getSeasonIndexForWeek(match.weekIndex) === seasonIndex)

  const record = matches.reduce(
    (totals, match) => ({ ...totals, [match.result]: totals[match.result] + 1, points: totals.points + (match.pointsEarned ?? 0) }),
    { win: 0, draw: 0, loss: 0, points: 0 },
  )

  let streak = { result: null, count: 0 }
  if (matches.length) {
    const [mostRecent, ...rest] = matches
    streak = { result: mostRecent.result, count: 1 }
    for (const match of rest) {
      if (match.result !== mostRecent.result) break
      streak.count += 1
    }
  }

  return { ...record, matches, streak }
}
