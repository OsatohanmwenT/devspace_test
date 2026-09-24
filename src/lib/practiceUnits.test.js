import test from 'node:test'
import assert from 'node:assert/strict'
import { getPracticeUnits, isUnitPracticeId, unitPracticeId } from './practiceUnits.js'

const quiz = (...ids) => ({ type: 'quiz', content: { questions: ids.map((id) => ({ id, type: 'multiple-choice' })) } })
const content = {
  a: { id: 'a', title: 'A', concepts: [{ activities: [quiz('a1', 'a2')] }] },
  b: { id: 'b', title: 'B', concepts: [{ activities: [quiz('b1')] }] },
}
const lookup = (id) => content[id] ?? null
const sessions = [{ id: 'cat', unitIds: ['unit-one'], questions: [{ id: 'c1' }, { id: 'c2' }] }]
const path = {
  cards: [
    { id: 'unit-one', title: 'Unit One', lessons: [{ id: 'a', title: 'Lesson A' }, { id: 'b', title: 'Lesson B', checkpoint: true }, { id: 'c', title: 'Lesson C' }] },
    { id: 'unit-two', title: 'Unit Two', lessons: [{ id: 'd', title: 'Lesson D' }] },
    { id: 'upcoming', title: 'Soon', lessons: [{ id: 'upcoming-preview', checkpoint: true }] },
  ],
}
const units = (completed) => getPracticeUnits(path, completed, { lookup, sessions, now: new Date(2026, 8, 24) })

test('a unit stays locked until its checkpoint is passed', () => {
  const [one] = units({ a: { completedAt: 'x' } })
  assert.equal(one.unlocked, false)
  assert.equal(one.session, null)
  assert.equal(one.requirement, 'Pass the Lesson B checkpoint')
  assert.deepEqual([one.gateDone, one.gateTotal], [1, 2])
})

test('passing the checkpoint unlocks a set built from taught lessons plus tagged catalogue sessions', () => {
  const [one] = units({ a: { completedAt: 'x' }, b: { completedAt: 'x' } })
  assert.equal(one.unlocked, true)
  assert.equal(one.questionCount, 5)
  assert.equal(one.session.id, unitPracticeId('unit-one'))
  assert.equal(one.session.questions.length, 5)
  assert.deepEqual(new Set(one.session.questions.map((question) => question.id)), new Set(['a:a1', 'a:a2', 'b:b1', 'cat:c1', 'cat:c2']))
})

test('a unit without a checkpoint needs every lesson; placeholder units are left out', () => {
  const all = units({})
  assert.deepEqual(all.map((unit) => unit.regionId), ['unit-one', 'unit-two'])
  assert.equal(all[1].requirement, 'Finish Lesson D')
  assert.equal(units({ d: { completedAt: 'x' } })[1].unlocked, true)
})

test('an unlocked unit with nothing to ask yet offers no session', () => {
  const [, two] = units({ d: { completedAt: 'x' } })
  assert.equal(two.session, null)
})

test('unit practice ids are recognisable', () => {
  assert.equal(isUnitPracticeId(unitPracticeId('x')), true)
  assert.equal(isUnitPracticeId('warm-up'), false)
})

test('a checkpoint already named as one is not called a "checkpoint checkpoint"', () => {
  const named = { cards: [{ id: 'u', title: 'U', lessons: [{ id: 'x', title: 'Feature checkpoint', checkpoint: true }] }] }
  assert.equal(getPracticeUnits(named, {}, { lookup, sessions })[0].requirement, 'Pass the Feature checkpoint')
})
