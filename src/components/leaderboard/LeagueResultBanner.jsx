import { ActionButton } from '../ui/ActionButton'
import { InfoTooltip } from '../ui/InfoTooltip'
import { ordinal } from '../../lib/ordinal'
import { can, CAPABILITIES } from '../../lib/entitlements'

const TONE = {
  promoted: { accent: 'var(--accent-data)', surface: 'bg-[var(--surface-data-tint)]' },
  demoted: { accent: 'var(--accent-error)', surface: 'bg-[var(--surface-error-tint)]' },
  stayed: { accent: 'var(--brand-cta)', surface: 'bg-[var(--surface-brand-tint)]' },
}

export function LeagueResultBanner({ result, progress, onDismiss, onOpenPlans }) {
  const tone = TONE[result.outcome] ?? TONE.stayed
  const rank = ordinal(result.rank)

  const message = result.outcome === 'promoted'
    ? `You finished ${rank} and moved up to ${result.toLeague}.`
    : result.outcome === 'demoted'
      ? `You finished ${rank} and dropped to ${result.toLeague}.`
      : `You finished ${rank} and held your place in ${result.fromLeague}.`

  // This is the highest-intent moment in the product — offer something here, but
  // only where it's honest. A demotion is the one place a real safety net
  // (the shield) matters; a neutral week has nothing to sell against, and a
  // promotion deserves a celebration before an ask.
  const isDemoted = result.outcome === 'demoted'
  const isPromoted = result.outcome === 'promoted'
  const hasShield = can(progress, CAPABILITIES.STREAK_SHIELD)

  return (
    <div className={`grid gap-3 p-4 rounded-2xl ${tone.surface}`} role="status">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <strong className="text-[13px] font-semibold uppercase tracking-[.08em]" style={{ color: tone.accent }}>Last week's result</strong>
          <span className="text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] text-[15px]">{message}</span>
          <span className="text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] text-[13px]">{result.score.toLocaleString()} px earned</span>
        </div>
        <button
          type="button"
          className="grid w-9 h-9 flex-none place-items-center border-0 rounded-lg bg-transparent text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-cta)]"
          onClick={onDismiss}
          aria-label="Dismiss last week's result"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {isDemoted && !hasShield && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-default)] pt-3">
          <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
            Keep your streak with a shield.
            <InfoTooltip label="What a streak shield does" align="start">
              Covers one missed day a week. It won't change your rank.
            </InfoTooltip>
          </span>
          <ActionButton variant="secondary" className="flex-none px-4 text-sm" onClick={() => onOpenPlans?.('streak-shield')}>
            Keep your streak next week
          </ActionButton>
        </div>
      )}

      {isPromoted && !can(progress, CAPABILITIES.ALL_TIME_BOARD) && (
        <button
          type="button"
          className="justify-self-start text-[13px] font-medium text-[var(--accent-data)] [[data-theme=light]_&]:text-[var(--accent-data)] hover:underline"
          onClick={() => onOpenPlans?.('all-time')}
        >
          Make {result.toLeague} stick — see Premium
        </button>
      )}
    </div>
  )
}
