import test from 'node:test'
import assert from 'node:assert/strict'
import { COHORT_SIZE, getDemoteCount, getLeague, getPromoteCount, leagues } from './leagues.js'

test('the ladder climbs: each league is paced harder than the one below it', () => {
  for (let index = 1; index < leagues.length; index += 1) {
    assert.ok(
      leagues[index].pace > leagues[index - 1].pace,
      `${leagues[index].id} must be paced above ${leagues[index - 1].id}`,
    )
  }
})

test('promotion narrows as you climb', () => {
  for (let index = 1; index < leagues.length; index += 1) {
    assert.ok(
      getPromoteCount(leagues[index]) <= getPromoteCount(leagues[index - 1]),
      `${leagues[index].id} must not promote more people than ${leagues[index - 1].id}`,
    )
  }
})

// Overlapping zones would put the same rank in both, and getZoneSummary would
// report a learner as simultaneously promoting and demoting.
test('promotion and demotion zones never overlap', () => {
  for (const league of leagues) {
    assert.ok(
      getPromoteCount(league) + getDemoteCount(league) < COHORT_SIZE,
      `${league.id} zones overlap in a cohort of ${COHORT_SIZE}`,
    )
  }
})

test('the ends of the ladder are closed', () => {
  assert.equal(leagues[0].demotePercent, 0, 'there is nowhere below Bronze to fall to')
  assert.equal(leagues.at(-1).promotePercent, 0, 'there is nowhere above Diamond to climb to')
})

test('getLeague clamps instead of returning undefined', () => {
  assert.equal(getLeague(-5).id, leagues[0].id)
  assert.equal(getLeague(999).id, leagues.at(-1).id)
  assert.equal(getLeague(2).id, leagues[2].id)
})

test('there are exactly the five leagues the spec calls for', () => {
  assert.deepEqual(leagues.map((league) => league.id), ['bronze', 'silver', 'gold', 'sapphire', 'diamond'])
})

test('Bronze is free; everything above it needs Pro', () => {
  assert.equal(leagues[0].requiresPro, false)
  for (const league of leagues.slice(1)) {
    assert.equal(league.requiresPro, true, `${league.id} should require Pro`)
  }
})

test('percentages round to a sane row count against the fixed cohort', () => {
  for (const league of leagues) {
    assert.ok(getPromoteCount(league) >= 0 && getPromoteCount(league) < COHORT_SIZE)
    assert.ok(getDemoteCount(league) >= 0 && getDemoteCount(league) < COHORT_SIZE)
  }
})
