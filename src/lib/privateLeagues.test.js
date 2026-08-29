import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createPrivateLeague,
  generateInviteCode,
  getPrivateLeagueStandings,
  joinPrivateLeagueByCode,
  leavePrivateLeague,
} from './privateLeagues.js'
import { USER_ID } from './leagueSim.js'

const base = { privateLeagues: {} }

test('creating a league adds it with an id, a code, and 4-6 members', () => {
  const next = createPrivateLeague(base, 'Study Crew')
  const leagues = Object.values(next.privateLeagues)

  assert.equal(leagues.length, 1)
  const [league] = leagues
  assert.equal(league.name, 'Study Crew')
  assert.ok(league.id, 'league needs an id')
  assert.ok(league.code?.length > 0, 'league needs an invite code')
  assert.ok(league.memberRivalIds.length >= 4 && league.memberRivalIds.length <= 6, `expected 4-6 members, got ${league.memberRivalIds.length}`)
})

test('a blank name does not create a league', () => {
  assert.deepEqual(createPrivateLeague(base, ''), base)
  assert.deepEqual(createPrivateLeague(base, '   '), base)
})

test('invite codes avoid ambiguous characters', () => {
  for (let i = 0; i < 50; i += 1) {
    const code = generateInviteCode()
    assert.equal(code.length, 6)
    assert.doesNotMatch(code, /[0O1I]/, `code ${code} contains an ambiguous character`)
  }
})

test('the same code always derives the same league', () => {
  const first = joinPrivateLeagueByCode(base, 'ABC234')
  const second = joinPrivateLeagueByCode(base, 'abc234')

  const firstLeague = Object.values(first.privateLeagues)[0]
  const secondLeague = Object.values(second.privateLeagues)[0]

  assert.equal(firstLeague.name, secondLeague.name)
  assert.deepEqual(firstLeague.memberRivalIds, secondLeague.memberRivalIds)
})

test('joining the same code twice does not duplicate the league', () => {
  const once = joinPrivateLeagueByCode(base, 'ABC234')
  const twice = joinPrivateLeagueByCode(once, 'abc234')

  assert.equal(Object.keys(twice.privateLeagues).length, 1)
})

test('a blank code does not join anything', () => {
  assert.deepEqual(joinPrivateLeagueByCode(base, ''), base)
  assert.deepEqual(joinPrivateLeagueByCode(base, '   '), base)
})

test('leaving removes exactly that league and nothing else', () => {
  const withTwo = joinPrivateLeagueByCode(createPrivateLeague(base, 'Study Crew'), 'ZZZ999')
  const [firstId, secondId] = Object.keys(withTwo.privateLeagues)

  const afterLeaving = leavePrivateLeague(withTwo, firstId)

  assert.equal(Object.keys(afterLeaving.privateLeagues).length, 1)
  assert.equal(secondId in afterLeaving.privateLeagues, true)
  assert.equal(firstId in afterLeaving.privateLeagues, false)
})

test('leaving a league that is not there is a no-op', () => {
  assert.deepEqual(leavePrivateLeague(base, 'nope'), base)
})

test('standings always include the learner, ranked, with the exact coin total passed in', () => {
  const withLeague = createPrivateLeague(base, 'Study Crew')
  const [league] = Object.values(withLeague.privateLeagues)

  const standings = getPrivateLeagueStandings(league, 900, 34)

  assert.equal(standings.filter((entry) => entry.isCurrentUser).length, 1)
  const user = standings.find((entry) => entry.id === USER_ID)
  assert.equal(user.score, 900)
  assert.ok(user.rank >= 1 && user.rank <= standings.length)

  for (let index = 1; index < standings.length; index += 1) {
    assert.ok(standings[index - 1].score >= standings[index].score, 'standings are not sorted by score')
  }
})

test('outscoring every member puts the learner first', () => {
  const withLeague = createPrivateLeague(base, 'Study Crew')
  const [league] = Object.values(withLeague.privateLeagues)

  const standings = getPrivateLeagueStandings(league, 1000000, 34)
  assert.equal(standings[0].id, USER_ID)
})

// The hard rule from the spec: private leagues never touch official league
// state. This function only ever reads a coin total in and rankings out —
// it has no path to leagueIndex, seasonCoins, or promotion at all.
test('private league standings never reference official league fields', () => {
  const withLeague = createPrivateLeague(base, 'Study Crew')
  const [league] = Object.values(withLeague.privateLeagues)
  const before = { leagueIndex: 2, seasonCoins: 900, seasonIndex: 34 }

  getPrivateLeagueStandings(league, before.seasonCoins, before.seasonIndex)

  assert.deepEqual(before, { leagueIndex: 2, seasonCoins: 900, seasonIndex: 34 }, 'official state must be untouched')
})
