import { useEffect, useState } from 'react'

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

// Words of plain text, plus code chips and emphasis kept whole, so a reply can
// be revealed a word at a time without ever splitting a chip.
function toTokens(content) {
  const segments = Array.isArray(content) ? content : [content]
  return segments.flatMap((segment) => (typeof segment === 'string' ? segment.split(/(?<=\s)/) : [segment]))
}

// Types a reply out word by word, then calls onDone. Reduced motion shows it
// all at once.
export function StreamedRichText({ content, className = '', onDone }) {
  const tokens = toTokens(content)
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [shown, setShown] = useState(reduce ? tokens.length : 0)

  useEffect(() => {
    if (shown >= tokens.length) {
      onDone?.()
      return undefined
    }
    const timer = window.setTimeout(() => setShown((count) => count + 1), 28)
    return () => window.clearTimeout(timer)
  }, [shown, tokens.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return <RichText content={tokens.slice(0, shown)} className={className} />
}
