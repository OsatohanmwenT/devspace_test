import { ActionButton } from '../ui/ActionButton'
import { DevyMood } from '../ui/DevyMood'
import { InfoTooltip } from '../ui/InfoTooltip'
import { ShareButton } from '../ui/ShareButton'
import { ordinal } from '../../lib/ordinal'
import { can, CAPABILITIES } from '../../lib/entitlements'
import { getAccessCta } from '../../lib/leagueAccess'
import { promotionShareText, qualifiedShareText } from '../../lib/shareText'

const TONE = {
  promoted: { accent: '#04adc0', ring: 'border-[#04adc0]/25' },
  qualified: { accent: '#f0c964', ring: 'border-[#f0c964]/25' },
  demoted: { accent: '#ff676d', ring: 'border-[#ff676d]/25' },
  stayed: { accent: '#6699ec', ring: 'border-[#6699ec]/25' },
}

export function LeagueResultBanner({ result, progress, onDismiss, onOpenPlans, onViewRecap }) {
  const tone = TONE[result.outcome] ?? TONE.stayed
  const rank = ordinal(result.rank)
  const isQualified = result.outcome === 'qualified'

  const message = isQualified
    ? `You finished ${rank} in ${result.fromLeague} — that's enough to qualify for ${result.qualifiedLeague}.`
    : result.outcome === 'promoted'
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

  // A crossing into Silver gets named regardless of whether access came with
  // it — "you unlocked it" is true the moment rank alone says so, and the CTA
  // is the only thing that changes depending on how (or whether) it was granted.
  const isSilverMilestone = (isPromoted && result.toLeague === 'Silver League') || isQualified
  const accessCta = isSilverMilestone ? getAccessCta(result.accessVia) : null

  // "Held your place" is the one outcome where nothing happened. It was getting
  // the same three-line card as a promotion — 110px plus a gap, at the top of
  // the page, above the only thing the learner can act on. A non-event gets a
  // single line it can be read and dismissed from.
  if (!isPromoted && !isDemoted && !isQualified) {
    return (
      <div className="flex w-full max-w-[860px] mx-auto items-center gap-3 rounded-xl border bg-[#1a1a1c] py-2.5 pl-4 pr-2 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)] border-white/5 [[data-theme=light]_&]:border-black/[0.06]" role="status">
        {/* Built from the parts rather than trimmed out of `message`, which
            would leave its full stop stranded mid-line. */}
        <span className="min-w-0 flex-1 truncate text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Last season</strong>
          {` · ${rank} in ${result.fromLeague} · ${result.score.toLocaleString()} 🪙`}
          {result.reward > 0 && ` · ₦${result.reward.toLocaleString()} earned`}
        </span>
        {onViewRecap && (
          <button
            type="button"
            className="flex-none rounded-lg border-0 bg-transparent px-2 text-[13px] font-medium text-[#6699ec] hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
            onClick={onViewRecap}
          >
            Recap
          </button>
        )}
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
            and one word. A neutral week gets no mascot — nothing happened that
            is worth a reaction. Qualifying reads as a win even when access
            didn't come with it, so it gets the same celebrating mood. */}
        {(isPromoted || isDemoted || isQualified) && (
          <DevyMood
            mood={isDemoted ? 'annoyed' : 'celebrating'}
            className="-my-1 size-16 flex-none max-[680px]:size-14"
          />
        )}
        <div className="grid min-w-0 flex-1 gap-1">
          <strong className="text-[13px] font-semibold uppercase tracking-[.08em]" style={{ color: tone.accent }}>
            {isSilverMilestone ? 'You unlocked Silver League' : "Last season's result"}
          </strong>
          <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px]">{message}</span>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">
            {result.score.toLocaleString()} 🪙 earned
            {result.reward > 0 && ` · ₦${result.reward.toLocaleString()} reward confirmed`}
          </span>
          {onViewRecap && (
            <button
              type="button"
              className="justify-self-start rounded-lg border-0 bg-transparent p-0 text-[13px] font-medium text-[#6699ec] hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
              onClick={onViewRecap}
            >
              View season recap
            </button>
          )}
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

      {isSilverMilestone && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#ebe9e4]">
          <span className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            {accessCta.kind === 'locked'
              ? "Silver's reward pool is bigger — Pro is what gets you actually competing there."
              : 'Your standing carries over — pick up right where you qualified.'}
          </span>
          <div className="flex flex-none items-center gap-2">
            <ShareButton
              variant="neutral"
              className="min-h-9 px-4 text-sm font-medium"
              text={accessCta.kind === 'locked' ? qualifiedShareText({ league: result.qualifiedLeague }) : promotionShareText({ league: result.toLeague })}
            >
              Share
            </ShareButton>
            <ActionButton
              variant={accessCta.kind === 'locked' ? 'primary' : 'neutral'}
              className="min-h-9 px-4 text-sm font-medium"
              onClick={() => (accessCta.kind === 'locked' ? onOpenPlans?.('silver-plus') : onDismiss())}
            >
              {accessCta.label}
            </ActionButton>
          </div>
        </div>
      )}

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

      {isPromoted && !isSilverMilestone && !can(progress, CAPABILITIES.ALL_TIME_BOARD) && (
        <button
          type="button"
          className="justify-self-start text-[13px] font-medium text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b] hover:underline"
          onClick={() => onOpenPlans?.('all-time')}
        >
          Make {result.toLeague} stick — see Premium
        </button>
      )}
    </div>
  )
}
