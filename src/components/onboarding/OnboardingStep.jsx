const OPTION_BASE = 'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-[1.45] transition-[border-color,background] duration-[120ms] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]'

function optionClassName(isSelected) {
  return isSelected
    ? `${OPTION_BASE} border-[#6f66ec] bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e5e4f4] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]`
    : `${OPTION_BASE} border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white text-[#e4e4e6] [[data-theme=light]_&]:text-[#202020] hover:border-[#8a8a8e] [[data-theme=light]_&]:hover:border-[#737371]`
}

export function OptionList({ options, value, onSelect, showNumbers = false }) {
  return (
    <div className="grid w-full max-w-[520px] gap-2.5" role="group">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          className={optionClassName(value === option.value)}
          aria-pressed={value === option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.icon && <span className="text-[18px]" aria-hidden="true">{option.icon}</span>}
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{option.label}</span>
            {option.note && <span className="block text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{option.note}</span>}
          </span>
          {option.aside && <span className="flex-none text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{option.aside}</span>}
          {showNumbers && index < 9 && (
            <span className="grid h-6 w-6 flex-none place-items-center rounded-md border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] text-[11px] text-[#89898e]" aria-hidden="true">{index + 1}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function ChipList({ options, value, onSelect }) {
  return (
    <div className="flex max-w-[560px] flex-wrap justify-center gap-2.5" role="group">
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={
              isSelected
                ? 'min-h-11 rounded-full border border-[#6f66ec] bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e5e4f4] px-[18px] text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]'
                : 'min-h-11 rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-[18px] text-sm text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] hover:border-[#8a8a8e] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]'
            }
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
    <div className="grid justify-items-center gap-2 text-center">
      <h1 className="m-0 max-w-[20ch] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(26px,3.4vw,34px)] font-medium tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{title}</h1>
      {subtitle && <p className="m-0 max-w-[46ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>}
    </div>
  )
}
