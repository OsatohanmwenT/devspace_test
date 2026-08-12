// Reuses the segmented-control language from the leaderboard tabs rather than
// inventing a third kind of switch: a quiet track with one raised active chip.
const BASE = 'relative z-10 min-h-9 rounded-lg px-4 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]'
const ACTIVE = `${BASE} text-[#f7f7f8] [[data-theme=light]_&]:text-neutral-800`
const IDLE = `${BASE} bg-transparent text-[#9a9a9d] hover:text-[#f7f7f8] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-700`

export function PlanTypeToggle({ types, active, onSelect }) {
  const activeIndex = Math.max(0, types.findIndex((type) => type.id === active))

  return (
    <div
      className="relative grid grid-cols-2 rounded-xl bg-[#1d1d20] p-1 [[data-theme=light]_&]:bg-[#f2f2f0]"
      role="radiogroup"
      aria-label="How you want to pay"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc((100%_-_8px)_/_2)] rounded-lg bg-[#2c2c31] [[data-theme=light]_&]:bg-white transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {types.map((type) => {
        const isActive = type.id === active
        return (
          <button
            key={type.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(type.id)}
            className={isActive ? ACTIVE : IDLE}
          >
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
