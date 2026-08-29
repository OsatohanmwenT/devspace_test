import test from 'node:test'
import assert from 'node:assert/strict'
import { getRivalProfile } from './rivalProfile.js'
import { rivals } from '../data/rivals.js'

test('the same rival and season always yields the same profile', () => {
  const first = getRivalProfile(rivals[0], 34)
  const second = getRivalProfile(rivals[0], 34)
  assert.deepEqual(first, second)
})

test('a different season yields a different-looking profile', () => {
  const first = getRivalProfile(rivals[0], 34)
  const second = getRivalProfile(rivals[0], 35)
  assert.notDeepEqual(first, second)
})

test('different rivals in the same season do not collide', () => {
  const first = getRivalProfile(rivals[0], 34)
  const second = getRivalProfile(rivals[1], 34)
  assert.notDeepEqual(first, second)
})

test('every field is present and sane', () => {
  const profile = getRivalProfile(rivals[0], 34)
  assert.ok(profile.streakDays >= 1)
  assert.ok(profile.conceptsMastered >= 3)
  assert.ok(profile.reinforcementChecks >= 0)
  assert.ok(profile.projectMilestones >= 0)
  assert.ok(profile.recentProof.length > 0)
})
