// Promotion zones are widest at the bottom so beginners almost always advance,
// and tighten near the top where staying put is the achievement.
//
// `pace` scales the whole rival field, so it is the dial that decides how much
// XP a week actually costs. It is calibrated against the onboarding daily goal
// (`dailyGoalXp` in data/onboarding.js): the floor goal of 25 XP/day is 175 a
// week, and at Bronze's 0.6 that clears the promotion cutoff ~99% of the time.
// Before this calibration the same perfect-attendance week promoted 13% of the
// time, which left the lightest-commitment learners permanently stuck — Bronze
// never demotes, so there was no way down and, in practice, no way up either.
// leagueSim.test.js locks these rates; change `pace` and it will tell you.
export const leagues = [
  { id: 'bronze', name: 'Bronze League', color: '#d98a52', promoteCount: 20, demoteCount: 0, pace: 0.6 },
  { id: 'silver', name: 'Silver League', color: '#c7c9d1', promoteCount: 15, demoteCount: 5, pace: 0.85 },
  { id: 'gold', name: 'Gold League', color: '#ffcf8b', promoteCount: 10, demoteCount: 5, pace: 1.15 },
  { id: 'sapphire', name: 'Sapphire League', color: '#5fb8ff', promoteCount: 7, demoteCount: 5, pace: 1.5 },
  { id: 'ruby', name: 'Ruby League', color: '#e0607e', promoteCount: 5, demoteCount: 5, pace: 1.85 },
  { id: 'emerald', name: 'Emerald League', color: '#7fb069', promoteCount: 3, demoteCount: 5, pace: 2.15 },
  { id: 'diamond', name: 'Diamond League', color: 'var(--accent-data)', promoteCount: 0, demoteCount: 5, pace: 2.4 },
]

export const COHORT_SIZE = 30

export function getLeague(index) {
  return leagues[Math.min(leagues.length - 1, Math.max(0, index))]
}
