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

export function OptionList({ options, value, onSelect }) {
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
  const paths = {
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
  }

  return (
    <span className={`grid size-9 flex-none place-items-center rounded-lg ${selected ? 'bg-white/95 text-[#2563eb]' : 'bg-black/10 [[data-theme=light]_&]:bg-[#f2f3f5]'}`} aria-hidden="true">
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
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
