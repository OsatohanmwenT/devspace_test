// The profile's achievement collection. Each badge is a collectible coin —
// earned or not, never a counter (see the home badge strip) — so this module
// only decides *whether* something is earned and how close the learner is.
// The coin art lives in components/profile/BadgeCoin.jsx.
//
// Everything is derived from progress the app already records; nothing here
// is stored, so a badge can never drift out of sync with the thing it marks.
import { STREAK_MILESTONES } from './streak.js'
import { leagues } from '../data/leagues.js'

export const BADGE_CATEGORIES = [
  { id: 'streak', label: 'Streaks' },
  { id: 'learning', label: 'Learning' },
  { id: 'practice', label: 'Practice' },
  { id: 'xp', label: 'Experience' },
  { id: 'league', label: 'Leagues' },
  { id: 'profile', label: 'Profile' },
]

export const MAX_FEATURED_BADGES = 3

const count = (target, current, noun) => ({ target, current: Math.min(current, target), noun })

function streakBadges({ streakDays = 0, longestStreak = 0, earnedStreakMilestones = [] }) {
  const best = Math.max(streakDays, longestStreak)
  return STREAK_MILESTONES.map((tier) => ({
    id: `streak-${tier.days}`,
    category: 'streak',
    label: tier.label,
    description: `Keep a ${tier.days}-day learning streak`,
    earned: earnedStreakMilestones.includes(tier.days),
    progress: count(tier.days, best, 'days'),
  }))
}

function learningBadges({ lessonsCompleted = 0, milestonesPassed = 0, regionsCompleted = 0 }) {
  return [
    { id: 'lessons-1', label: 'First steps', description: 'Complete your first module', ...ladder(lessonsCompleted, 1, 'modules') },
    { id: 'lessons-5', label: 'Warmed up', description: 'Complete 5 modules', ...ladder(lessonsCompleted, 5, 'modules') },
    { id: 'lessons-15', label: 'Deep in it', description: 'Complete 15 modules', ...ladder(lessonsCompleted, 15, 'modules') },
    { id: 'lessons-30', label: 'Scholar', description: 'Complete 30 modules', ...ladder(lessonsCompleted, 30, 'modules') },
    { id: 'milestone-1', label: 'Proven', description: 'Pass your first milestone', ...ladder(milestonesPassed, 1, 'milestones') },
    { id: 'milestone-3', label: 'Certified', description: 'Pass 3 milestones', ...ladder(milestonesPassed, 3, 'milestones') },
    { id: 'region-1', label: 'Section cleared', description: 'Finish every module in a section', ...ladder(regionsCompleted, 1, 'sections') },
  ].map((badge) => ({ ...badge, category: 'learning' }))
}

function practiceBadges({ practiceSessions = 0 }) {
  return [
    { id: 'practice-1', label: 'First rep', description: 'Finish a practice session', ...ladder(practiceSessions, 1, 'sessions') },
    { id: 'practice-10', label: 'In the gym', description: 'Finish 10 practice sessions', ...ladder(practiceSessions, 10, 'sessions') },
    { id: 'practice-25', label: 'Muscle memory', description: 'Finish 25 practice sessions', ...ladder(practiceSessions, 25, 'sessions') },
  ].map((badge) => ({ ...badge, category: 'practice' }))
}

function xpBadges({ xp = 0 }) {
  return [100, 500, 1000, 2500].map((target) => ({
    id: `xp-${target}`,
    category: 'xp',
    label: { 100: 'Spark', 500: 'Charged', 1000: 'Powerhouse', 2500: 'Supernova' }[target],
    description: `Earn ${target.toLocaleString('en-US')} XP`,
    ...ladder(xp, target, 'XP'),
  }))
}

// Bronze is where everyone starts, so only climbing past it counts. A league
// badge keeps its league's own colour — the coin is minted in that metal.
function leagueBadges({ highestLeagueIndex = 0, seasonRewards = 0 }) {
  const climbed = leagues.slice(1).map((league, offset) => ({
    id: `league-${league.id}`,
    category: 'league',
    label: `${league.name.replace(/ League$/, '')} climber`,
    description: `Reach the ${league.name}`,
    tint: league.color,
    ...ladder(highestLeagueIndex, offset + 1, null),
  }))
  return [
    ...climbed,
    { id: 'season-reward', category: 'league', label: 'On the podium', description: 'Finish a season with a reward', ...ladder(seasonRewards, 1, null) },
  ]
}

function profileBadges({ profileComplete = false, linkCount = 0 }) {
  return [
    { id: 'profile-complete', label: 'Ready to share', description: 'Finish every profile quest', ...ladder(profileComplete ? 1 : 0, 1, null) },
    { id: 'profile-links', label: 'Well connected', description: 'Add 3 links to your profile', ...ladder(linkCount, 3, 'links') },
  ].map((badge) => ({ ...badge, category: 'profile' }))
}

function ladder(current, target, noun) {
  return { earned: current >= target, progress: noun ? count(target, current, noun) : null }
}

export function getBadges(stats = {}) {
  return [
    ...streakBadges(stats),
    ...learningBadges(stats),
    ...practiceBadges(stats),
    ...xpBadges(stats),
    ...leagueBadges(stats),
    ...profileBadges(stats),
  ]
}

// What the profile header shows next to the name. Pinned badges win, in the
// order they were pinned; with nothing pinned, the best badge from each
// category stands in (the last earned one, since each ladder climbs).
export function getFeaturedBadges(badges, pinnedIds = []) {
  const earned = badges.filter((badge) => badge.earned)
  const pinned = pinnedIds.map((id) => earned.find((badge) => badge.id === id)).filter(Boolean)
  if (pinned.length) return pinned.slice(0, MAX_FEATURED_BADGES)

  const bestPerCategory = BADGE_CATEGORIES
    .map((category) => earned.filter((badge) => badge.category === category.id).at(-1))
    .filter(Boolean)
  return bestPerCategory.slice(0, MAX_FEATURED_BADGES)
}

export function toggleFeaturedBadge(pinnedIds = [], id) {
  if (pinnedIds.includes(id)) return pinnedIds.filter((pinned) => pinned !== id)
  return [...pinnedIds, id].slice(-MAX_FEATURED_BADGES)
}
