import test from 'node:test'
import assert from 'node:assert/strict'
import { isSoundEnabled, playSound, SOUND_EVENTS } from './sound.js'

test('every catalogued sound event has a non-empty recipe', () => {
  assert.ok(SOUND_EVENTS.length > 0)
  assert.deepEqual(
    [...SOUND_EVENTS].sort(),
    ['answer_correct', 'answer_wrong', 'coin_gain', 'hint_open', 'practice_complete', 'tile_complete', 'xp_gain'].sort(),
  )
})

test('isSoundEnabled defaults to true outside a browser (no window/localStorage)', () => {
  assert.equal(isSoundEnabled(), true)
})

test('playSound never throws even without a browser AudioContext (Node test environment)', () => {
  for (const eventName of SOUND_EVENTS) {
    assert.doesNotThrow(() => playSound(eventName))
  }
  assert.doesNotThrow(() => playSound('not-a-real-event'))
})
