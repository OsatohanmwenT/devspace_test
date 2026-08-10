import test from 'node:test'
import assert from 'node:assert/strict'
import { COHORT_SIZE, getLeague, leagues } from './leagues.js'

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
      leagues[index].promoteCount <= leagues[index - 1].promoteCount,
      `${leagues[index].id} must not promote more people than ${leagues[index - 1].id}`,
    )
  }
})

// Overlapping zones would put the same rank in both, and getZoneSummary would
// report a learner as simultaneously promoting and demoting.
test('promotion and demotion zones never overlap', () => {
  for (const league of leagues) {
    assert.ok(
      league.promoteCount + league.demoteCount < COHORT_SIZE,
      `${league.id} zones overlap in a cohort of ${COHORT_SIZE}`,
    )
  }
})

test('the ends of the ladder are closed', () => {
  assert.equal(leagues[0].demoteCount, 0, 'there is nowhere below Bronze to fall to')
  assert.equal(leagues.at(-1).promoteCount, 0, 'there is nowhere above Diamond to climb to')
})

test('getLeague clamps instead of returning undefined', () => {
  assert.equal(getLeague(-5).id, leagues[0].id)
  assert.equal(getLeague(999).id, leagues.at(-1).id)
  assert.equal(getLeague(2).id, leagues[2].id)
})
