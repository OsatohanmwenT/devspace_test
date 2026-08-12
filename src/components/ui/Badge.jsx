const TONES = {
  violet: 'bg-[rgba(102, 153, 236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] text-[#d3e2ff] [[data-theme=light]_&]:text-[#073c72]',
  blue: 'bg-[#2f6fed] text-white',
  teal: 'bg-[#04adc0] text-white',
  orange: 'bg-[#f5a623] text-white',
  pink: 'bg-[#e0507a] text-white',
}

export function Badge({ children, tone = 'violet', className = '' }) {
  return (
    <span className={`inline-flex rounded-full ${TONES[tone] ?? TONES.violet} px-[11px] py-1 text-[11px] font-medium capitalize ${className}`}>
      {children}
    </span>
  )
}
