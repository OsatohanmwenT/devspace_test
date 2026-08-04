// Promotion zones are widest at the bottom so beginners almost always advance,
// and tighten near the top where staying put is the achievement.
export const leagues = [
  { id: 'bronze', name: 'Bronze League', color: '#d98a52', promoteCount: 20, demoteCount: 0, pace: 1 },
  { id: 'silver', name: 'Silver League', color: '#c7c9d1', promoteCount: 15, demoteCount: 5, pace: 1.3 },
  { id: 'gold', name: 'Gold League', color: '#ffcf8b', promoteCount: 10, demoteCount: 5, pace: 1.6 },
  { id: 'sapphire', name: 'Sapphire League', color: '#5fb8ff', promoteCount: 7, demoteCount: 5, pace: 1.9 },
  { id: 'ruby', name: 'Ruby League', color: '#e0607e', promoteCount: 5, demoteCount: 5, pace: 2.2 },
  { id: 'emerald', name: 'Emerald League', color: '#7fb069', promoteCount: 3, demoteCount: 5, pace: 2.4 },
  { id: 'diamond', name: 'Diamond League', color: '#04adc0', promoteCount: 0, demoteCount: 5, pace: 2.6 },
]

export const COHORT_SIZE = 30

export function getLeague(index) {
  return leagues[Math.min(leagues.length - 1, Math.max(0, index))]
}
