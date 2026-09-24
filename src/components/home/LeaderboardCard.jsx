import { InfoTooltip } from '../ui/InfoTooltip'
import { CoinIcon } from '../ui/GameIcon'

export function LeaderboardCard({ currentLeague, timeRemaining, homeStandings, userId, onOpenLeaderboard, className = '' }) {
  return (
    <section className={`flex flex-col border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px] ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-3.5 text-left">
        <div className="grid gap-0.5">
          <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-semibold">{currentLeague.name}</strong>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{timeRemaining}</span>
        </div>
        <InfoTooltip label="How leagues work" align="end">
          Earn Season Devy Coins to move up the leaderboard. Final standings update when the season ends.
        </InfoTooltip>
      </div>
      <button type="button" className="mt-auto grid w-full gap-2 rounded-2xl border border-[#404040] bg-[#171717] p-3.5 text-left transition-colors hover:border-[#5a5a60] hover:bg-[#1c1c1e] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-[#f5f5f4] [[data-theme=light]_&]:hover:border-[#d4d4d4]" onClick={onOpenLeaderboard} aria-label="Open leaderboard">
        <span className="flex items-center justify-between px-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
          <span>Standings</span>
          <CoinIcon className="text-[14px]" />
        </span>
        {homeStandings.map((entry) => (
          <span key={entry.id} className={`grid min-h-8 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2 text-[13px] ${entry.id === userId ? 'bg-[#2a293c] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#e9f2ff] [[data-theme=light]_&]:text-neutral-800' : ''}`}>
            <span className="text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{entry.rank}</span>
            <span className="truncate font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.id === userId ? 'You' : entry.name}</span>
            <strong className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] tabular-nums">{entry.score.toLocaleString()}</strong>
          </span>
        ))}
      </button>
    </section>
  )
}
