// Shared by LeaderboardRow and LockedLeaderboard's skeleton. They have to agree
// column for column or the placeholder rows stop lining up with the real ones.
//
// Reward is folded into the same trailing cell as coins (stacked, not a
// separate column) rather than given its own — on mobile that's the
// difference between "rank/movement/coins dominate" and a table fighting the
// viewport for a sixth column.
export const ROW_GRID =
  'grid grid-cols-[24px_24px_40px_minmax(0,1fr)_auto] max-[680px]:grid-cols-[18px_20px_34px_minmax(0,1fr)_auto] items-center gap-3 max-[680px]:gap-2 p-3.5 max-[680px]:p-2.5'
