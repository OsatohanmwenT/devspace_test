// One achievement coin. The glyph says which ladder a badge belongs to; the
// coin itself says only earned or not — no numbers on the face, same as the
// home badge strip.
const GLYPHS = {
  streak: (
    <path d="M12 3c.5 3-2.5 4.5-2.5 8a2.5 2.5 0 0 0 5 0c0-1-.5-2-1-2.5 2 .5 4 2.8 4 5.5a5.5 5.5 0 0 1-11 0C6.5 8.5 11 7 12 3Z" fill="currentColor" />
  ),
  learning: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM13 4h5.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H13V4Z" fill="currentColor" />
  ),
  milestone: (
    <path d="M6 3.5v17M6 4.5h11l-2.75 4L17 12.5H6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  region: (
    <path d="m12 3 8.5 4.75L12 12.5 3.5 7.75 12 3Zm-8.5 9L12 16.75 20.5 12M3.5 16.25 12 21l8.5-4.75" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
  ),
  practice: (
    <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  ),
  xp: <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z" fill="currentColor" />,
  league: (
    <path d="M4 8.5 8 12l4-6.5 4 6.5 4-3.5-1.75 10H5.75L4 8.5Z" fill="currentColor" />
  ),
  podium: (
    <path d="M9 10h6v10H9V10Zm-6 4h6v6H3v-6Zm12 2h6v4h-6v-4ZM12 3l1 2.2 2.3.3-1.7 1.6.4 2.4L12 8.4 10 9.5l.4-2.4-1.7-1.6 2.3-.3L12 3Z" fill="currentColor" />
  ),
  profile: (
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5c.6-3.6 3.6-6 7.5-6s6.9 2.4 7.5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  ),
  links: (
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
  ),
}

function glyphFor(badge) {
  if (badge.id.startsWith('milestone')) return GLYPHS.milestone
  if (badge.id.startsWith('region')) return GLYPHS.region
  if (badge.id === 'season-reward') return GLYPHS.podium
  if (badge.id === 'profile-links') return GLYPHS.links
  return GLYPHS[badge.category] ?? GLYPHS.xp
}

export function BadgeCoin({ badge, size = 48, className = '' }) {
  return (
    <span
      className={`badge-coin ${className}`}
      data-earned={badge.earned}
      style={{ '--coin-size': `${size}px`, ...(badge.earned && badge.tint ? { '--coin': badge.tint } : null) }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none">{glyphFor(badge)}</svg>
    </span>
  )
}
