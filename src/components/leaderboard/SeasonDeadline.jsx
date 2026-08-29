import { formatTimeRemaining, getTimeRemaining } from '../../lib/season'

const DAY_MS = 24 * 60 * 60 * 1000

const TONES = {
  calm: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  soon: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  urgent: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]',
}

// The deadline is what makes a season a season, so it stops being a quiet
// grey footnote once it is close enough to act on. A season is long enough
// that "urgent" only kicks in on the last couple of days — the same alarm at
// day 5 of 28 would just be noise.
//
// Plain text rather than a bordered pill: it sits directly under the league
// rule in a centred stack, where a third boxed element just adds chrome.
export function SeasonDeadline({ timestamp, className = '' }) {
  const remaining = getTimeRemaining(timestamp)
  const tone = remaining > 7 * DAY_MS ? 'calm' : remaining > 2 * DAY_MS ? 'soon' : 'urgent'
  const label = formatTimeRemaining(remaining)

  return (
    <span
      className={`text-[15px] font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
      role="timer"
    >
      {tone === 'calm' ? label : `Season ends in ${label.replace(' left', '')}`}
    </span>
  )
}
