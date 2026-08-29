import test from 'node:test'
import assert from 'node:assert/strict'
import { canCompeteInLeague } from './leagueAccess.js'
import { leagues } from '../data/leagues.js'

const bronze = leagues[0]
const silver = leagues[1]

test('Bronze never requires Pro', () => {
  assert.equal(canCompeteInLeague({}, bronze, 10), true)
  assert.equal(canCompeteInLeague({ isPremium: false }, bronze, 10), true)
})

test('Silver+ requires Pro without an active pass', () => {
  assert.equal(canCompeteInLeague({ isPremium: false }, silver, 10), false)
  assert.equal(canCompeteInLeague({ isPremium: true }, silver, 10), true)
})

test('a Silver Pass covers only the season it was granted for', () => {
  const progress = { isPremium: false, silverPassSeasonIndex: 11 }
  assert.equal(canCompeteInLeague(progress, silver, 11), true)
  assert.equal(canCompeteInLeague(progress, silver, 12), false, 'the pass does not carry over')
  assert.equal(canCompeteInLeague(progress, silver, 10), false, 'the pass is not retroactive')
})

test('a missing progress object never grants access, and never throws', () => {
  assert.equal(canCompeteInLeague(undefined, silver, 10), false)
  assert.equal(canCompeteInLeague(null, silver, 10), false)
})
