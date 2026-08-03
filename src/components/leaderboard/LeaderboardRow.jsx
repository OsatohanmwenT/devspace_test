import { Avatar } from '../ui/Avatar'
import { TrophyIcon } from '../ui/icons'

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' }
const TIER_RANK_COLOR = { gold: 'text-[#ffcf8b] [[data-theme=light]_&]:text-[#b8860b]', silver: 'text-[#c7c9d1] [[data-theme=light]_&]:text-[#8a8d97]', bronze: 'text-[#d98a52] [[data-theme=light]_&]:text-[#a35a25]' }

export function LeaderboardRow({ entry, isCurrentUser }) {
  const tier = MEDALS[entry.rank]

  return (
    <div
      className={
        isCurrentUser
          ? 'grid grid-cols-[28px_40px_minmax(0,1fr)_auto] max-[680px]:grid-cols-[22px_34px_minmax(0,1fr)_auto] items-center gap-3.5 max-[680px]:gap-2.5 p-3.5 max-[680px]:p-2.5 rounded-xl border border-[#6f66ec] bg-[#2a293c] [[data-theme=light]_&]:bg-[#f1f0fd]'
          : 'grid grid-cols-[28px_40px_minmax(0,1fr)_auto] max-[680px]:grid-cols-[22px_34px_minmax(0,1fr)_auto] items-center gap-3.5 max-[680px]:gap-2.5 p-3.5 max-[680px]:p-2.5 rounded-xl border border-transparent'
      }
    >
      <span className={`grid place-items-center text-[13px] font-bold text-center ${tier ? TIER_RANK_COLOR[tier] : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'}`}>
        <span aria-hidden="true">{tier ? <TrophyIcon className="w-[18px] h-[18px]" /> : entry.rank}</span>
        <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">Rank {entry.rank}</span>
      </span>
      <Avatar name={entry.name} size="md" />
      <div className="grid min-w-0">
        <span className="flex items-center gap-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-sm font-semibold">
          {entry.name}
          {entry.tag && <span className="rounded-full bg-[rgba(111,102,236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] px-1.5 py-px text-[#d8d3ff] [[data-theme=light]_&]:text-[#070c72] text-[10px] font-bold tracking-[.04em]">{entry.tag}</span>}
          {isCurrentUser && entry.name.toLowerCase() !== 'you' && <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap"> (You)</span>}
        </span>
        <span className="overflow-hidden text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs text-ellipsis whitespace-nowrap">{entry.role}</span>
      </div>
      <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-sm font-bold whitespace-nowrap">{entry.score.toLocaleString()} px</span>
    </div>
  )
}

