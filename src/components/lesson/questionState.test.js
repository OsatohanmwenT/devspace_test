import test from 'node:test'
import assert from 'node:assert/strict'
import { clearIncorrectBlanks, emptyAnswer, isQuestionComplete, isQuestionCorrect, isTableType, toggleRowSelection } from './questionState.js'

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

const fillQuestion = {
  type: 'fill',
  options: ['SELECT', 'FROM', 'WHERE', 'HAVING'],
  answers: ['SELECT', 'FROM', 'WHERE'],
}

test('clearIncorrectBlanks keeps a correct blank and clears a wrong one', () => {
  // 0=SELECT (right), 3=HAVING (wrong, should have been WHERE at index 2), 1=FROM (right)
  assert.deepEqual(clearIncorrectBlanks(fillQuestion, [0, 1, 3]), [0, 1, undefined])
})

test('clearIncorrectBlanks clears every blank when none were correct', () => {
  assert.deepEqual(clearIncorrectBlanks(fillQuestion, [3, 3, 3]), [undefined, undefined, undefined])
})

test('clearIncorrectBlanks treats a missing answer as an empty set of blanks', () => {
  assert.deepEqual(clearIncorrectBlanks(fillQuestion, undefined), [])
})
