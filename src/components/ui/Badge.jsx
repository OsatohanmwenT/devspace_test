export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex rounded-full bg-[rgba(111,102,236,0.22)] [[data-theme=light]_&]:bg-[#dde8f7] px-[11px] py-1 text-[11px] font-medium capitalize text-[#d8d3ff] [[data-theme=light]_&]:text-[#070c72] ${className}`}>
      {children}
    </span>
  )
}

