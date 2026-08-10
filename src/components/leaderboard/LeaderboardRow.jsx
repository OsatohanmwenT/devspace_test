import { Avatar } from '../ui/Avatar'
import { TrophyIcon } from '../ui/icons'
import { ROW_GRID } from './rowGrid'

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' }
const TIER_RANK_COLOR = { gold: 'text-[#ffcf8b] [[data-theme=light]_&]:text-[#b8860b]', silver: 'text-[#c7c9d1] [[data-theme=light]_&]:text-[#8a8d97]', bronze: 'text-[#d98a52] [[data-theme=light]_&]:text-[#a35a25]' }

// delta is null for the first day of the week, when there is no previous day to
// measure against — that is different from having held your place, so it reads
// as blank rather than as a dash.
function RankDelta({ delta }) {
  if (delta === null || delta === undefined) return <span aria-hidden="true" />

  if (delta === 0) {
    return (
      <span className="text-right text-[11px] tabular-nums text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]" aria-hidden="true">
        —
      </span>
    )
  }

  const climbed = delta > 0
  return (
    <span className={`text-right text-[11px] font-semibold tabular-nums ${climbed ? 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' : 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]'}`}>
      <span aria-hidden="true">{climbed ? `▲${delta}` : `▼${Math.abs(delta)}`}</span>
      <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">
        {climbed ? `up ${delta}` : `down ${Math.abs(delta)}`} since yesterday
      </span>
    </span>
  )
}

export function LeaderboardRow({ entry, isCurrentUser }) {
  const tier = MEDALS[entry.rank]

  return (
    <div className={isCurrentUser ? `${ROW_GRID} rounded-xl border border-[#6f66ec] bg-[#2a293c] shadow-[0_0_0_1px_rgba(141,137,255,0.35)] [[data-theme=light]_&]:bg-[#f1f0fd]` : `${ROW_GRID} rounded-none border border-transparent transition-colors duration-150 hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f7f7f5]`}>
      <span className={`grid place-items-center text-[13px] text-center ${tier ? TIER_RANK_COLOR[tier] : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'}`}>
        <span aria-hidden="true">{tier ? <TrophyIcon className="w-[18px] h-[18px]" /> : entry.rank}</span>
        <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">Rank {entry.rank}</span>
      </span>
      <Avatar name={entry.name} size="md" />
      <div className="grid min-w-0">
        <span className="flex items-center gap-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-sm font-semibold">
          {entry.name}
          {entry.tag && <span className="rounded-full bg-[rgba(111,102,236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] px-1.5 py-px text-[#d8d3ff] [[data-theme=light]_&]:text-[#070c72] text-[10px] font-bold tracking-[.04em]">{entry.tag}</span>}
        </span>
        <span className="overflow-hidden text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs text-ellipsis whitespace-nowrap">{entry.role}</span>
      </div>
      <span className={`text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-sm tabular-nums whitespace-nowrap ${isCurrentUser ? 'font-semibold' : ''}`}>{entry.score.toLocaleString()}</span>
      <RankDelta delta={entry.delta} />
    </div>
  )
}
