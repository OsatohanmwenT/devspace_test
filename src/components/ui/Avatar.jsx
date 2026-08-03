const PALETTE = ['#6f66ec', '#04adc0', '#e08a3c', '#7fb069', '#e0607e', '#5fb8ff']
const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-10 text-[15px]',
  lg: 'size-14 text-xl',
}

function colorForName(name) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

export function Avatar({ name, size = 'md', className = '' }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-['Space_Grotesk',Arial,sans-serif] font-semibold text-white ${SIZES[size] ?? SIZES.md} ${className}`} style={{ background: colorForName(name ?? '') }} aria-hidden="true">
      {initial}
    </span>
  )
}


