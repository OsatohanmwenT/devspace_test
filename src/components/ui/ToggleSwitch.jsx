export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={checked ? 'toggle-switch active' : 'toggle-switch'}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch-knob" />
      <span className="visually-hidden">{label}</span>
    </button>
  )
}
