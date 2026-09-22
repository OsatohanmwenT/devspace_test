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

// Same parse as `darken`, just handed back as an rgba() string at a given
// alpha instead of a darkened hex — used for the "current" ring below.
function toRgba(hex, alpha) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
        // The ring used to be a hardcoded blue, unrelated to either the
        // league's own color or whatever accent the card around it was
        // using — now it's the league's own color, so "current" reads as
        // "this league, lit up" rather than a third, unrelated hue.
        boxShadow: state === 'current' ? `0 0 0 ${Math.max(2, Math.round(size / 16))}px ${toRgba(league.color, 0.35)}` : 'none',
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
