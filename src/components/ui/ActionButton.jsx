const variants = {
  primary: 'border border-[var(--brand-cta)] bg-[var(--brand-cta)] text-[var(--text-inverse)] shadow-[var(--shadow-cta)] hover:bg-[var(--brand-hover)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
  secondary: 'border border-[var(--border-interactive)] bg-[var(--surface-default)] text-[var(--text-primary)] hover:border-[var(--brand-cta)] hover:text-[var(--brand-on-dark)]',
  quiet: 'border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]',
  danger: 'border border-[var(--accent-error)] bg-[var(--surface-error-tint)] text-[var(--accent-error)] hover:brightness-95',
}

export function ActionButton({ variant = 'primary', className = '', children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`relative min-h-11 rounded-[var(--radius-control)] px-4 font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-100 focus-visible:outline-3 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-3 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
