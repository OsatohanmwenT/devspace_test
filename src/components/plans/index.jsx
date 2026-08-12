import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { InfoTooltip } from '../ui/InfoTooltip'
import { getPlan, getPlansByType, getPlanType, PLAN_TYPES, PREMIUM_PERKS, TRIAL_DAYS } from '../../data/plans'
import { PlanCard } from './PlanCard'
import { PlanTypeToggle } from './PlanTypeToggle'
import { PerkList } from './PerkList'

function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="absolute top-5 right-5 grid size-11 place-items-center rounded-xl border border-[#57575d] bg-transparent text-[#d4d4d9] hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#89baff] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#525252] [[data-theme=light]_&]:hover:bg-black/5" aria-label="Close Premium plans">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    </button>
  )
}

export default function PlansView({ progress, onActivate, onCancel, highlightPerk, onBack }) {
  const [planType, setPlanType] = useState('subscription')
  const [selectedPlanId, setSelectedPlanId] = useState('annual')
  const [confirming, setConfirming] = useState(false)
  const selectedPlan = getPlan(selectedPlanId)
  const activeType = getPlanType(planType)
  const visiblePlans = getPlansByType(planType)

  const startTrial = (planId) => {
    setSelectedPlanId(planId)
    setConfirming(true)
  }

  // Switching model has to move the selection with it, or the CTA would still
  // name a plan that is no longer on screen.
  const selectPlanType = (typeId) => {
    setPlanType(typeId)
    setConfirming(false)
    const options = getPlansByType(typeId)
    if (!options.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId((options.find((plan) => plan.badge) ?? options[0]).id)
    }
  }

  if (progress.isPremium) {
    const plan = getPlan(progress.premiumPlanId)

    return (
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[#111113] px-5 py-20 text-[#f4f4f6] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800" aria-label="Premium">
        <CloseButton onClick={onBack} />
        <div className="grid w-full max-w-[580px] gap-6 rounded-[24px] border border-[#3a3a3e] bg-[#1d1d20] p-7 text-center [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)]">
          <span className="justify-self-center rounded-full bg-[#6699ec]/20 px-3 py-1 text-xs font-semibold text-[#b8b3ff] [[data-theme=light]_&]:bg-[#6699ec]/12 [[data-theme=light]_&]:text-[#3d77eb]">Premium active</span>
          <div className="grid gap-2">
            <h1 className="m-0 font-rethink-sans text-[clamp(32px,5vw,48px)] font-medium">You&apos;re on {plan.name}</h1>
            <p className="m-0 text-[15px] leading-[1.5] text-[#b8b8c0] [[data-theme=light]_&]:text-[#626262]">Your streak protections and league extras are ready when you need them.</p>
          </div>
          <PerkList perks={PREMIUM_PERKS} highlightPerk={highlightPerk} />
          <div className="grid gap-3 border-t border-white/10 pt-5 [[data-theme=light]_&]:border-[#ececea]">
            <ActionButton variant="neutral" className="min-h-11 text-sm font-medium" onClick={onCancel}>Turn off Premium</ActionButton>
            <span className="text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">This demo does not bill or require a refund.</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#111113] px-5 py-16 text-[#f4f4f6] max-[680px]:px-4 max-[680px]:py-20 [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800" aria-label="Premium plans">
      <CloseButton onClick={onBack} />
      <div className="mx-auto grid w-full max-w-[1160px] gap-8">
        <header className="mx-auto grid max-w-[630px] gap-3 text-center">
          <span className="text-[11px] font-bold tracking-[.13em] text-[#89baff] uppercase [[data-theme=light]_&]:text-[#3d77eb]">Devspace Premium</span>
          <h1 className="m-0 font-rethink-sans text-[clamp(32px,4vw,48px)] leading-[1.02] font-medium tracking-[-.04em]">Choose the pace that fits you</h1>
          <p className="m-0 flex items-center justify-center gap-1.5 text-[16px] leading-[1.5] text-[#b8b8c0] [[data-theme=light]_&]:text-[#626262]">
            Status and safety nets for your streak and league.
            <InfoTooltip label="Does this affect my score?">
              Every learner still competes on the same XP — Premium never buys a faster score.
            </InfoTooltip>
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-[760px] gap-5">
          <div className="flex items-center justify-between gap-4 max-[560px]:flex-col max-[560px]:items-stretch">
            <h2 className="m-0 text-[15px] font-semibold text-[#f7f7f8] [[data-theme=light]_&]:text-neutral-800">How you want to pay</h2>
            <PlanTypeToggle types={PLAN_TYPES} active={planType} onSelect={selectPlanType} />
          </div>

          <div
            className={`grid gap-3 max-[680px]:grid-cols-1 ${visiblePlans.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
            role="radiogroup"
            aria-label={`Choose a ${activeType.label.toLowerCase()} plan`}
          >
            {visiblePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={plan.id === selectedPlanId}
                onSelect={(planId) => { setSelectedPlanId(planId); setConfirming(false) }}
              />
            ))}
          </div>

          {/* The point of the toggle: say what this model commits you to, and
              what the other one would cost, without making them switch to find out. */}
          <p className="m-0 text-[13px] leading-[1.5] text-[#b8b8c0] [[data-theme=light]_&]:text-[#626262]" aria-live="polite">
            {activeType.note}{' '}
            <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#8a8a86]">{activeType.crossRef}</span>
          </p>

          {/* Stated once. Every plan unlocks the same thing, so repeating this
              per card was three copies of the same five lines. */}
          <section className="grid gap-3 rounded-2xl border border-[#3a3a3e] bg-[#1d1d20] p-5 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white" aria-labelledby="premium-perks-title">
            <h2 id="premium-perks-title" className="m-0 text-sm font-semibold text-[#f7f7f8] [[data-theme=light]_&]:text-neutral-800">Every plan includes</h2>
            <PerkList perks={PREMIUM_PERKS} highlightPerk={highlightPerk} />
          </section>

          {!confirming ? (
            <div className="grid justify-items-center gap-2">
              <ActionButton variant="premium" className="min-h-[52px] w-full max-w-[360px] text-[15px] font-medium" onClick={() => startTrial(selectedPlanId)}>
                {selectedPlan.type === 'onetime'
                  ? `Get ${selectedPlan.name} — ${selectedPlan.priceLabel} once`
                  : `Start your ${TRIAL_DAYS}-day ${selectedPlan.name} trial`}
              </ActionButton>
              <span className="text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">No card needed — this is a demo you can turn off any time.</span>
            </div>
          ) : (
            <section className="grid justify-items-center gap-3 rounded-2xl border border-[#6699ec] bg-[#6699ec]/10 p-5 text-center [[data-theme=light]_&]:bg-[#eff4ff]" aria-live="polite">
              <strong className="text-[15px]">Activate {selectedPlan.name} — {selectedPlan.priceLabel} {selectedPlan.period}?</strong>
              <div className="flex justify-center gap-3 max-[480px]:w-full max-[480px]:flex-col">
                <ActionButton variant="premium" className="min-h-11 text-sm font-medium" onClick={() => onActivate(selectedPlanId)}>
                  Yes, activate
                </ActionButton>
                <ActionButton variant="neutral" className="min-h-11 text-sm font-medium" onClick={() => setConfirming(false)}>
                  Not now
                </ActionButton>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
