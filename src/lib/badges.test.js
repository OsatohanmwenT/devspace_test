import test from 'node:test'
import assert from 'node:assert/strict'
import { getBadges, getFeaturedBadges, MAX_FEATURED_BADGES, toggleFeaturedBadge } from './badges.js'

const byId = (badges) => Object.fromEntries(badges.map((badge) => [badge.id, badge]))

test('a brand-new learner has earned nothing', () => {
  assert.equal(getBadges({}).filter((badge) => badge.earned).length, 0)
})

test('badges come from the progress the app already records', () => {
  const badges = byId(getBadges({
    earnedStreakMilestones: [3, 7],
    lessonsCompleted: 6,
    milestonesPassed: 1,
    practiceSessions: 1,
    xp: 520,
    highestLeagueIndex: 2,
  }))
  assert.equal(badges['streak-7'].earned, true)
  assert.equal(badges['streak-14'].earned, false)
  assert.equal(badges['lessons-5'].earned, true)
  assert.equal(badges['lessons-15'].earned, false)
  assert.deepEqual(badges['lessons-15'].progress, { target: 15, current: 6, noun: 'modules' })
  assert.equal(badges['milestone-1'].earned, true)
  assert.equal(badges['practice-1'].earned, true)
  assert.equal(badges['xp-500'].earned, true)
  assert.equal(badges['league-silver'].earned, true)
  assert.equal(badges['league-gold'].earned, true)
  assert.equal(badges['league-sapphire'].earned, false)
})

test('featured badges prefer pins, else the best of each category', () => {
  const badges = getBadges({ earnedStreakMilestones: [3, 7], lessonsCompleted: 5, xp: 150 })
  assert.deepEqual(getFeaturedBadges(badges).map((badge) => badge.id), ['streak-7', 'lessons-5', 'xp-100'])
  assert.deepEqual(getFeaturedBadges(badges, ['xp-100', 'league-gold']).map((badge) => badge.id), ['xp-100'])
})

test('pinning keeps at most the newest few', () => {
  let pins = []
  for (const id of ['a', 'b', 'c', 'd']) pins = toggleFeaturedBadge(pins, id)
  assert.equal(pins.length, MAX_FEATURED_BADGES)
  assert.deepEqual(pins, ['b', 'c', 'd'])
  assert.deepEqual(toggleFeaturedBadge(pins, 'c'), ['b', 'd'])
})
