import { LockIcon, TrophyIcon } from '../ui/icons'

// Sized in px rather than utility classes so the ladder can scale tiers down as
// they recede into the distance.
export function TierMedal({ league, state, size = 46 }) {
  const isLocked = state === 'locked'

  return (
    <span
      className={
        isLocked
          ? 'grid place-items-center rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#f0f0ee]'
          : 'grid place-items-center rounded-full text-neutral-800'
      }
      style={{
        width: size,
        height: size,
        background: isLocked ? undefined : league.color,
        boxShadow: state === 'current' ? `0 0 0 ${Math.max(2, Math.round(size / 16))}px rgba(102, 153, 236,.35)` : 'none',
      }}
      aria-hidden="true"
    >
      <span className="grid place-items-center" style={{ width: size * 0.42, height: size * 0.42 }}>
        {isLocked
          ? <LockIcon className="w-full h-full text-[#7d7d80] [[data-theme=light]_&]:text-[#b4b4b1]" />
          : <TrophyIcon className="w-full h-full" />}
      </span>
    </span>
  )
}
