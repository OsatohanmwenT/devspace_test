export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex rounded-full bg-[rgba(111,102,236,.22)] px-[11px] py-1 text-[11px] font-medium capitalize text-[#d8d3ff] ${className}`}>
      {children}
    </span>
  )
}
