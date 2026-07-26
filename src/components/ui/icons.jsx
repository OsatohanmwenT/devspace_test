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

export function LessonPedestalIcon({ state, checkpoint = false, className = '' }) {
  return (
    <svg
      className={`lesson-pedestal lesson-pedestal-${state} ${className}`}
      viewBox="0 0 128 134"
      fill="none"
      aria-hidden="true"
    >
      <ellipse className="lesson-pedestal-shadow" cx="64" cy="116" rx="45" ry="12" />
      <path className="lesson-pedestal-base" d="M22 90c0-13 19-24 42-24s42 11 42 24v21c0 13-19 23-42 23s-42-10-42-23V90Z" />
      <ellipse className="lesson-pedestal-rim" cx="64" cy="90" rx="42" ry="24" />
      <ellipse className="lesson-pedestal-ring" cx="64" cy="89" rx="31" ry="17" />
      <ellipse className="lesson-pedestal-center" cx="64" cy="88" rx="21" ry="11" />

      {checkpoint && (
        <g className="lesson-pedestal-checkpoint">
          <path d="M64 57V30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M67 31h24l-7 8 7 8H67V31Z" fill="currentColor" />
        </g>
      )}

      {state === 'completed' && (
        <path className="lesson-pedestal-symbol" d="m54 87 7 7 15-16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {state === 'locked' && (
        <g className="lesson-pedestal-symbol">
          <rect x="55" y="82" width="18" height="15" rx="3" fill="currentColor" />
          <path d="M59 82v-4a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="4" />
        </g>
      )}
      {(state === 'current' || state === 'available') && (
        <circle className="lesson-pedestal-symbol" cx="64" cy="88" r={state === 'current' ? 6 : 4} fill="currentColor" />
      )}
    </svg>
  )
}
