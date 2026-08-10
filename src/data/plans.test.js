import test from 'node:test'
import assert from 'node:assert/strict'
import { getPlan, getPlansByType, getPlanType, PLAN_TYPES, plans } from './plans.js'

test('every plan belongs to a declared payment model', () => {
  const known = new Set(PLAN_TYPES.map((type) => type.id))
  for (const plan of plans) {
    assert.equal(known.has(plan.type), true, `${plan.id} has an unknown type: ${plan.type}`)
  }
})

// The toggle would render an empty grid for a model with nothing behind it.
test('every payment model has at least one plan', () => {
  for (const type of PLAN_TYPES) {
    assert.ok(getPlansByType(type.id).length > 0, `${type.id} has no plans`)
  }
})

test('filtering by model returns only that model', () => {
  assert.deepEqual(getPlansByType('subscription').map((plan) => plan.id), ['monthly', 'annual'])
  assert.deepEqual(getPlansByType('onetime').map((plan) => plan.id), ['lifetime'])
  assert.deepEqual(getPlansByType('nope'), [])
})

// Each model names what it commits you to and what the other costs — without
// that pair the toggle is just a filter and the difference stays hidden.
test('every payment model explains itself and points at the alternative', () => {
  for (const type of PLAN_TYPES) {
    assert.ok(type.note?.length > 0, `${type.id} is missing a note`)
    assert.ok(type.crossRef?.length > 0, `${type.id} is missing a cross-reference`)
  }
})

test('an unknown id falls back rather than returning undefined', () => {
  assert.equal(getPlanType('nope').id, PLAN_TYPES[0].id)
  assert.equal(getPlan('nope').id, 'annual')
  assert.equal(getPlan('lifetime').id, 'lifetime')
})
