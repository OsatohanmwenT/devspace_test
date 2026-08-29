import test from 'node:test'
import assert from 'node:assert/strict'
import { getLeague, getLeagueById, leagues } from './leagues.js'

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
      league.promoteCount + league.demoteCount < league.cohortSize,
      `${league.id} zones overlap in a cohort of ${league.cohortSize}`,
    )
  }
})

// Bronze's cash-winner ceiling (180, see lib/rewardConfig.js) is the reason
// the cohort had to grow past the old flat 30 — this locks that relationship
// so the two configs can't quietly drift apart again.
test('every league cohort is comfortably larger than its cash-winner ceiling', () => {
  const cashWinnerCounts = { bronze: 180, silver: 75, gold: 39, sapphire: 24, diamond: 10 }
  for (const league of leagues) {
    assert.ok(
      league.cohortSize > cashWinnerCounts[league.id],
      `${league.id}'s cohort (${league.cohortSize}) must exceed its cash-winner ceiling (${cashWinnerCounts[league.id]}) so non-cash finishers are visible`,
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

test('there are exactly the five leagues the season is built around', () => {
  assert.deepEqual(leagues.map((league) => league.id), ['bronze', 'silver', 'gold', 'sapphire', 'diamond'])
})

test('only Bronze is free — every league above it requires Pro', () => {
  assert.equal(leagues[0].proRequired, false)
  for (const league of leagues.slice(1)) {
    assert.equal(league.proRequired, true, `${league.id} should require Pro`)
  }
})

test('getLeagueById finds a league by id, and returns null for an unknown one', () => {
  assert.equal(getLeagueById('gold').id, 'gold')
  assert.equal(getLeagueById('not-a-league'), null)
})
