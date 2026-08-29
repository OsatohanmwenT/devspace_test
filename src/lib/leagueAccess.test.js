import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyLeagueAccessGate,
  BRONZE_PASS_RANK_THRESHOLD,
  findUsablePass,
  getAccessCta,
  grantSilverPassIfEarned,
  sanitizeLeagueAccess,
} from './leagueAccess.js'

const BRONZE = 0
const SILVER = 1
const GOLD = 2

test('a top-10 Bronze finish earns a Silver pass usable next season', () => {
  const passes = grantSilverPassIfEarned({ leagueIndex: BRONZE, leaguePasses: [] }, BRONZE, 7, 10)
  assert.equal(passes.length, 1)
  assert.equal(passes[0].leagueId, 'silver')
  assert.equal(passes[0].grantedSeasonIndex, 10)
  assert.equal(passes[0].usableSeasonIndex, 11)
  assert.equal(passes[0].used, false)
})

test('finishing 11th or worse in Bronze earns no pass', () => {
  assert.equal(BRONZE_PASS_RANK_THRESHOLD, 10)
  const passes = grantSilverPassIfEarned({ leagueIndex: BRONZE, leaguePasses: [] }, BRONZE, 11, 10)
  assert.deepEqual(passes, [])
})

test('a top-10 finish outside Bronze earns nothing — the pass is Bronze-specific', () => {
  const passes = grantSilverPassIfEarned({ leagueIndex: SILVER, leaguePasses: [] }, BRONZE, 3, 10)
  assert.deepEqual(passes, [])
})

test('the same season never grants a duplicate pass', () => {
  const existing = [{ leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 11, used: false }]
  const passes = grantSilverPassIfEarned({ leagueIndex: BRONZE, leaguePasses: existing }, BRONZE, 1, 10)
  assert.equal(passes.length, 1)
})

test('findUsablePass ignores a used pass and one for the wrong season', () => {
  const passes = [
    { leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 11, used: true },
    { leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 12, used: false },
  ]
  assert.equal(findUsablePass(passes, 'silver', 11), null)
  assert.equal(findUsablePass(passes, 'silver', 12)?.usableSeasonIndex, 12)
})

test('Bronze needs no gate at all', () => {
  const result = applyLeagueAccessGate({}, BRONZE, 11, [])
  assert.deepEqual(result, { leagueIndex: BRONZE, leaguePasses: [], accessGranted: true, via: 'free' })
})

test('a Pro learner is granted Silver directly, passes untouched', () => {
  const passes = [{ leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 11, used: false }]
  const result = applyLeagueAccessGate({ isPremium: true }, SILVER, 11, passes)
  assert.equal(result.leagueIndex, SILVER)
  assert.equal(result.accessGranted, true)
  assert.equal(result.via, 'pro')
  assert.equal(result.leaguePasses[0].used, false, 'a Pro learner should not burn a pass they did not need')
})

test('a free learner with a usable pass is granted Silver, and the pass is spent', () => {
  const passes = [{ leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 11, used: false }]
  const result = applyLeagueAccessGate({ isPremium: false }, SILVER, 11, passes)
  assert.equal(result.leagueIndex, SILVER)
  assert.equal(result.accessGranted, true)
  assert.equal(result.via, 'pass')
  assert.equal(result.leaguePasses[0].used, true)
})

test('a free learner with no pass is parked in Bronze — qualifying is not entering', () => {
  const result = applyLeagueAccessGate({ isPremium: false }, SILVER, 11, [])
  assert.equal(result.leagueIndex, BRONZE)
  assert.equal(result.accessGranted, false)
  assert.equal(result.via, null)
})

test('a free learner with a pass for a different season is still parked in Bronze', () => {
  const passes = [{ leagueId: 'silver', grantedSeasonIndex: 10, usableSeasonIndex: 12, used: false }]
  const result = applyLeagueAccessGate({ isPremium: false }, SILVER, 11, passes)
  assert.equal(result.leagueIndex, BRONZE)
  assert.equal(result.accessGranted, false)
})

test('the gate applies just as much to a demotion target as a promotion one', () => {
  // A learner falling from Gold to Silver still needs Silver access.
  const result = applyLeagueAccessGate({ isPremium: false }, SILVER, 11, [])
  assert.equal(result.leagueIndex, BRONZE)
})

test('a lapsed-Pro learner continuing in Gold is parked in Bronze at the next gate', () => {
  const result = applyLeagueAccessGate({ isPremium: false }, GOLD, 11, [])
  assert.equal(result.leagueIndex, BRONZE)
  assert.equal(result.accessGranted, false)
})

test('sanitizeLeagueAccess leaves a mid-season Pro lapse alone — the grant already covers this season', () => {
  const progress = { leagueIndex: SILVER, leagueAccessGrantedForSeason: 11, isPremium: false }
  assert.deepEqual(sanitizeLeagueAccess(progress, 11), progress)
})

test('sanitizeLeagueAccess resets a league with no matching grant for the current season', () => {
  const progress = { leagueIndex: SILVER, leagueAccessGrantedForSeason: 10, isPremium: false }
  const sanitized = sanitizeLeagueAccess(progress, 11)
  assert.equal(sanitized.leagueIndex, BRONZE)
})

test('sanitizeLeagueAccess never touches Bronze, which needs no grant', () => {
  const progress = { leagueIndex: BRONZE, leagueAccessGrantedForSeason: null }
  assert.deepEqual(sanitizeLeagueAccess(progress, 11), progress)
})

test('getAccessCta labels each access path distinctly', () => {
  assert.equal(getAccessCta('pro').label, 'Enter Silver')
  assert.equal(getAccessCta('pass').label, 'Use Silver Pass')
  assert.equal(getAccessCta(null).label, 'Unlock Silver with Pro')
})
