import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { InfoTooltip } from '../ui/InfoTooltip'
import { getPlan, getPlansByType, getPlanType, PLAN_TYPES, PREMIUM_PERKS, TRIAL_DAYS } from '../../data/plans'
import { PlanCard } from './PlanCard'
import { PlanTypeToggle } from './PlanTypeToggle'
import { PerkList } from './PerkList'

function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="absolute right-5 top-5 grid size-11 place-items-center rounded-[var(--radius-control)] border border-[var(--border-interactive)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--border-focus)]" aria-label="Close Premium plans">
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
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--surface-canvas)] px-5 py-20 text-[var(--text-primary)]" aria-label="Premium">
        <CloseButton onClick={onBack} />
        <div className="grid w-full max-w-[580px] gap-6 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] p-7 text-center shadow-[var(--shadow-raised)]">
          <span className="justify-self-center rounded-full bg-[var(--surface-brand-tint)] px-3 py-1 text-xs font-semibold text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">Premium active</span>
          <div className="grid gap-2">
            <h1 className="m-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(32px,5vw,48px)] font-medium">You&apos;re on {plan.name}</h1>
            <p className="m-0 text-[15px] leading-[1.5] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">Your streak protections and league extras are ready when you need them.</p>
          </div>
          <PerkList perks={PREMIUM_PERKS} highlightPerk={highlightPerk} />
          <div className="grid gap-3 border-t border-white/10 pt-5 [[data-theme=light]_&]:border-[var(--border-hairline)]">
            <ActionButton variant="secondary" className="text-sm" onClick={onCancel}>Turn off Premium</ActionButton>
            <span className="text-xs text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">This demo does not bill or require a refund.</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--surface-canvas)] px-5 py-16 text-[var(--text-primary)] max-[680px]:px-4 max-[680px]:py-20" aria-label="Premium plans">
      <CloseButton onClick={onBack} />
      <div className="mx-auto grid w-full max-w-[1160px] gap-8">
        <header className="mx-auto grid max-w-[630px] gap-3 text-center">
          <span className="text-[11px] font-bold tracking-[.13em] text-[var(--brand-on-dark)] uppercase [[data-theme=light]_&]:text-[var(--brand-cta)]">Devspace Premium</span>
          <h1 className="m-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(32px,4vw,48px)] leading-[1.02] font-medium tracking-[-.04em]">Choose the pace that fits you</h1>
          <p className="m-0 flex items-center justify-center gap-1.5 text-[16px] leading-[1.5] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">
            Status and safety nets for your streak and league.
            <InfoTooltip label="Does this affect my score?">
              Every learner still competes on the same XP — Premium never buys a faster score.
            </InfoTooltip>
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-[760px] gap-5">
          <div className="flex items-center justify-between gap-4 max-[560px]:flex-col max-[560px]:items-stretch">
            <h2 className="m-0 text-[15px] font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">How you want to pay</h2>
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
          <p className="m-0 text-[13px] leading-[1.5] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]" aria-live="polite">
            {activeType.note}{' '}
            <span className="text-[var(--text-secondary)]">{activeType.crossRef}</span>
          </p>

          {/* Stated once. Every plan unlocks the same thing, so repeating this
              per card was three copies of the same five lines. */}
          <section className="grid gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-default)] p-5 [[data-theme=light]_&]:border-[var(--border-default)] [[data-theme=light]_&]:bg-white" aria-labelledby="premium-perks-title">
            <h2 id="premium-perks-title" className="m-0 text-sm font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">Every plan includes</h2>
            <PerkList perks={PREMIUM_PERKS} highlightPerk={highlightPerk} />
          </section>

          {!confirming ? (
            <div className="grid justify-items-center gap-2">
              <ActionButton variant="primary" className="w-full max-w-[360px] text-base" onClick={() => startTrial(selectedPlanId)}>
                {selectedPlan.type === 'onetime'
                  ? `Get ${selectedPlan.name} — ${selectedPlan.priceLabel} once`
                  : `Start your ${TRIAL_DAYS}-day ${selectedPlan.name} trial`}
              </ActionButton>
              <span className="text-xs text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">No card needed — this is a demo you can turn off any time.</span>
            </div>
          ) : (
            <section className="grid justify-items-center gap-3 rounded-2xl border border-[var(--brand-cta)] bg-[var(--brand-cta)]/10 p-5 text-center [[data-theme=light]_&]:bg-[var(--surface-brand-tint)]" aria-live="polite">
              <strong className="text-[15px]">Activate {selectedPlan.name} — {selectedPlan.priceLabel} {selectedPlan.period}?</strong>
              <div className="flex justify-center gap-3 max-[480px]:w-full max-[480px]:flex-col">
                <ActionButton variant="primary" className="text-sm" onClick={() => onActivate(selectedPlanId)}>
                  Yes, activate
                </ActionButton>
                <ActionButton variant="secondary" className="text-sm" onClick={() => setConfirming(false)}>
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
