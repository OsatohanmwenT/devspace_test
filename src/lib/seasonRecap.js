// Assembles a finished season's story from data that's actually there — no
// card in here is allowed to invent a number. Where the underlying tracking
// doesn't exist (a true day-one rank, or a season-scoped log of reinforcement
// checks distinct from ordinary lesson questions), the card is left out
// rather than approximated into something that looks more precise than it is.
import { getSeasonEnd, getSeasonStartFromIndex } from './week.js'

// A concept counts as "mastered" for recap purposes at the same score this
// codebase already uses to imply real command of it — not a separate number
// invented just to make the recap card look good.
export const MASTERY_THRESHOLD = 50

export function getPercentile(rank, cohortSize) {
  if (!cohortSize || cohortSize <= 1) return 100
  return Math.round((1 - (rank - 1) / cohortSize) * 100)
}

// "Top N%" only reads as a brag when N is small — below the median, the
// *complement* of that same number ("Top 80%") sounds like a good result
// when it isn't. This is the one place that decision gets made, so the recap
// screen and anything sharing its numbers can never disagree about it.
export function formatPercentileBadge(percentile) {
  return percentile >= 50 ? `Top ${Math.max(1, 100 - percentile)}%` : `${percentile}th percentile`
}

export function formatPercentileLine(percentile, league) {
  if (percentile >= 50) return `Top ${Math.max(1, 100 - percentile)}% of ${league}.`
  return `Outscored ${percentile}% of ${league}.`
}

function startOfDay(timestamp) {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

// Counts concepts whose most recent practice fell inside the season's own
// calendar window and cleared the mastery bar — "mastered this season," not
// "mastered ever," and not double-counted from a season before or after.
// Compared at calendar-day granularity, not the exact hour a season actually
// turns over (11pm, same as the weekly boundary) — `lastPracticedDate` is
// itself only ever a day, so the whole day a season starts on counts as that
// season rather than silently splitting it at an hour nothing else tracks.
export function countConceptsMasteredInSeason(masteryByConcept, seasonIndex) {
  const start = startOfDay(getSeasonStartFromIndex(seasonIndex))
  const end = startOfDay(getSeasonEnd(getSeasonStartFromIndex(seasonIndex)))

  return Object.values(masteryByConcept ?? {}).filter((record) => {
    if (record.score < MASTERY_THRESHOLD || !record.lastPracticedDate) return false
    const practicedAt = new Date(record.lastPracticedDate).getTime()
    return practicedAt >= start && practicedAt < end
  }).length
}

// The whole recap in one call — everything a screen needs, nothing it has to
// derive itself. `seasonStartRank` may be null (a learner who was migrated in
// mid-season, or who never had coins on the board before this result) — the
// caller decides whether to show that card at all.
export function buildSeasonRecap(result, { masteryByConcept, seasonStartRank } = {}) {
  const startRank = seasonStartRank?.seasonIndex === result.seasonIndex ? seasonStartRank.rank : null

  return {
    seasonIndex: result.seasonIndex,
    league: result.fromLeague,
    outcome: result.outcome,
    toLeague: result.toLeague,
    qualifiedLeague: result.qualifiedLeague,
    startRank,
    finalRank: result.rank,
    positionsChanged: startRank !== null ? startRank - result.rank : null,
    percentile: getPercentile(result.rank, result.cohortSize),
    seasonCoins: result.score,
    reward: result.reward,
    conceptsMastered: countConceptsMasteredInSeason(masteryByConcept, result.seasonIndex),
  }
}
