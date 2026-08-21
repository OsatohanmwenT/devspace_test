// Devy has three faces, and which one shows is a content decision rather than a
// decorative one. Neutral is the default companion; celebrating is reserved for
// something the learner actually earned; annoyed is Devy reacting to the
// situation — a stalled streak, a dead end, a question that deserves the blame —
// never to the learner. Keeping the three behind one component means a screen
// picks a mood, not a file path, and the entrance motion comes with it.
const SOURCES = {
  neutral: '/assets/devy.svg',
  celebrating: '/assets/devy-celebration.svg',
  annoyed: '/assets/devy-annoyed.svg',
}

// Each mood carries its own motion so a celebration reads as a celebration even
// with the sound off. Neutral stays still — the callers that want the existing
// idle float already pass `devy-idle` themselves.
const MOTION = {
  neutral: '',
  celebrating: 'devy-celebrate',
  annoyed: 'devy-annoyed',
}

export function DevyMood({ mood = 'neutral', className = '', animate = true, alt = '', ...rest }) {
  const motion = animate ? MOTION[mood] ?? '' : ''

  return (
    <img
      src={SOURCES[mood] ?? SOURCES.neutral}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      className={`object-contain ${motion} ${className}`.trim()}
      {...rest}
    />
  )
}
