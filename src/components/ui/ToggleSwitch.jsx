export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="relative grid h-11 w-14 place-items-center rounded-[var(--radius-control)] border-0 bg-transparent"
      onClick={() => onChange(!checked)}
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-[var(--brand-cta)]' : 'bg-[var(--border-interactive)]'}`} aria-hidden="true">
        <span className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
      <span className="sr-only">{label}</span>
    </button>
  )
}
