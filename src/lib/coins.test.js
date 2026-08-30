import test from 'node:test'
import assert from 'node:assert/strict'
import { COIN_AWARDS, getLessonCoinAward, getPracticeCoinAward } from './coins.js'

test('a session never completed before pays the full practice coin rate', () => {
  assert.equal(getPracticeCoinAward({ completedSessions: {} }, 'python-basics'), COIN_AWARDS.FIRST_PRACTICE)
})

test('any repeat of a session earns zero coins, Premium or not', () => {
  const completed = { completedSessions: { 'python-basics': { completedAt: 'Thu Aug 06 2026' } } }
  assert.equal(getPracticeCoinAward({ ...completed, isPremium: false }, 'python-basics'), 0)
  assert.equal(getPracticeCoinAward({ ...completed, isPremium: true }, 'python-basics'), 0, 'coins have no Premium replay exception')
})

test('a lesson never completed before pays the full concept-mastered rate', () => {
  assert.equal(getLessonCoinAward({ completedLessons: {} }, 'intro-variables'), COIN_AWARDS.CONCEPT_MASTERED)
})

test('any repeat of a lesson earns zero coins, Premium or not', () => {
  const completed = { completedLessons: { 'intro-variables': { completedAt: 'Thu Aug 06 2026' } } }
  assert.equal(getLessonCoinAward({ ...completed, isPremium: false }, 'intro-variables'), 0)
  assert.equal(getLessonCoinAward({ ...completed, isPremium: true }, 'intro-variables'), 0)
})

test('Earn It First: an assisted lesson pays zero coins even on a genuine first completion', () => {
  assert.equal(getLessonCoinAward({ completedLessons: {} }, 'intro-variables', true), 0)
})

test('a lesson completion is unassisted by default', () => {
  assert.equal(getLessonCoinAward({ completedLessons: {} }, 'intro-variables'), COIN_AWARDS.CONCEPT_MASTERED)
})

test('completing one session or lesson says nothing about another', () => {
  const progress = {
    completedSessions: { 'python-basics': { completedAt: 'Thu Aug 06 2026' } },
    completedLessons: { 'intro-variables': { completedAt: 'Thu Aug 06 2026' } },
  }
  assert.equal(getPracticeCoinAward(progress, 'sql-select'), COIN_AWARDS.FIRST_PRACTICE)
  assert.equal(getLessonCoinAward(progress, 'intro-loops'), COIN_AWARDS.CONCEPT_MASTERED)
})
