export function BoltIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  )
}

export function GemIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h12l3 5-9 13L3 8l3-5Z" fill="currentColor" />
    </svg>
  )
}

export function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 13 5 5 9-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrophyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="currentColor" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 14v3M9 20h6M9.5 17h5l.5 3H9l.5-3Z" fill="currentColor" />
    </svg>
  )
}

export function ChecklistIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 7 2 2 3-3M11 7h9M4 13l2 2 3-3M11 13h9M4 19l2 2 3-3M11 19h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BookOpenIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 5.5A3.5 3.5 0 0 1 7 2h4.5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H7a3.5 3.5 0 0 0-3.5 3v-14.5ZM20.5 5.5A3.5 3.5 0 0 0 17 2h-2.5v15H17a3.5 3.5 0 0 1 3.5 3v-14.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LessonPedestalIcon({ state, checkpoint = false, selected = false, className = '' }) {
  const palette = {
    available: { base: '#35363b', rim: '#62636a', ring: '#c9c9cd', center: selected ? '#9f9dd7' : '#ececef', symbol: selected ? '#fff' : '#9f9dd7' },
    current: { base: '#20366d', rim: '#2d4993', ring: '#9f9dd7', center: '#565581', symbol: '#fff' },
    completed: { base: '#67658d', rim: '#9f9dd7', ring: '#c5c3eb', center: '#9f9dd7', symbol: '#172552' },
    locked: { base: '#292a2e', rim: '#4c4d52', ring: '#74757b', center: '#a4a5aa', symbol: '#4b4c51' },
  }[state]

  return (
    <svg
      className={`h-[134px] w-32 shrink-0 transition-transform duration-150 ${className}`}
      viewBox="0 0 128 134"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="64" cy="116" rx="45" ry="12" fill="#09090b" opacity=".72" />
      <path fill={palette.base} d="M22 90c0-13 19-24 42-24s42 11 42 24v21c0 13-19 23-42 23s-42-10-42-23V90Z" />
      <ellipse fill={palette.rim} cx="64" cy="90" rx="42" ry="24" />
      <ellipse fill={palette.ring} cx="64" cy="89" rx="31" ry="17" />
      <ellipse fill={palette.center} cx="64" cy="88" rx="21" ry="11" />

      {checkpoint && (
        <g fill={palette.symbol}>
          <path d="M64 57V30" stroke={palette.symbol} strokeWidth="5" strokeLinecap="round" />
          <path d="M67 31h24l-7 8 7 8H67V31Z" />
        </g>
      )}

      {state === 'completed' && (
        <path d="m54 87 7 7 15-16" stroke={palette.symbol} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {state === 'locked' && (
        <g fill={palette.symbol}>
          <rect x="55" y="82" width="18" height="15" rx="3" />
          <path d="M59 82v-4a5 5 0 0 1 10 0v4" stroke={palette.symbol} strokeWidth="4" />
        </g>
      )}
      {(state === 'current' || state === 'available') && (
        <circle cx="64" cy="88" r={state === 'current' ? 6 : 4} fill={palette.symbol} />
      )}
    </svg>
  )
}

