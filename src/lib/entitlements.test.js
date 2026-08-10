import test from 'node:test'
import assert from 'node:assert/strict'
import { CAPABILITIES, can } from './entitlements.js'

test('every premium capability is denied to a free learner', () => {
  for (const capability of Object.values(CAPABILITIES)) {
    assert.equal(can({ isPremium: false }, capability), false, capability)
  }
})

test('every premium capability is granted to a premium learner', () => {
  for (const capability of Object.values(CAPABILITIES)) {
    assert.equal(can({ isPremium: true }, capability), true, capability)
  }
})

test('a missing progress object never grants anything, and never throws', () => {
  assert.equal(can(undefined, CAPABILITIES.PRO_TAG), false)
  assert.equal(can(null, CAPABILITIES.PRO_TAG), false)
  assert.equal(can({}, CAPABILITIES.PRO_TAG), false)
})

test('an unknown capability defaults to allowed rather than silently blocking', () => {
  assert.equal(can({ isPremium: false }, 'not-a-real-capability'), true)
})
