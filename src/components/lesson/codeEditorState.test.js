import test from 'node:test'
import assert from 'node:assert/strict'
import { isSimulatedPythonComplete } from './codeEditorState.js'

test('the simulated editor accepts a calculated total with any clear variable name', () => {
  const code = 'hours_per_week = 40\nweeks_per_year = 52\n\nyearly_total = hours_per_week * weeks_per_year\nprint(yearly_total)'
  assert.equal(isSimulatedPythonComplete(code), true)
})

test('the simulated editor requires the calculated value to be printed', () => {
  const code = 'hours_per_week = 40\nweeks_per_year = 52\nyearly_total = hours_per_week * weeks_per_year\nprint(hours_per_week)'
  assert.equal(isSimulatedPythonComplete(code), false)
})
