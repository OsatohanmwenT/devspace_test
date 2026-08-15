import { Avatar } from '../ui/Avatar'
import { TrophyIcon } from '../ui/icons'
import { ROW_GRID } from './rowGrid'

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' }
const TIER_RANK_COLOR = { gold: 'text-[#ffcf8b] [[data-theme=light]_&]:text-[#b8860b]', silver: 'text-[#c7c9d1] [[data-theme=light]_&]:text-[#8a8d97]', bronze: 'text-[#d98a52] [[data-theme=light]_&]:text-[#a35a25]' }

// delta is null for the first day of the week, when there is no previous day to
// measure against — that is different from having held your place, so it reads
// as blank rather than as a dash.
function RankDelta({ delta }) {
  if (delta === null || delta === undefined) {
    return (
      <span className="text-right text-[11px] text-[#5a5a5e] [[data-theme=light]_&]:text-[#a8a8a4]" aria-hidden="true">
        —
      </span>
    )
  }

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
    <div className={isCurrentUser ? `${ROW_GRID} my-1 rounded-2xl border border-[#8bb5f5] bg-[#2a293c] [[data-theme=light]_&]:border-[#b9d4f7] [[data-theme=light]_&]:bg-[#e9f2ff]` : `${ROW_GRID} rounded-xl border border-transparent transition-colors duration-150 hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f3f1ec]`}>
      <span className={`grid place-items-center text-[13px] text-center ${tier ? TIER_RANK_COLOR[tier] : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'}`}>
        <span aria-hidden="true">{tier ? <TrophyIcon className="w-[18px] h-[18px]" /> : entry.rank}</span>
        <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">Rank {entry.rank}</span>
      </span>
      <Avatar name={entry.name} size="md" />
      <div className="grid min-w-0">
        <span className="flex items-center gap-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-sm font-semibold">
          {entry.name}
          {entry.tag && <span className="rounded-full bg-[rgba(102, 153, 236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] px-1.5 py-px text-[#d3e2ff] [[data-theme=light]_&]:text-[#073c72] text-[10px] font-bold tracking-[.04em]">{entry.tag}</span>}
        </span>
        <span className="overflow-hidden text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs text-ellipsis whitespace-nowrap">{entry.role}</span>
      </div>
      <span className={`text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-sm tabular-nums whitespace-nowrap ${isCurrentUser ? 'font-semibold' : ''}`}>{entry.score.toLocaleString()}</span>
    </div>
  )
}
