// Five competitive leagues, scored on Season Devy Coins (lib/leagueSim.js),
// with real cash reward pools (lib/rewardConfig.js) attached by id.
//
// `cohortSize` is deliberately larger than the old weekly-XP ladder's flat 30
// — Bronze's cash-winner ceiling alone is 180 (rewardConfig.js), so a cohort
// smaller than that would make every single row a cash winner, which defeats
// the point of showing a reward-zone boundary at all. Sized so every league
// has a visible tail of non-cash finishers below its reward zone.
//
// `promoteCount` follows the spec's "Bronze top 15%" rule, applied at each
// tier below Diamond. `pace` scales the whole rival field the same way it did
// in the old weekly system — it is the dial that decides how much a season
// actually costs. leagueSim.test.js locks the resulting promotion behaviour;
// change `pace` and it will tell you.
export const leagues = [
  { id: 'bronze', name: 'Bronze League', color: '#d98a52', cohortSize: 260, promoteCount: 39, demoteCount: 0, pace: 0.55, proRequired: false },
  { id: 'silver', name: 'Silver League', color: '#c7c9d1', cohortSize: 110, promoteCount: 17, demoteCount: 15, pace: 0.85, proRequired: true },
  { id: 'gold', name: 'Gold League', color: '#ffcf8b', cohortSize: 60, promoteCount: 9, demoteCount: 10, pace: 1.15, proRequired: true },
  { id: 'sapphire', name: 'Sapphire League', color: '#5fb8ff', cohortSize: 40, promoteCount: 6, demoteCount: 8, pace: 1.5, proRequired: true },
  { id: 'diamond', name: 'Diamond League', color: '#04adc0', cohortSize: 20, promoteCount: 0, demoteCount: 6, pace: 1.9, proRequired: true },
]

export function getLeague(index) {
  return leagues[Math.min(leagues.length - 1, Math.max(0, index))]
}

export function getLeagueById(id) {
  return leagues.find((league) => league.id === id) ?? null
}
