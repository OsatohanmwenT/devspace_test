import { useId, useState } from 'react'
import { InfoIcon } from './icons'

// Hover/focus shows it like a real tooltip; a click also toggles it, so it
// still works on touch devices that have no hover state at all.
//
// `tone="auto"` (default) follows the app's light/dark theme, for use inside
// surfaces that do the same. `tone="dark"` is for surfaces like the Plans
// modal that stay dark regardless of theme — using the theme-aware classes
// there would flip the tooltip to a white box on a dark page in light mode.
export function InfoTooltip({ label, children, align = 'center', tone = 'auto', className = '' }) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  const alignment = align === 'start'
    ? 'left-0'
    : align === 'end'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2'

  const iconTone = tone === 'dark'
    ? 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]'
  const outlineTone = tone === 'dark'
    ? 'focus-visible:outline-[var(--border-focus)]'
    : 'focus-visible:outline-[var(--border-focus)] [[data-theme=light]_&]:focus-visible:outline-[var(--brand-base)]'
  // Case, tracking and weight are pinned on the panel because these icons
  // usually sit inside uppercase tracked section headers, which the tooltip
  // would otherwise inherit and render as shouted small caps.
  const panelTone = tone === 'dark'
    ? 'border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-[var(--shadow-overlay)]'
    : 'border-[var(--border-default)] bg-[var(--surface-overlay)] text-[var(--text-primary)] shadow-[var(--shadow-overlay)]'

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        className={`grid size-11 place-items-center rounded-full border-0 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${iconTone} ${outlineTone}`}
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((current) => !current)}
      >
        <InfoIcon className="size-5" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute z-10 bottom-[calc(100%+8px)] ${alignment} w-max max-w-[240px] rounded-[var(--radius-control)] border p-3 text-left text-[var(--type-label)] font-normal normal-case leading-[var(--leading-label)] tracking-normal transition-opacity duration-100 ${panelTone} ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {children}
      </span>
    </span>
  )
}
