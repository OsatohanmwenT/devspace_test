export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative h-6 w-11 rounded-full bg-(--progress-track-bg) transition-colors focus-visible:outline-3 focus-visible:outline-(--focus) focus-visible:outline-offset-3 ${checked ? 'bg-(--accent)' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      <span className="sr-only">{label}</span>
    </button>
  )
}

