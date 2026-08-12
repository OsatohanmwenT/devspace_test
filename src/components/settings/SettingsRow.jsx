export function SettingsRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--border-hairline)] pt-4 first:border-t-0 first:pt-0">
      <div className="grid gap-0.5">
        <strong className="text-base font-medium text-[var(--text-primary)]">{label}</strong>
        {description && <span className="meta-copy">{description}</span>}
      </div>
      <div className="flex-none">{children}</div>
    </div>
  )
}
