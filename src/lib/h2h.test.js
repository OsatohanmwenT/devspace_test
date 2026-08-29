import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceH2HWeek, getLiveH2HStanding, getOpponentWeekCoins, getWeeklyOpponent } from './h2h.js'
import { getWeekStartFromIndex } from './week.js'

const DAY_MS = 24 * 60 * 60 * 1000
const emptyH2H = { weekIndex: null, windowStartCoins: 0, points: 0, history: [] }

test('the opponent for a given week is deterministic', () => {
  assert.equal(getWeeklyOpponent(120).id, getWeeklyOpponent(120).id)
})

test('opponent coins only ever climb as the week runs', () => {
  const opponent = getWeeklyOpponent(120)
  let previous = 0
  for (let step = 0; step <= 7; step += 1) {
    const coins = getOpponentWeekCoins(opponent, 120, step / 7)
    assert.ok(coins >= previous)
    previous = coins
  }
})

test('a first-ever call adopts the current week without resolving a match', () => {
  const timestamp = getWeekStartFromIndex(120) + DAY_MS
  const { h2h, resolved } = advanceH2HWeek(emptyH2H, 50, timestamp)

  assert.equal(resolved, null)
  assert.equal(h2h.weekIndex, 120)
  assert.equal(h2h.windowStartCoins, 50)
  assert.equal(h2h.points, 0)
})

test('a week that has not ended yet does not resolve', () => {
  const started = { weekIndex: 120, windowStartCoins: 50, points: 0, history: [] }
  const stillMidweek = getWeekStartFromIndex(120) + 3 * DAY_MS
  const { h2h, resolved } = advanceH2HWeek(started, 90, stillMidweek)

  assert.equal(resolved, null)
  assert.deepEqual(h2h, started)
})

test('a finished week resolves into a win, draw, or loss and opens the next window', () => {
  const started = { weekIndex: 120, windowStartCoins: 50, points: 0, history: [] }
  const nextWeek = getWeekStartFromIndex(121) + DAY_MS

  const { h2h, resolved } = advanceH2HWeek(started, 10000, nextWeek)

  assert.equal(resolved.weekIndex, 120)
  assert.equal(resolved.userCoins, 10000 - 50)
  assert.equal(resolved.result, 'win', 'a huge coin total should beat any simulated opponent')
  assert.equal(resolved.pointsEarned, 3)
  assert.equal(h2h.weekIndex, 121)
  assert.equal(h2h.windowStartCoins, 10000)
  assert.equal(h2h.points, 3)
  assert.deepEqual(h2h.history[0], resolved)
})

test('points accumulate across multiple resolved weeks', () => {
  let h2h = { weekIndex: 120, windowStartCoins: 0, points: 0, history: [] }
  const week121 = getWeekStartFromIndex(121) + DAY_MS
  const week122 = getWeekStartFromIndex(122) + DAY_MS

  const first = advanceH2HWeek(h2h, 10000, week121)
  h2h = first.h2h
  const totalAfterOne = h2h.points

  const second = advanceH2HWeek(h2h, h2h.windowStartCoins + 10000, week122)
  h2h = second.h2h

  assert.equal(h2h.points, totalAfterOne + second.resolved.pointsEarned)
  assert.equal(h2h.history.length, 2)
})

test('a season boundary that resets seasonCoins mid-week never produces negative userCoins', () => {
  // windowStartCoins (900) is higher than the season-reset coin total (20).
  const started = { weekIndex: 120, windowStartCoins: 900, points: 0, history: [] }
  const nextWeek = getWeekStartFromIndex(121) + DAY_MS

  const { resolved } = advanceH2HWeek(started, 20, nextWeek)
  assert.equal(resolved.userCoins, 0)
})

test('the live standing never mutates and reflects the coins earned so far this window', () => {
  const h2h = { weekIndex: 120, windowStartCoins: 50, points: 0, history: [] }
  const timestamp = getWeekStartFromIndex(120) + 2 * DAY_MS

  const live = getLiveH2HStanding(h2h, 130, timestamp)
  assert.equal(live.userCoins, 80)
  assert.ok(live.opponentName.length > 0)
})
