import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { InfoTooltip } from '../ui/InfoTooltip'
import { ordinal } from '../../lib/ordinal'
import { can, CAPABILITIES } from '../../lib/entitlements'

const TONE = {
  promoted: { accent: '#04adc0', ring: 'border-[#04adc0]/25' },
  demoted: { accent: '#ff676d', ring: 'border-[#ff676d]/25' },
  stayed: { accent: '#6699ec', ring: 'border-[#6699ec]/25' },
}

export function LeagueResultBanner({ result, progress, onDismiss, onOpenPlans, onShare }) {
  const tone = TONE[result.outcome] ?? TONE.stayed
  const rank = ordinal(result.rank)

  const message = result.outcome === 'promoted'
    ? `You finished ${rank} and moved up to ${result.toLeague}.`
    : result.outcome === 'demoted'
      ? `You finished ${rank} and dropped to ${result.toLeague}.`
      : `You finished ${rank} and held your place in ${result.fromLeague}.`

  // This is the highest-intent moment in the product — offer something here, but
  // only where it's honest. A demotion is the one place a real safety net
  // (the shield) matters; a neutral season has nothing to sell against, and a
  // promotion deserves a celebration before an ask.
  const isDemoted = result.outcome === 'demoted'
  const isPromoted = result.outcome === 'promoted'
  const hasShield = can(progress, CAPABILITIES.STREAK_SHIELD)

  // "Held your place" is the one outcome where nothing happened. It was getting
  // the same three-line card as a promotion — 110px plus a gap, at the top of
  // the page, above the only thing the learner can act on. A non-event gets a
  // single line it can be read and dismissed from.
  if (!isPromoted && !isDemoted) {
    return (
      <div className="flex w-full max-w-[860px] mx-auto items-center gap-3 rounded-xl border bg-[#1a1a1c] py-2.5 pl-4 pr-2 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] border-white/5 [[data-theme=light]_&]:border-black/[0.06]" role="status">
        {/* Built from the parts rather than trimmed out of `message`, which
            would leave its full stop stranded mid-line. */}
        <span className="min-w-0 flex-1 truncate text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Last season</strong>
          {` · ${rank} in ${result.fromLeague} · ${result.score.toLocaleString()} 🪙`}
        </span>
        <button
          type="button"
          className="grid size-8 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
          onClick={onDismiss}
          aria-label="Dismiss last season's result"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div className={`grid w-full max-w-[860px] mx-auto gap-4 rounded-2xl border bg-[#1a1a1c] p-5 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] ${tone.ring}`} role="status">
      <div className="flex items-start gap-4">
        {/* A promotion and a demotion otherwise differ only by an accent stripe
            and one word. A neutral season gets no mascot — nothing happened that
            is worth a reaction. */}
        {(isPromoted || isDemoted) && (
          <DevyMood
            mood={isPromoted ? 'celebrating' : 'annoyed'}
            className="-my-1 size-16 flex-none max-[680px]:size-14"
          />
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          <strong className="text-[13px] font-semibold uppercase tracking-[.08em]" style={{ color: tone.accent }}>Last season's result</strong>
          <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px]">{message}</span>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{result.score.toLocaleString()} 🪙 earned</span>
        </div>
        <button
          type="button"
          className="grid w-9 h-9 flex-none place-items-center border-0 rounded-lg bg-transparent text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
          onClick={onDismiss}
          aria-label="Dismiss last season's result"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      {isDemoted && !hasShield && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#ebe9e4]">
          <span className="flex items-center gap-1.5 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Keep your streak with a shield.
            <InfoTooltip label="What a streak shield does" align="start">
              Covers one missed day a week. It won't change your rank.
            </InfoTooltip>
          </span>
          <ActionButton variant="neutral" className="min-h-9 flex-none px-4 text-sm font-medium" onClick={() => onOpenPlans?.('streak-shield')}>
            See streak shields
          </ActionButton>
        </div>
      )}

      {isPromoted && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#ebe9e4]">
          <button
            type="button"
            className="text-[13px] font-medium text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b] hover:underline"
            onClick={onShare}
          >
            Share this
          </button>
          {!can(progress, CAPABILITIES.ALL_TIME_BOARD) && (
            <button
              type="button"
              className="text-[13px] font-medium text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b] hover:underline"
              onClick={() => onOpenPlans?.('all-time')}
            >
              Make {result.toLeague} stick — see Premium
            </button>
          )}
        </div>
      )}
    </div>
  )
}
