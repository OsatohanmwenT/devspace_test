import { useEffect, useRef } from 'react'

const closeStarts = [43.068, 39.741, 36.414, 33.087, 29.76, 26.433, 23.105, 19.778, 16.451, 16.451, 19.778, 23.105, 26.433, 29.76, 33.087, 36.414, 39.741, 43.068]
const duration = 1200

export function PageWipe({ onCovered, onDone }) {
  const onCoveredRef = useRef(onCovered)
  const onDoneRef = useRef(onDone)

  onCoveredRef.current = onCovered
  onDoneRef.current = onDone

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onCoveredRef.current()
      onDoneRef.current()
      return undefined
    }

    const cover = window.setTimeout(() => onCoveredRef.current(), duration)
    const done = window.setTimeout(() => onDoneRef.current(), duration + 20)
    return () => {
      window.clearTimeout(cover)
      window.clearTimeout(done)
    }
  }, [])

  return (
    <div className="page-wipe" aria-hidden="true">
      {closeStarts.map((start, index) => (
        <span key={index} className="page-wipe-column" style={{ '--wipe-delay': `${(start / 100) * duration}ms`, '--wipe-duration': `${(1 - start / 100) * duration}ms` }} />
      ))}
    </div>
  )
}
