import { Avatar } from '../ui/Avatar'
import { TrophyIcon } from '../ui/icons'
import { ROW_GRID } from './rowGrid'

const MEDALS = { 1: 'gold', 2: 'silver', 3: 'bronze' }
const TIER_RANK_COLOR = { gold: 'text-[var(--accent-progress)]', silver: 'text-[var(--text-muted)]', bronze: 'text-[var(--accent-progress)]' }

// delta is null for the first day of the week, when there is no previous day to
// measure against — that is different from having held your place, so it reads
// as blank rather than as a dash.
function RankDelta({ delta }) {
  if (delta === null || delta === undefined) return <span aria-hidden="true" />

  if (delta === 0) {
    return (
      <span className="text-right text-[11px] tabular-nums text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]" aria-hidden="true">
        —
      </span>
    )
  }

  const climbed = delta > 0
  return (
    <span className={`text-right text-[11px] font-semibold tabular-nums ${climbed ? 'text-[var(--accent-data)] [[data-theme=light]_&]:text-[var(--accent-data)]' : 'text-[var(--accent-error)] [[data-theme=light]_&]:text-[var(--accent-error)]'}`}>
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
    <div className={isCurrentUser ? `${ROW_GRID} rounded-xl border border-[var(--brand-cta)] bg-[var(--surface-brand-tint)]` : `${ROW_GRID} rounded-none border border-transparent transition-colors duration-150 hover:bg-[var(--surface-subtle)]`}>
      <span className={`grid place-items-center text-[13px] text-center ${tier ? TIER_RANK_COLOR[tier] : 'text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]'}`}>
        <span aria-hidden="true">{tier ? <TrophyIcon className="w-[18px] h-[18px]" /> : entry.rank}</span>
        <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">Rank {entry.rank}</span>
      </span>
      <Avatar name={entry.name} size="md" />
      <div className="grid min-w-0">
        <span className="flex items-center gap-1.5 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] text-sm font-semibold">
          {entry.name}
          {entry.tag && <span className="rounded-full bg-[var(--surface-brand-tint)] px-1.5 py-px text-[10px] font-bold tracking-[.04em] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">{entry.tag}</span>}
        </span>
        <span className="overflow-hidden text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-xs text-ellipsis whitespace-nowrap">{entry.role}</span>
      </div>
      <span className={`text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] text-sm tabular-nums whitespace-nowrap ${isCurrentUser ? 'font-semibold' : ''}`}>{entry.score.toLocaleString()}</span>
      <RankDelta delta={entry.delta} />
    </div>
  )
}
