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
      className={`relative grid content-start gap-1 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#89baff] ${
        isSelected
          ? 'border-[#6699ec] bg-[#6699ec]/10 [[data-theme=light]_&]:bg-white'
          : 'border-[#3a3a3e] bg-[#1d1d20] hover:border-[#5a5a61] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#b8b2a8]'
      }`}
    >
      {isRecommended && <span className="absolute -top-3 right-4 rounded-full bg-[#6699ec] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.06em] text-white">{plan.badge}</span>}
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#f7f7f8] [[data-theme=light]_&]:text-neutral-800">{plan.name}</span>
        {isSelected
          ? <CheckIcon className="size-4 flex-none text-[#89baff] [[data-theme=light]_&]:text-[#3d77eb]" aria-hidden="true" />
          : null}
      </span>

      <span className="flex items-baseline gap-1.5">
        <strong className="text-[32px] leading-none font-medium tracking-[-.03em] text-white [[data-theme=light]_&]:text-neutral-800">{plan.priceLabel}</strong>
        <span className="text-[13px] text-[#c3c3ca] [[data-theme=light]_&]:text-[#686968]">{plan.period}</span>
      </span>

      <span className="text-[13px] text-[#b8b8c0] [[data-theme=light]_&]:text-[#626262]">
        {plan.billedLabel}
        {plan.savingLabel && <span className="ml-1.5 font-semibold text-[#59d9eb] [[data-theme=light]_&]:text-[#04adc0]">{plan.savingLabel}</span>}
      </span>
    </button>
  )
}
