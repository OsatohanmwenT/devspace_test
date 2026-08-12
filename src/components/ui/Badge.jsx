const TONES = {
  brand: 'bg-[var(--surface-brand-tint)] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]',
  data: 'bg-[var(--surface-data-tint)] text-[var(--accent-data)]',
  progress: 'bg-[var(--surface-progress-tint)] text-[var(--accent-progress)]',
  devy: 'bg-[var(--surface-devy-tint)] text-[var(--accent-devy)]',
  success: 'bg-[var(--surface-success-tint)] text-[var(--accent-success)]',
  error: 'bg-[var(--surface-error-tint)] text-[var(--accent-error)]',
  neutral: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]',
}

export function Badge({ children, tone = 'brand', className = '' }) {
  return (
    <span className={`inline-flex rounded-full ${TONES[tone] ?? TONES.brand} px-3 py-1 text-[var(--type-label)] leading-[var(--leading-label)] font-medium capitalize ${className}`}>
      {children}
    </span>
  )
}
