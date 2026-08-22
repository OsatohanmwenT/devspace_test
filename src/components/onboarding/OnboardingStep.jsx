const FOCUS = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]'

// A filled surface when unselected and a solid accent when selected, matching
// the Practice topic pills — rather than a thin border on near-black.
function surface(isSelected) {
  return isSelected
    ? 'border border-[#2563eb] bg-[#2563eb] text-white'
    : 'border border-transparent [[data-theme=light]_&]:border-[#d4d4d4] bg-neutral-700/80 [[data-theme=light]_&]:bg-white text-[#e4e4e6] [[data-theme=light]_&]:text-neutral-800 hover:bg-neutral-600/80 [[data-theme=light]_&]:hover:border-[#737371]'
}

function isChosen(value, optionValue) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue
}

// Shared so OptionIcon (option rows/tiles) and MiniIcon (badges like the path
// preview's stage pills) draw from the same set instead of duplicating paths.
const ICON_PATHS = {
  code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2" /></>,
  blocks: <><path d="M12 3 5 7v8l7 4 7-4V7l-7-4Z" /><path d="m5 7 7 4 7-4M12 11v8" /></>,
  sparkles: <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.6 2.6 0 1 1 4.6 1.7c-.9 1-2.1 1.4-2.1 3M12 17h.01" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  sprout: <><path d="M12 21v-8M12 13c-4.5 0-6-3.2-6-6 3.8 0 6 1.8 6 6ZM12 16c4.5 0 6-3.2 6-6-3.8 0-6 1.8-6 6Z" /></>,
  puzzle: <path d="M10 4h4v2.5a1.5 1.5 0 1 0 3 0V4h3v4h-2.5a1.5 1.5 0 1 0 0 3H20v5h-4v-2.5a1.5 1.5 0 1 0-3 0V20H8v-4h2.5a1.5 1.5 0 1 0 0-3H8V8h2z" />,
  pencil: <><path d="m4 20 4.2-1 10-10-3.2-3.2-10 10L4 20Z" /><path d="m13 7 3.2 3.2" /></>,
  ribbon: <><circle cx="12" cy="10" r="5" /><path d="m8.5 14-1 6 4.5-2 4.5 2-1-6" /></>,
  message: <path d="M20 15a3 3 0 0 1-3 3H9l-5 3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8Z" />,
  sparkle: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />,

  // Branch icons — one per top-level area on the "which area" screen.
  web: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.3 2.4 3.6 5.5 3.6 9s-1.3 6.6-3.6 9c-2.3-2.4-3.6-5.5-3.6-9s1.3-6.6 3.6-9Z" /></>,
  mobile: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  backend: <><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></>,
  data: <><path d="M3 20h18M5 20v-8M11 20V4M17 20v-6" /></>,
  ai: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M6 9H3M6 15H3M21 9h-3M21 15h-3M9 6V3M15 6V3M9 21v-3M15 21v-3" /></>,
  marketing: <><path d="M3 10v4a1.5 1.5 0 0 0 1.5 1.5H6l3.5 4.5.9-.5-2-4h4.1l6.5 3.5v-12L12.5 10H4.5A1.5 1.5 0 0 0 3 10Z" /></>,
  media: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 5v14M16 5v14M3 10h5M16 10h5M3 15h5M16 15h5" /></>,
  design: <><path d="M12 3a9 9 0 1 0 3 17.5c.9-.3 1-1.6.2-2.2-.6-.4-.9-1-.9-1.7 0-1.1.9-2 2-2H18a4 4 0 0 0 4-4c0-4.1-4.5-7.6-10-7.6Z" /><circle cx="7.5" cy="12.5" r="1" /><circle cx="9.5" cy="8.5" r="1" /><circle cx="14.5" cy="8" r="1" /></>,
  cloud: <path d="M6.7 18a3.7 3.7 0 0 1 .5-7.4A5 5 0 0 1 17 9.3a4 4 0 0 1 .3 8.7Z" />,

  // Stage/tech icons for the path preview's skill pills.
  markup: <><path d="M4 3h16l-1.4 15L12 21l-6.6-3L4 3Z" /><path d="M7.3 7h9.3l-.3 3H8l.2 2.5h8l-.4 4L12 17.8l-3.7-1.3-.2-2.5" /></>,
  js: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 8v7a1.7 1.7 0 0 1-3 1M14 8v5.2c0 1.2.9 1.8 1.8 1.8s1.7-.6 1.7-1.7-.9-1.4-1.7-1.7c-.9-.3-1.8-.6-1.8-1.7 0-1 .8-1.6 1.7-1.6.7 0 1.2.3 1.6.8" /></>,
  react: <><circle cx="12" cy="12" r="1.8" /><ellipse cx="12" cy="12" rx="9" ry="3.6" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" /></>,
  python: <><path d="M12 3c-3.3 0-4.6 1-4.6 3.4V9h4.9v.9H5.4C3.6 9.9 3 11.6 3 13.5s.6 3.6 2.4 3.6h1.4v-2.5c0-2.3 1.3-3.6 3.6-3.6h3.9c1.9 0 3.4-1.5 3.4-3.4V6.4C17.7 4 16.3 3 12 3Z" /><path d="M12 21c3.3 0 4.6-1 4.6-3.4V15h-4.9v-.9h6.9c1.8 0 2.4-1.7 2.4-3.6" /><circle cx="9" cy="6" r=".6" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r=".6" fill="currentColor" stroke="none" /></>,
  swift: <path d="M17.5 15.8C14.8 18.3 10 20 6.5 18.2c1.6-.1 3-.6 4.1-1.4C7 15 4.7 11 4 6.5c2.3 2.3 4.9 4 7.6 4.9C9.8 9.2 8.4 6.7 8 4c3.9 3 8.1 5.4 12 9.6-1 .3-2 .3-3 0 .6.9 1.2 1.6 2.5 2.2Z" />,
  kotlin: <path d="M4 4h16L12 12l8 8H4V4Z" />,
  database: <><ellipse cx="12" cy="6" rx="7.5" ry="3" /><path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" /><path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" /></>,
  docker: <><path d="M2 13h20c0 3.9-3.6 7-9 7-6 0-11-3.5-11-7Z" /><path d="M5 13V10h3v3M9 13V10h3v3M13 13V10h3v3M9 9V6h3v3" /></>,
  git: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="9" r="2" /><path d="M6 8v8M6 8c0 4 3 5 6 5h4M18 11v0" /></>,
  api: <><rect x="3" y="9" width="6" height="6" rx="1" /><rect x="15" y="9" width="6" height="6" rx="1" /><path d="M9 12h6" /></>,
}

export function OptionList({ options, value, onSelect, layout = 'list' }) {
  if (layout === 'grid') {
    return (
      <div className="grid w-full max-w-[560px] grid-cols-2 gap-2.5" role="group">
        {options.map((option) => {
          const selected = isChosen(value, option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={`flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 text-center text-[13px] font-medium leading-[1.3] transition-[background,border-color] duration-[120ms] ${surface(selected)} ${FOCUS}`}
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
            >
              {option.icon && <OptionIcon name={option.icon} selected={selected} />}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid w-full max-w-[520px] gap-2.5" role="group">
      {options.map((option) => {
        const selected = isChosen(value, option.value)
        return (
          <button
            key={option.value}
            type="button"
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[14px] leading-[1.45] transition-[background,border-color] duration-[120ms] ${surface(selected)} ${FOCUS}`}
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
          >
            {option.icon && <OptionIcon name={option.icon} selected={selected} />}
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{option.label}</span>
              {option.note && (
                <span className={`block text-[13px] ${selected ? 'text-white/70' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{option.note}</span>
              )}
            </span>
            {option.aside && (
              <span className={`flex-none text-[13px] ${selected ? 'text-white/70' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{option.aside}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function OptionIcon({ name, selected }) {
  return (
    <span className={`grid size-9 flex-none place-items-center rounded-lg ${selected ? 'bg-white/95 text-[#2563eb]' : 'bg-black/10 [[data-theme=light]_&]:bg-[#f2f3f5]'}`} aria-hidden="true">
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {ICON_PATHS[name]}
      </svg>
    </span>
  )
}

// A bare icon with no surrounding tile — for badges like the path preview's
// numbered stage pills, which supply their own background circle.
export function MiniIcon({ name, className = 'size-3' }) {
  if (!ICON_PATHS[name]) return null
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

export function ChipList({ options, value, onSelect }) {
  return (
    <div className="flex max-w-[520px] flex-wrap justify-center gap-2.5" role="group">
      {options.map((option) => {
        const selected = isChosen(value, option.value)
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
            className={`min-h-10 rounded-full px-4 text-sm transition-[background,border-color] duration-[120ms] ${surface(selected)} ${FOCUS}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function StepHeading({ title, subtitle }) {
  return (
    <div className="grid content-start justify-items-center gap-2 text-center">
      <h1 className="m-0 max-w-[25ch] font-rethink-sans text-3xl font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{title}</h1>
      {subtitle && <p className="m-0 max-w-[60ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>}
    </div>
  )
}
