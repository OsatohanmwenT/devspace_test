// Concept glyphs for reference surfaces. Practice's TopicIcon keys off language
// (Python/SQL/Git), which would stamp the same mark on every entry here — these
// key off the concept instead, so each entry is actually distinguishable.
const TOPIC_PATHS = {
  'program-execution': <path d="M12 4v13m0 0-4-4m4 4 4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  'variables-expressions': (
    <>
      <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  'assigning-updating-values': <path d="M5 9a7 7 0 0 1 12-2m2 6a7 7 0 0 1-12 2m0 0v-3m0 3h3M19 8V5m0 3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  'printing-reading-input': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7 10 2.5 2L7 14m5 0h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'comparisons-booleans': <path d="M5 9h14M5 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  'conditional-branches': (
    <>
      <path d="M7 5v6a3 3 0 0 0 3 3h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m14 11 3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
}

const FALLBACK = <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />

export function TopicGlyph({ topicId, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {TOPIC_PATHS[topicId] ?? FALLBACK}
    </svg>
  )
}

// The four guidebook sections, demoted from competing headings to quiet
// eyebrows — each one distinguishable at a glance by its mark.
export const GUIDEBOOK_SECTIONS = {
  mentalModel: {
    label: 'Mental model',
    icon: <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1h6c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />,
  },
  example: {
    label: 'Worked example',
    icon: <path d="m9 8-4 4 4 4m6-8 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  why: {
    label: 'Why this works',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </>
    ),
  },
  mistakes: {
    label: 'Watch out for',
    icon: (
      <>
        <path d="M12 4.5 2.8 20h18.4L12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </>
    ),
  },
}

export function SectionEyebrow({ section, accent = 'text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]' }) {
  const { label, icon } = GUIDEBOOK_SECTIONS[section]
  return (
    <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.09em] ${accent}`}>
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">{icon}</svg>
      {label}
    </div>
  )
}
