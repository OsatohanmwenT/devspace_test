import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSeasonRecap, countConceptsMasteredInSeason, formatPercentileBadge, formatPercentileLine, getPercentile, MASTERY_THRESHOLD } from './seasonRecap.js'
import { getSeasonStartFromIndex } from './week.js'

const SEASON = 40
const DAY_MS = 24 * 60 * 60 * 1000

function dateWithinSeason(offsetDays = 1) {
  return new Date(getSeasonStartFromIndex(SEASON) + offsetDays * DAY_MS).toDateString()
}

test('getPercentile: first place is the 100th percentile', () => {
  assert.equal(getPercentile(1, 260), 100)
})

test('getPercentile: last place is close to the 0th percentile', () => {
  assert.equal(getPercentile(260, 260), 0)
})

test('getPercentile: the exact middle lands near 50', () => {
  assert.equal(getPercentile(130, 260), 50)
})

test('getPercentile is defensive against a missing or tiny cohort', () => {
  assert.equal(getPercentile(1, 0), 100)
  assert.equal(getPercentile(1, 1), 100)
})

test('countConceptsMasteredInSeason only counts records that cleared the bar', () => {
  const masteryByConcept = {
    'a:1': { score: MASTERY_THRESHOLD, lastPracticedDate: dateWithinSeason(2) },
    'a:2': { score: MASTERY_THRESHOLD - 1, lastPracticedDate: dateWithinSeason(3) },
  }
  assert.equal(countConceptsMasteredInSeason(masteryByConcept, SEASON), 1)
})

test('countConceptsMasteredInSeason excludes a mastered concept practiced outside the season window', () => {
  const beforeSeason = new Date(getSeasonStartFromIndex(SEASON) - DAY_MS).toDateString()
  const afterSeason = new Date(getSeasonStartFromIndex(SEASON + 1) + DAY_MS).toDateString()
  const masteryByConcept = {
    'a:1': { score: 100, lastPracticedDate: beforeSeason },
    'a:2': { score: 100, lastPracticedDate: afterSeason },
    'a:3': { score: 100, lastPracticedDate: dateWithinSeason(0) },
  }
  assert.equal(countConceptsMasteredInSeason(masteryByConcept, SEASON), 1)
})

test('countConceptsMasteredInSeason handles an empty or missing map', () => {
  assert.equal(countConceptsMasteredInSeason({}, SEASON), 0)
  assert.equal(countConceptsMasteredInSeason(undefined, SEASON), 0)
})

test('countConceptsMasteredInSeason ignores a record with no practice date yet', () => {
  const masteryByConcept = { 'a:1': { score: 100, lastPracticedDate: null } }
  assert.equal(countConceptsMasteredInSeason(masteryByConcept, SEASON), 0)
})

function fakeResult(overrides = {}) {
  return {
    seasonIndex: SEASON,
    rank: 12,
    cohortSize: 260,
    score: 900,
    reward: 500,
    outcome: 'promoted',
    fromLeague: 'Bronze League',
    toLeague: 'Silver League',
    qualifiedLeague: null,
    ...overrides,
  }
}

test('buildSeasonRecap includes the starting rank when it matches this season', () => {
  const recap = buildSeasonRecap(fakeResult(), { masteryByConcept: {}, seasonStartRank: { seasonIndex: SEASON, rank: 40 } })
  assert.equal(recap.startRank, 40)
  assert.equal(recap.finalRank, 12)
  assert.equal(recap.positionsChanged, 28, 'climbing 28 spots reads as +28')
})

test('buildSeasonRecap omits the starting rank when it belongs to a different season', () => {
  const recap = buildSeasonRecap(fakeResult(), { masteryByConcept: {}, seasonStartRank: { seasonIndex: SEASON - 1, rank: 40 } })
  assert.equal(recap.startRank, null)
  assert.equal(recap.positionsChanged, null)
})

test('buildSeasonRecap omits the starting rank when there is none at all', () => {
  const recap = buildSeasonRecap(fakeResult(), { masteryByConcept: {}, seasonStartRank: null })
  assert.equal(recap.startRank, null)
})

test('buildSeasonRecap carries through the season\'s real numbers untouched', () => {
  const recap = buildSeasonRecap(fakeResult(), { masteryByConcept: {}, seasonStartRank: null })
  assert.equal(recap.seasonCoins, 900)
  assert.equal(recap.reward, 500)
  assert.equal(recap.league, 'Bronze League')
  assert.equal(recap.toLeague, 'Silver League')
  assert.equal(recap.outcome, 'promoted')
  assert.equal(recap.percentile, getPercentile(12, 260))
})

test('formatPercentileBadge reads as a brag above the median, plainly below it', () => {
  assert.equal(formatPercentileBadge(95), 'Top 5%')
  assert.equal(formatPercentileBadge(50), 'Top 50%')
  assert.equal(formatPercentileBadge(100), 'Top 1%', 'never claims the impossible "Top 0%"')
  assert.equal(formatPercentileBadge(20), '20th percentile')
  assert.equal(formatPercentileBadge(0), '0th percentile')
})

test('formatPercentileLine names the league and never claims the opposite of the truth', () => {
  assert.equal(formatPercentileLine(95, 'Bronze League'), 'Top 5% of Bronze League.')
  assert.equal(formatPercentileLine(20, 'Bronze League'), 'Outscored 20% of Bronze League.')
})
