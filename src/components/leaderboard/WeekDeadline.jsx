import { formatTimeRemaining, getTimeRemaining } from '../../lib/week'

const HOUR_MS = 60 * 60 * 1000

const TONES = {
  calm: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  soon: 'text-[#f5a623] [[data-theme=light]_&]:text-[#8a5a00]',
  urgent: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]',
}

// The deadline is what makes a weekly league a weekly league, so it stops being
// a quiet grey footnote once it is close enough to act on.
//
// Plain text rather than a bordered pill: it sits directly under the league
// rule in a centred stack, where a third boxed element just adds chrome.
export function WeekDeadline({ timestamp, className = '' }) {
  const remaining = getTimeRemaining(timestamp)
  const tone = remaining > 48 * HOUR_MS ? 'calm' : remaining > 24 * HOUR_MS ? 'soon' : 'urgent'
  const label = formatTimeRemaining(remaining)

  return (
    <span
      className={`text-[15px] font-semibold whitespace-nowrap ${TONES[tone]} ${className}`}
      role="timer"
    >
      {tone === 'calm' ? label : `Week ends in ${label.replace(' left', '')}`}
    </span>
  )
}
