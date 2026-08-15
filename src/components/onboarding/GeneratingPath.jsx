import { useEffect, useState } from 'react'

const DEFAULT_LINES = [
  'Mapping what you already know…',
  'Ordering the concepts…',
  'Finding where practice fits…',
  'Preparing your starting point…',
]

export default function GeneratingPath({ lines = DEFAULT_LINES, lineIntervalMs = 780, durationMs = 3200, onDone }) {
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex((current) => Math.min(current + 1, lines.length - 1))
    }, lineIntervalMs)

    const finish = setTimeout(() => {
      clearInterval(lineTimer)
      onDone?.()
    }, durationMs)

    return () => {
      clearInterval(lineTimer)
      clearTimeout(finish)
    }
  }, [lines, lineIntervalMs, durationMs, onDone])

  return (
    <div className="grid w-full max-w-[420px] justify-items-center gap-1 self-center text-center" role="status" aria-live="polite">
      <img className="onb-devy-loading h-[104px] w-[104px] object-contain" src="/assets/devy.svg" alt="" />
      <h1 className="m-0 mt-4 font-rethink-sans text-[24px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Building your route</h1>
      <p className="m-0 mt-3 min-h-[22px] text-[15px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{lines[lineIndex]}</p>
      <span className="mt-2 flex items-center gap-1.5 text-[#8b7cf6]" aria-hidden="true">
        <i className="devy-thinking-dot size-1.5 rounded-full bg-current" />
        <i className="devy-thinking-dot size-1.5 rounded-full bg-current" />
        <i className="devy-thinking-dot size-1.5 rounded-full bg-current" />
      </span>
    </div>
  )
}
