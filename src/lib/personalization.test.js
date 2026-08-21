import test from 'node:test'
import assert from 'node:assert/strict'
import { getCheatsheetPersonalization } from './personalization.js'

test('a missing profile falls back to the middle rung with no reason to show', () => {
  const result = getCheatsheetPersonalization(null)
  assert.equal(result.rung, 2)
  assert.equal(result.wantsExamplesUpFront, false)
  assert.equal(result.wantsMentalModel, false)
  assert.equal(result.reason, null)
})

test('a complete beginner gets the mental model, not the examples opened', () => {
  const result = getCheatsheetPersonalization({ rung: 1, immediateNeed: [] })
  assert.equal(result.wantsMentalModel, true)
  assert.equal(result.wantsExamplesUpFront, false)
  assert.match(result.reason, /just starting out/)
})

test('an experienced learner gets examples opened, not the mental model', () => {
  const result = getCheatsheetPersonalization({ rung: 4, immediateNeed: [] })
  assert.equal(result.wantsExamplesUpFront, true)
  assert.equal(result.wantsMentalModel, false)
  assert.match(result.reason, /experience/)
})

test('interview prep opens examples regardless of rung, with its own reason', () => {
  const result = getCheatsheetPersonalization({ rung: 1, immediateNeed: ['interview_prep'] })
  assert.equal(result.wantsExamplesUpFront, true)
  assert.match(result.reason, /interviews/)
})

test('fixing gaps opens examples early like interview prep does', () => {
  const result = getCheatsheetPersonalization({ rung: 2, immediateNeed: ['fix_gaps'] })
  assert.equal(result.wantsExamplesUpFront, true)
})

test('a middling rung with no special need gets neither treatment', () => {
  const result = getCheatsheetPersonalization({ rung: 2, immediateNeed: ['career_path'] })
  assert.equal(result.wantsExamplesUpFront, false)
  assert.equal(result.wantsMentalModel, false)
  assert.equal(result.reason, null)
})
