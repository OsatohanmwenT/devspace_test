import { formatTimeRemaining, getTimeRemaining } from '../../lib/week'

const HOUR_MS = 60 * 60 * 1000

const TONES = {
  calm: 'text-[var(--accent-progress)]',
  soon: 'text-[var(--accent-progress)]',
  urgent: 'text-[var(--accent-error)] [[data-theme=light]_&]:text-[var(--accent-error)]',
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
