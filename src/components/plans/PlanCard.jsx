// A price row, not a feature column. Every plan unlocks exactly the same perks
// (stated once beside the rows), so the only question a row answers is "how do
// I want to pay?" — name and billing on the left, the price you compare on the
// right, with the monthly price struck through when a plan undercuts it.
export function PlanCard({ plan, isSelected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(plan.id)}
      className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-[border-color,background,box-shadow] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#89baff] ${
        isSelected
          ? 'border-[#6699ec] bg-[#6699ec]/10 shadow-[0_0_0_1px_#6699ec] [[data-theme=light]_&]:bg-[#eff4ff]'
          : 'border-[#3a3a3e] bg-[#1d1d20] hover:border-[#5a5a61] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#b8b2a8]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-5 flex-none place-items-center rounded-full border-2 transition-colors ${
          isSelected ? 'border-[#6699ec] bg-[#6699ec]' : 'border-[#6b6b72] [[data-theme=light]_&]:border-[#b8b8b4]'
        }`}
      >
        {isSelected && <span className="size-2 rounded-full bg-white" />}
      </span>

      <span className="grid min-w-0 flex-1 gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold text-[#f7f7f8] [[data-theme=light]_&]:text-neutral-800">{plan.name}</span>
          {plan.badge && <span className="rounded-full bg-[#6699ec] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.06em] text-white">{plan.badge}</span>}
          {plan.savingLabel && <span className="rounded-full bg-[#04adc0]/15 px-2 py-0.5 text-[11px] font-semibold text-[#59d9eb] [[data-theme=light]_&]:bg-[#04adc0]/12 [[data-theme=light]_&]:text-[#04828f]">{plan.savingLabel}</span>}
        </span>
        <span className="text-[13px] text-[#b8b8c0] [[data-theme=light]_&]:text-[#626262]">{plan.billedLabel}</span>
      </span>

      <span className="grid flex-none justify-items-end gap-0.5">
        <span className="flex items-baseline gap-1.5">
          {plan.compareLabel && <s className="text-[13px] text-[#8a8a92] [[data-theme=light]_&]:text-[#8a8a86]">{plan.compareLabel}</s>}
          <strong className="text-[28px] leading-none font-medium tracking-[-.03em] text-white [[data-theme=light]_&]:text-neutral-800">{plan.priceLabel}</strong>
        </span>
        <span className="text-xs text-[#c3c3ca] [[data-theme=light]_&]:text-[#686968]">{plan.period}</span>
      </span>
    </button>
  )
}
