export function SettingsSection({ id, title, description, children }) {
  return (
    <section className="settings-section panel" aria-labelledby={`${id}-title`}>
      <div className="settings-section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="settings-section-body">{children}</div>
    </section>
  )
}
