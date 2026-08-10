import test from 'node:test'
import assert from 'node:assert/strict'
import { getPath, pathShelves } from '../data/paths.js'
import {
  derivePathProgress,
  deriveRegionProgress,
  flattenLessons,
  hasAuthoredContent,
  isLessonComplete,
  toPercent,
} from './pathProgress.js'

const ml = pathShelves[0]
const lessonIds = (path) => flattenLessons(path).map((entry) => entry.lesson.id)
const statesOf = (derived) => derived.regions.map((region) => region.lessons.map((lesson) => lesson.state))

const completedMap = (...ids) => Object.fromEntries(ids.map((id) => [id, { completedAt: 'Mon Aug 03 2026' }]))

test('toPercent rounds and survives an empty total', () => {
  assert.equal(toPercent(0, 0), 0)
  assert.equal(toPercent(0, 4), 0)
  assert.equal(toPercent(1, 3), 33)
  assert.equal(toPercent(4, 4), 100)
})

test('a lesson counts as complete from the record or from authored seed state', () => {
  assert.equal(isLessonComplete({ id: 'a' }, {}), false)
  assert.equal(isLessonComplete({ id: 'a' }, completedMap('a')), true)
  assert.equal(isLessonComplete({ id: 'a', state: 'completed' }, {}), true)
})

test('placeholder regions are not treated as authored content', () => {
  assert.equal(hasAuthoredContent({ lessons: [{ id: 'coordinator-scope-planning-preview' }] }), false)
  assert.equal(hasAuthoredContent({ lessons: [{ id: 'writing-programs' }, { id: 'using-variables' }] }), true)
})

// The compatibility pin. With no recorded completions the deriver must
// reproduce the states data/paths.js authored by hand, so wiring it into the
// existing UI cannot change what a new learner sees.
test('an empty completion record reproduces the authored ML spine', () => {
  const derived = derivePathProgress(ml, {})

  assert.deepEqual(statesOf(derived), [
    ['completed', 'completed', 'completed', 'completed'],
    ['current', 'available', 'available', 'available'],
    ['locked', 'locked', 'locked', 'locked'],
    ['locked', 'locked', 'locked', 'locked'],
    ['locked', 'locked', 'locked', 'locked'],
    ['locked', 'locked', 'locked', 'locked'],
  ])

  assert.deepEqual(
    derived.regions.map((region) => region.state),
    ['completed', 'current', 'available', 'locked', 'locked', 'locked'],
  )

  assert.equal(derived.currentLesson.id, 'writing-programs')
  assert.equal(derived.currentRegion.id, 'python-foundations')
  assert.equal(derived.currentRegionIndex, 1)
  assert.equal(derived.lessonsTotal, 24)
  assert.equal(derived.lessonsCompleted, 4)
  assert.equal(derived.percent, 17)
  assert.equal(derived.regionsCompleted, 1)
  assert.equal(derived.isComplete, false)
})

test('completing the current lesson advances the pointer', () => {
  const derived = derivePathProgress(ml, completedMap('writing-programs'))

  assert.equal(derived.currentLesson.id, 'using-variables')
  assert.equal(derived.lessonsCompleted, 5)
  assert.equal(derived.regions[1].lessons[0].state, 'completed')
  assert.equal(derived.regions[1].lessons[1].state, 'current')
  assert.equal(derived.regions[1].percent, 25)
})

test('finishing a region moves the current pointer into the next one', () => {
  const derived = derivePathProgress(ml, completedMap('writing-programs', 'using-variables', 'input-output', 'program-flow'))

  assert.equal(derived.regions[1].state, 'completed')
  assert.equal(derived.regions[1].percent, 100)
  assert.equal(derived.regions[2].state, 'current')
  assert.equal(derived.currentRegionIndex, 2)
  assert.equal(derived.currentLesson.id, 'data-types')
  // Siblings of the current lesson unlock; the region after it stays shut.
  assert.deepEqual(statesOf(derived)[2], ['current', 'available', 'available', 'available'])
  assert.deepEqual(statesOf(derived)[3], ['locked', 'locked', 'locked', 'locked'])
})

test('an out-of-order completion registers without dragging the pointer forward', () => {
  const derived = derivePathProgress(ml, completedMap('improve-model'))
  const lastRegion = derived.regions[4]

  assert.equal(lastRegion.lessons.at(-1).state, 'completed')
  assert.equal(lastRegion.lessonsCompleted, 1)
  // The gap at writing-programs still decides where the learner is.
  assert.equal(derived.currentLesson.id, 'writing-programs')
  assert.equal(derived.currentRegionIndex, 1)
})

test('completing every lesson reports a finished path', () => {
  const derived = derivePathProgress(ml, completedMap(...lessonIds(ml)))

  assert.equal(derived.percent, 100)
  assert.equal(derived.currentLesson, null)
  assert.equal(derived.currentRegion, null)
  assert.equal(derived.currentRegionIndex, -1)
  assert.equal(derived.nextCheckpoint, null)
  assert.equal(derived.isComplete, true)
  assert.equal(derived.regionsCompleted, derived.regionsTotal)
})

test('the next checkpoint is found with its distance from the current lesson', () => {
  const fresh = derivePathProgress(ml, {})
  // Region 2 is writing-programs, using-variables, input-output (checkpoint).
  assert.equal(fresh.nextCheckpoint.lesson.id, 'input-output')
  assert.equal(fresh.nextCheckpoint.regionId, 'python-foundations')
  assert.equal(fresh.nextCheckpoint.lessonsUntil, 2)

  const advanced = derivePathProgress(ml, completedMap('writing-programs'))
  assert.equal(advanced.nextCheckpoint.lessonsUntil, 1)
})

test('checkpoint totals ignore placeholder regions', () => {
  const analyst = derivePathProgress(getPath('data-analyst'), {})

  // Five of six regions are `upcomingRegion` placeholders whose single lesson
  // is flagged as a checkpoint — counting those would claim five checkpoints
  // for a path with one real lesson.
  assert.equal(analyst.regionsTotal, 6)
  assert.equal(analyst.checkpointsTotal, 0)
  assert.deepEqual(
    analyst.regions.map((region) => region.hasAuthoredContent),
    [true, false, false, false, false, false],
  )
  assert.equal(analyst.currentLesson.id, 'data-analysis-basics')
})

test('deriveRegionProgress agrees with the full derivation', () => {
  const completed = completedMap('writing-programs', 'using-variables')
  const region = ml.cards[1]

  assert.deepEqual(deriveRegionProgress(region, completed), {
    lessonsTotal: 4,
    lessonsCompleted: 2,
    percent: 50,
  })
  assert.equal(derivePathProgress(ml, completed).regions[1].percent, 50)
})

test('every authored path derives without blowing up', () => {
  for (const path of pathShelves) {
    const derived = derivePathProgress(path, {})
    assert.ok(derived.lessonsTotal > 0, `${path.id} has no lessons`)
    assert.ok(derived.currentLesson, `${path.id} has no current lesson`)
    assert.ok(derived.percent >= 0 && derived.percent <= 100, `${path.id} has an impossible percentage`)
  }
})

test('an unauthored path is flagged as such', () => {
  assert.equal(derivePathProgress(ml, {}).authored, true)
  assert.equal(derivePathProgress({ ...ml, authored: false }, {}).authored, false)
})

test('an empty path degrades instead of throwing', () => {
  const derived = derivePathProgress({ id: 'empty', title: 'Empty', cards: [] }, {})

  assert.equal(derived.lessonsTotal, 0)
  assert.equal(derived.percent, 0)
  assert.equal(derived.currentLesson, null)
  assert.equal(derived.isComplete, false)
})
