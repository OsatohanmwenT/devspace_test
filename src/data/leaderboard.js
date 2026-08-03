export const league = { id: 'bronze', name: 'Bronze League', daysLeft: 3, promoteCount: 10 }

export const leagueLadder = [
  { id: 'bronze', name: 'Bronze', state: 'current' },
  { id: 'silver', name: 'Silver', state: 'locked' },
  { id: 'gold', name: 'Gold', state: 'locked' },
  { id: 'sapphire', name: 'Sapphire', state: 'locked' },
  { id: 'ruby', name: 'Ruby', state: 'locked' },
  { id: 'emerald', name: 'Emerald', state: 'locked' },
  { id: 'diamond', name: 'Diamond', state: 'locked' },
]

export const leaderboardEntries = [
  { id: 'stefano-d', rank: 1, name: "Stefano D'Avascio", role: 'Product Designer', score: 3000, isCurrentUser: false, tag: 'PRO' },
  { id: 'nuriye-s', rank: 2, name: 'Nuriye Sarıca', role: 'Product Designer', score: 2750, isCurrentUser: false, tag: 'PRO' },
  { id: 'varun-y', rank: 3, name: 'Varun Yadav', role: 'UX/UI Designer', score: 2400, isCurrentUser: false, tag: null },
  { id: 'pranay-g', rank: 4, name: 'Pranay Goud', role: 'Product Designer', score: 2100, isCurrentUser: false, tag: null },
  { id: 'narduccio-v', rank: 5, name: 'Narduccio van der Veekens', role: 'UX/UI Designer', score: 1850, isCurrentUser: false, tag: 'PRO' },
  { id: 'amara-k', rank: 6, name: 'Amara Kim', role: 'Data Scientist path', score: 1600, isCurrentUser: false, tag: null },
  { id: 'jonas-b', rank: 7, name: 'Jonas Berg', role: 'Backend Developer path', score: 1350, isCurrentUser: false, tag: null },
  { id: 'priya-s', rank: 8, name: 'Priya Sharma', role: 'AI Engineer path', score: 1100, isCurrentUser: false, tag: 'PRO' },
  { id: 'leo-f', rank: 9, name: 'Leo Ferreira', role: 'Machine Learning Engineer path', score: 900, isCurrentUser: false, tag: null },
  { id: 'mina-t', rank: 10, name: 'Mina Torres', role: 'Data Scientist path', score: 700, isCurrentUser: false, tag: null },
  { id: 'you', rank: 11, name: 'You', role: 'Machine Learning Engineer path', score: 650, isCurrentUser: true, tag: null },
  { id: 'hooriya-i', rank: 12, name: 'Hooriya Ibrar', role: 'Backend Developer path', score: 600, isCurrentUser: false, tag: null },
  { id: 'samri-b', rank: 13, name: 'Samri Bek', role: 'UX/UI Designer', score: 520, isCurrentUser: false, tag: null },
  { id: 'grid-g', rank: 14, name: 'Grid Guru', role: 'AI Engineer path', score: 480, isCurrentUser: false, tag: null },
  { id: 'kazuhiro-c', rank: 15, name: 'Kazuhiro Chō', role: 'Student', score: 430, isCurrentUser: false, tag: null },
  { id: 'sridevi-r', rank: 16, name: 'Sridevi Rao', role: 'Data Scientist path', score: 390, isCurrentUser: false, tag: null },
]

export const rankedEntries = [...leaderboardEntries].sort((a, b) => a.rank - b.rank)

// Fall back to the first entry if no row is flagged, so the UI never fails to highlight a row.
export const currentUserEntry = rankedEntries.find((entry) => entry.isCurrentUser) ?? rankedEntries[0]
