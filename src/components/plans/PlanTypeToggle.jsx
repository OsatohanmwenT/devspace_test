// Reuses the segmented-control language from the leaderboard tabs rather than
// inventing a third kind of switch: a quiet track with one raised active chip.
const BASE = 'relative z-10 min-h-9 rounded-lg px-4 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-[var(--border-focus)] [[data-theme=light]_&]:focus-visible:outline-[var(--brand-base)]'
const ACTIVE = `${BASE} text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]`
const IDLE = `${BASE} bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]`

export function PlanTypeToggle({ types, active, onSelect }) {
  const activeIndex = Math.max(0, types.findIndex((type) => type.id === active))

  return (
    <div
      className="relative grid grid-cols-2 rounded-xl bg-[var(--surface-default)] p-1 [[data-theme=light]_&]:bg-[var(--surface-subtle)]"
      role="radiogroup"
      aria-label="How you want to pay"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc((100%_-_8px)_/_2)] rounded-[var(--radius-control)] bg-[var(--surface-raised)] transition-transform duration-200 ease-out motion-reduce:transition-none"
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
