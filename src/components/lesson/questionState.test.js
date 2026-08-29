import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyAnswer, isQuestionComplete, isQuestionCorrect, isTableType, toggleRowSelection } from './questionState.js'

const tableQuestion = {
  type: 'table-select',
  correctRowIds: ['A', 'C'],
}

test('isTableType recognizes table-select and nothing else', () => {
  assert.equal(isTableType(tableQuestion), true)
  assert.equal(isTableType({ type: 'multiple-choice' }), false)
  assert.equal(isTableType({ type: 'fill' }), false)
})

test('a table question starts with an empty selection', () => {
  assert.deepEqual(emptyAnswer(tableQuestion), [])
})

test('a table question is incomplete until at least one row is selected', () => {
  assert.equal(isQuestionComplete(tableQuestion, []), false)
  assert.equal(isQuestionComplete(tableQuestion, undefined), false)
  assert.equal(isQuestionComplete(tableQuestion, ['A']), true)
})

test('a table answer is correct only when the selected rows exactly match, in any order', () => {
  assert.equal(isQuestionCorrect(tableQuestion, ['A', 'C']), true)
  assert.equal(isQuestionCorrect(tableQuestion, ['C', 'A']), true)
  assert.equal(isQuestionCorrect(tableQuestion, ['A']), false)
  assert.equal(isQuestionCorrect(tableQuestion, ['A', 'B', 'C']), false)
  assert.equal(isQuestionCorrect(tableQuestion, []), false)
})

test('toggleRowSelection adds an unselected row and removes a selected one', () => {
  assert.deepEqual(toggleRowSelection(undefined, 'A'), ['A'])
  assert.deepEqual(toggleRowSelection(['A'], 'B'), ['A', 'B'])
  assert.deepEqual(toggleRowSelection(['A', 'B'], 'A'), ['B'])
})
