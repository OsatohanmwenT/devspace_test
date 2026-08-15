import { LockIcon } from '../ui/icons'

// Darkens a hex color for the medal's rim, so each league only has to declare
// one color rather than a matched light/dark pair.
function darken(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16)
  const clamp = (channel) => Math.max(0, channel - amount)
  const r = clamp((num >> 16) & 0xff)
  const g = clamp((num >> 8) & 0xff)
  const b = clamp(num & 0xff)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// Sized in px rather than utility classes so the ladder can scale tiers down as
// they recede into the distance.
export function TierMedal({ league, state, size = 46 }) {
  const isLocked = state === 'locked'

  if (isLocked) {
    return (
      <span
        className="grid place-items-center rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#f0f0ee]"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="grid place-items-center" style={{ width: size * 0.42, height: size * 0.42 }}>
          <LockIcon className="w-full h-full text-[#7d7d80] [[data-theme=light]_&]:text-[#b4b4b1]" />
        </span>
      </span>
    )
  }

  const rim = darken(league.color)

  return (
    <span
      className="grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: state === 'current' ? `0 0 0 ${Math.max(2, Math.round(size / 16))}px rgba(102, 153, 236,.35)` : 'none',
      }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill={rim} />
        <circle cx="24" cy="22" r="19" fill={league.color} />
        <circle cx="24" cy="22" r="13.5" fill="none" stroke={rim} strokeWidth="1.6" opacity=".65" />
        <path d="M24 13.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z" fill="#fff" opacity=".9" />
      </svg>
    </span>
  )
}
