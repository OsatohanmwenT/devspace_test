// Prose authored as an array of segments so copy can carry inline code chips and
// emphasis. A plain string is still valid and renders as-is.
export function RichText({ content, className = '' }) {
  const segments = Array.isArray(content) ? content : [content]

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (typeof segment === 'string') return segment

        if (segment.code) {
          return (
            <code
              key={index}
              className="mx-[2px] rounded-md border border-[var(--border-default)] bg-[var(--surface-subtle)] px-1.5 py-0.5 font-[var(--font-code)] text-[.9em] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]"
            >
              {segment.code}
            </code>
          )
        }

        if (segment.strong) {
          return <strong key={index} className="font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{segment.strong}</strong>
        }

        return null
      })}
    </span>
  )
}
