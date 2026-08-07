export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] ${checked ? 'bg-[#6f66ec]' : 'bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      <span className="sr-only">{label}</span>
    </button>
  )
}

