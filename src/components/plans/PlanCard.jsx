import { CheckIcon } from '../ui/icons'

// A price tile, not a feature column. Every plan unlocks exactly the same
// perks, so listing them per card repeated the same five lines three times and
// forced a 580px card height. The perks are stated once below the tiles; the
// only question a tile has to answer is "how do I want to pay?".
export function PlanCard({ plan, isSelected, onSelect }) {
  const isRecommended = Boolean(plan.badge)

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(plan.id)}
      className={`relative grid content-start gap-1 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--brand-on-dark)] ${
        isSelected
          ? 'border-[var(--brand-cta)] bg-[var(--brand-cta)]/10 [[data-theme=light]_&]:bg-white'
          : 'border-[var(--border-default)] bg-[var(--surface-default)] hover:border-[var(--border-interactive)]'
      }`}
    >
      {isRecommended && <span className="absolute -top-3 right-4 rounded-full bg-[var(--brand-cta)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.06em] text-white">{plan.badge}</span>}
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{plan.name}</span>
        {isSelected
          ? <CheckIcon className="size-4 flex-none text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-cta)]" aria-hidden="true" />
          : null}
      </span>

      <span className="flex items-baseline gap-1.5">
        <strong className="text-[32px] leading-none font-medium tracking-[-.03em] text-white [[data-theme=light]_&]:text-[var(--text-primary)]">{plan.priceLabel}</strong>
        <span className="text-[13px] text-[var(--text-secondary)]">{plan.period}</span>
      </span>

      <span className="text-[13px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">
        {plan.billedLabel}
        {plan.savingLabel && <span className="ml-1.5 font-semibold text-[var(--accent-data)]">{plan.savingLabel}</span>}
      </span>
    </button>
  )
}
