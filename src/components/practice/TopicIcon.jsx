// Per-topic marks for practice cards. The shared icon set has no subject icons,
// so these follow its 24x24 / currentColor convention.
const PATHS = {
  Python: (
    <>
      <path d="M4 8h5M4 8l3-3M4 8l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16h-5M20 16l-3-3M20 16l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  SQL: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="2" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" stroke="currentColor" strokeWidth="2" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  Git: (
    <>
      <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="18" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M7 8.5v7M9.5 17c3 0 5-1.4 5-3.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  Data: (
    <>
      <path d="M4 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="12" width="3" height="5" rx="1" fill="currentColor" />
      <rect x="12" y="8" width="3" height="9" rx="1" fill="currentColor" />
      <rect x="17" y="5" width="3" height="12" rx="1" fill="currentColor" />
    </>
  ),
  Theory: (
    <>
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 19h4M10.5 21.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
}

export function TopicIcon({ topic, className }) {
  const paths = PATHS[topic]
  if (!paths) return null

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths}
    </svg>
  )
}
