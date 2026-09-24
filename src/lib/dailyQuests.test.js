import test from 'node:test'
import assert from 'node:assert/strict'
import { getDailyQuests, getDailyQuestsFromProgress, questsAdvanced } from './dailyQuests.js'

const today = 'Wed Sep 23 2026'

test('caps XP progress at the goal and marks quests done', () => {
  const quests = getDailyQuests({ dailyXp: 140, xpGoal: 100, lessonDoneToday: true })
  assert.deepEqual(quests.map((quest) => [quest.id, quest.current, quest.target, quest.done]), [
    ['xp', 100, 100, true],
    ['lesson', 1, 1, true],
    ['practice', 0, 1, false],
  ])
})

test('reads only today’s activity from progress', () => {
  const progress = {
    dailyXp: 35,
    dailyXpDate: today,
    completedLessons: { a: { completedAt: 'Tue Sep 22 2026' } },
    completedSessions: { b: { completedAt: today } },
  }
  const quests = getDailyQuestsFromProgress(progress, 50, today)
  assert.deepEqual(quests.map((quest) => quest.current), [35, 0, 1])
})

test('stale daily XP from another day counts as zero', () => {
  const quests = getDailyQuestsFromProgress({ dailyXp: 80, dailyXpDate: 'Tue Sep 22 2026' }, 50, today)
  assert.equal(quests[0].current, 0)
})

test('questsAdvanced only fires when something moved', () => {
  const before = getDailyQuests({ dailyXp: 10, xpGoal: 50 })
  assert.equal(questsAdvanced(before, getDailyQuests({ dailyXp: 10, xpGoal: 50 })), false)
  assert.equal(questsAdvanced(before, getDailyQuests({ dailyXp: 35, xpGoal: 50 })), true)
  assert.equal(questsAdvanced(before, getDailyQuests({ dailyXp: 10, xpGoal: 50, practiceDoneToday: true })), true)
})
