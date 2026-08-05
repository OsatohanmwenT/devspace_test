const FOCUS = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]'

// A filled surface when unselected and a solid accent when selected, matching
// the Practice topic pills — rather than a thin border on near-black.
function surface(isSelected) {
  return isSelected
    ? 'border border-[#513deb] bg-[#513deb] text-white'
    : 'border border-transparent [[data-theme=light]_&]:border-[#d4d4d4] bg-neutral-700/80 [[data-theme=light]_&]:bg-white text-[#e4e4e6] [[data-theme=light]_&]:text-[#202020] hover:bg-neutral-600/80 [[data-theme=light]_&]:hover:border-[#737371]'
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
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-[15px] leading-[1.45] transition-[background,border-color] duration-[120ms] ${surface(selected)} ${FOCUS}`}
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
          >
            {option.icon && <span className="text-[18px]" aria-hidden="true">{option.icon}</span>}
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
            className={`min-h-10 rounded-md px-4 text-sm transition-[background,border-color] duration-[120ms] ${surface(selected)} ${FOCUS}`}
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
      <h1 className="m-0 max-w-[20ch] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(26px,3.4vw,34px)] font-medium tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{title}</h1>
      {subtitle && <p className="m-0 max-w-[46ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>}
    </div>
  )
}
