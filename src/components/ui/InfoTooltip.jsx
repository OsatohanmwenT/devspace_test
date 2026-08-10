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
    ? 'text-[#7d7d80] hover:text-[#f4f4f2]'
    : 'text-[#7d7d80] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#9a9a9d] [[data-theme=light]_&]:hover:text-[#202020]'
  const outlineTone = tone === 'dark'
    ? 'focus-visible:outline-[#888df2]'
    : 'focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]'
  // Case, tracking and weight are pinned on the panel because these icons
  // usually sit inside uppercase tracked section headers, which the tooltip
  // would otherwise inherit and render as shouted small caps.
  const panelTone = tone === 'dark'
    ? 'border-[#404040] bg-[#262626] text-[#f4f4f2] shadow-[0_8px_24px_rgba(0,0,0,.3)]'
    : 'border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#262626] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] shadow-[0_8px_24px_rgba(0,0,0,.3)] [[data-theme=light]_&]:shadow-[0_8px_24px_rgba(20,20,20,0.12)]'

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        className={`grid place-items-center w-5 h-5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${iconTone} ${outlineTone}`}
        aria-label={label}
        aria-describedby={tooltipId}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((current) => !current)}
      >
        <InfoIcon className="w-full h-full" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute z-10 bottom-[calc(100%+8px)] ${alignment} w-max max-w-[240px] rounded-lg border p-2.5 text-left text-[12px] font-normal normal-case leading-[1.45] tracking-normal transition-opacity duration-100 ${panelTone} ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {children}
      </span>
    </span>
  )
}
