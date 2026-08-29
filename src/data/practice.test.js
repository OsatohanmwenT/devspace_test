import test from 'node:test'
import assert from 'node:assert/strict'
import { practiceSessions } from './practice.js'

function tableSelectQuestions() {
  return practiceSessions.flatMap((session) => session.questions.filter((question) => question.type === 'table-select'))
}

test('every table-select question\'s correct rows actually exist in its own table', () => {
  for (const question of tableSelectQuestions()) {
    const rowKey = question.table.rowKey ?? 'id'
    const rowIds = new Set(question.table.rows.map((row) => row[rowKey]))
    for (const id of question.correctRowIds) {
      assert.ok(rowIds.has(id), `${question.id}: correctRowIds references missing row "${id}"`)
    }
  }
})

test('every table-select question has at least one correct row and at least one distractor', () => {
  for (const question of tableSelectQuestions()) {
    assert.ok(question.correctRowIds.length > 0, `${question.id}: no correct rows`)
    assert.ok(question.correctRowIds.length < question.table.rows.length, `${question.id}: every row is correct, so selecting nothing wrong isn't possible`)
  }
})

test("the Lagos filter question's answer matches every row whose city is Lagos, nothing else", () => {
  const question = practiceSessions.find((session) => session.id === 'sql-filtering-rows').questions.find((item) => item.id === 'sql-3')
  const expected = question.table.rows.filter((row) => row.city === 'Lagos').map((row) => row.order_id)
  assert.deepEqual([...question.correctRowIds].sort(), expected.sort())
})

test("the delivered-and-total filter question's answer matches rows satisfying both conditions", () => {
  const question = practiceSessions.find((session) => session.id === 'sql-filtering-rows').questions.find((item) => item.id === 'sql-4')
  const expected = question.table.rows.filter((row) => row.status === 'delivered' && row.total > 45).map((row) => row.order_id)
  assert.deepEqual([...question.correctRowIds].sort(), expected.sort())
})

test('every code-fill question\'s answers are all present among its options', () => {
  const codeFillQuestions = practiceSessions.flatMap((session) => session.questions.filter((question) => question.type === 'code-fill'))
  for (const question of codeFillQuestions) {
    for (const answer of question.answers) {
      assert.ok(question.options.includes(answer), `${question.id}: "${answer}" is not offered as an option`)
    }
  }
})

test('every practice session has a unique id and every question within it has a unique id', () => {
  const sessionIds = practiceSessions.map((session) => session.id)
  assert.equal(new Set(sessionIds).size, sessionIds.length)

  const allQuestionIds = practiceSessions.flatMap((session) => session.questions.map((question) => question.id))
  assert.equal(new Set(allQuestionIds).size, allQuestionIds.length)
})
