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
              className="mx-[2px] rounded-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f2f2f0] px-1.5 py-0.5 font-rubik text-[.9em] text-[#c4d8f2] [[data-theme=light]_&]:text-[#07389b]"
            >
              {segment.code}
            </code>
          )
        }

        if (segment.strong) {
          return <strong key={index} className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{segment.strong}</strong>
        }

        return null
      })}
    </span>
  )
}
