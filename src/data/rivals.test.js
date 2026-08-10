import test from 'node:test'
import assert from 'node:assert/strict'
import { rivals } from './rivals.js'

const PRO = rivals.filter((rival) => rival.tag === 'PRO')
const FREE = rivals.filter((rival) => rival.tag !== 'PRO')

function meanPace(group) {
  return group.reduce((total, rival) => total + rival.pace, 0) / group.length
}

// buildCohort shuffles `rivals` by index, so this array's order is the seed for
// every cohort ever generated. Editing a field in place is fine; moving,
// inserting or deleting a line silently rewrites history. This snapshot is the
// tripwire — if it fails, check you did not reorder the file.
test('rival order is unchanged', () => {
  assert.deepEqual(rivals.map((rival) => rival.id), [
    'stefano-d', 'nuriye-s', 'varun-y', 'pranay-g', 'narduccio-v',
    'amara-k', 'jonas-b', 'priya-s', 'leo-f', 'mina-t',
    'hooriya-i', 'samri-b', 'grid-g', 'kazuhiro-c', 'sridevi-r',
    'tomas-n', 'aisha-m', 'wei-l', 'sofia-r', 'daniel-o',
    'elena-v', 'hiroshi-t', 'fatima-z', 'lucas-m', 'ingrid-l',
    'omar-h', 'yuki-s', 'nadia-p', 'carlos-s', 'mei-w',
    'rasmus-j', 'chidi-e', 'anya-k', 'ravi-p', 'clara-b',
    'tunde-a', 'sasha-i', 'linnea-o', 'kofi-m', 'zara-q',
    'marco-r', 'hana-k', 'pablo-g', 'freya-n', 'ibrahim-d',
  ])
})

test('every rival is well formed', () => {
  assert.equal(new Set(rivals.map((rival) => rival.id)).size, rivals.length)

  for (const rival of rivals) {
    assert.ok(rival.pace > 0, `${rival.id} needs a positive pace`)
    assert.ok(rival.consistency > 0 && rival.consistency <= 1, `${rival.id} consistency must be a probability`)
    assert.ok(rival.name && rival.role, `${rival.id} needs a name and a role`)
  }
})

// The PRO tag is cosmetic. If it drifts back onto only the fastest personas the
// board starts implying that paying is what puts those names on top.
test('PRO is not a proxy for pace', () => {
  assert.ok(PRO.length > 0 && FREE.length > 0)
  assert.ok(
    Math.abs(meanPace(PRO) - meanPace(FREE)) < 15,
    `PRO mean pace ${meanPace(PRO).toFixed(1)} is too far from non-PRO ${meanPace(FREE).toFixed(1)}`,
  )
})

test('PRO spans the pace range rather than clustering at the top', () => {
  const paces = PRO.map((rival) => rival.pace)
  const ceiling = Math.max(...rivals.map((rival) => rival.pace))

  assert.ok(Math.min(...paces) < ceiling / 2, 'no PRO persona sits in the lower half of the field')
})
