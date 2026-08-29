import { formatTimeRemaining, getSeasonTimeRemaining } from '../../lib/week'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const TONES = {
  calm: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  soon: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  urgent: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]',
}

// The deadline is what makes a season a season, so it stops being a quiet
// grey footnote once it is close enough to act on. A 28-day season reads its
// "calm" window in days rather than the old weekly version's hours, since a
// week of runway means something different across a month-long clock.
export function SeasonDeadline({ timestamp, className = '' }) {
  const remaining = getSeasonTimeRemaining(timestamp)
  const tone = remaining > 7 * DAY_MS ? 'calm' : remaining > 48 * HOUR_MS ? 'soon' : 'urgent'
  const label = formatTimeRemaining(remaining)

  return (
    <span
      className={`text-[15px] font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
      role="timer"
    >
      {tone === 'calm' ? `${label} in this season` : `Season ends in ${label.replace(' left', '')}`}
    </span>
  )
}
