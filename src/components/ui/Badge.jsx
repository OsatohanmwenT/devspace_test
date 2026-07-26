export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex rounded-full bg-[var(--badge-bg)] px-[11px] py-1 text-[11px] font-medium capitalize text-[var(--badge-text)] ${className}`}>
      {children}
    </span>
  )
}
