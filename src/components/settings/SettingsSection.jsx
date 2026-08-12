export function SettingsSection({ id, title, description, children }) {
  return (
    <section
      id={id}
      className="surface-card scroll-mt-8 grid gap-5 p-6 max-[680px]:p-5"
      aria-labelledby={`${id}-title`}
    >
      <div className="grid gap-1">
        <h2 id={`${id}-title`} className="m-0 font-[var(--font-display)] text-[var(--type-subheading)] font-semibold text-[var(--text-primary)]">{title}</h2>
        {description && <p className="meta-copy m-0">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}
