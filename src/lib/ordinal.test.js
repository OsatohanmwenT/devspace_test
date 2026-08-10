import test from 'node:test'
import assert from 'node:assert/strict'
import { ordinal } from './ordinal.js'

test('the common cases take their own suffix', () => {
  assert.equal(ordinal(1), '1st')
  assert.equal(ordinal(2), '2nd')
  assert.equal(ordinal(3), '3rd')
  assert.equal(ordinal(4), '4th')
})

// The bug this exists to prevent: a rank of 22 rendering as "22th".
test('suffixes follow the last digit past ten', () => {
  assert.equal(ordinal(21), '21st')
  assert.equal(ordinal(22), '22nd')
  assert.equal(ordinal(23), '23rd')
  assert.equal(ordinal(24), '24th')
  assert.equal(ordinal(30), '30th')
})

test('the teens are all th', () => {
  assert.equal(ordinal(11), '11th')
  assert.equal(ordinal(12), '12th')
  assert.equal(ordinal(13), '13th')
  assert.equal(ordinal(111), '111th')
  assert.equal(ordinal(112), '112th')
})

test('every rank in a cohort renders sensibly', () => {
  for (let rank = 1; rank <= 30; rank += 1) {
    assert.match(ordinal(rank), /^\d+(st|nd|rd|th)$/)
  }
})
