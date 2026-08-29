import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isTableTaskComplete, isTableTasksComplete, isSortComplete, isIssueSpotterComplete, isReorderCorrect, isFieldSelectionValid,
} from './practiceCheck.js'

test('isTableTaskComplete matches row, column, and cell targets independently', () => {
  const rowTask = { id: 't1', target: { type: 'row', rowId: 'NS1004' } }
  assert.equal(isTableTaskComplete(rowTask, { type: 'row', rowId: 'NS1004' }), true)
  assert.equal(isTableTaskComplete(rowTask, { type: 'row', rowId: 'NS1001' }), false)
  assert.equal(isTableTaskComplete(rowTask, { type: 'column', columnKey: 'city' }), false)

  const columnTask = { id: 't2', target: { type: 'column', columnKey: 'delivery_minutes' } }
  assert.equal(isTableTaskComplete(columnTask, { type: 'column', columnKey: 'delivery_minutes' }), true)
  assert.equal(isTableTaskComplete(columnTask, { type: 'column', columnKey: 'city' }), false)

  const cellTask = { id: 't3', target: { type: 'cell', rowId: 'NS1003', columnKey: 'delivery_minutes' } }
  assert.equal(isTableTaskComplete(cellTask, { type: 'cell', rowId: 'NS1003', columnKey: 'delivery_minutes' }), true)
  assert.equal(isTableTaskComplete(cellTask, { type: 'cell', rowId: 'NS1003', columnKey: 'city' }), false)
  assert.equal(isTableTaskComplete(cellTask, null), false)
})

test('isTableTasksComplete requires every task id to have been answered', () => {
  const tasks = [{ id: 't1' }, { id: 't2' }, { id: 't3' }]
  assert.equal(isTableTasksComplete(tasks, ['t1', 't2']), false)
  assert.equal(isTableTasksComplete(tasks, ['t1', 't2', 't3']), true)
})

test('isSortComplete requires every item assigned to its own zone', () => {
  const items = [{ id: 'a', zone: 'categorical' }, { id: 'b', zone: 'numerical' }]
  assert.equal(isSortComplete(items, { a: 'categorical', b: 'numerical' }), true)
  assert.equal(isSortComplete(items, { a: 'numerical', b: 'numerical' }), false)
  assert.equal(isSortComplete(items, { a: 'categorical' }), false)
})

test('isIssueSpotterComplete requires every listed issue to have been found', () => {
  const issues = [{ id: 'missing-city' }, { id: 'duplicate' }]
  assert.equal(isIssueSpotterComplete(issues, ['missing-city']), false)
  assert.equal(isIssueSpotterComplete(issues, ['missing-city', 'duplicate']), true)
  assert.equal(isIssueSpotterComplete(issues, ['missing-city', 'duplicate', 'extra']), true)
})

test('isReorderCorrect checks exact sequence and length', () => {
  assert.equal(isReorderCorrect(['ask', 'inspect', 'clean'], ['ask', 'inspect', 'clean']), true)
  assert.equal(isReorderCorrect(['inspect', 'ask', 'clean'], ['ask', 'inspect', 'clean']), false)
  assert.equal(isReorderCorrect(['ask', 'inspect'], ['ask', 'inspect', 'clean']), false)
})

test('isFieldSelectionValid requires every required field and rejects anything outside required+optional', () => {
  const required = ['customer_segment', 'delivery_minutes']
  const optional = ['city']
  assert.equal(isFieldSelectionValid(['customer_segment', 'delivery_minutes'], required, optional), true)
  assert.equal(isFieldSelectionValid(['customer_segment', 'delivery_minutes', 'city'], required, optional), true)
  assert.equal(isFieldSelectionValid(['customer_segment'], required, optional), false, 'missing a required field')
  assert.equal(isFieldSelectionValid(['customer_segment', 'delivery_minutes', 'customer_email'], required, optional), false, 'includes a forbidden field')
})
