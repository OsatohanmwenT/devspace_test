export function LessonTopBar({ onClose, center, right }) {
  return (
    <header className="lesson-topbar">
      <button type="button" className="lesson-close-button" onClick={onClose} aria-label="Exit lesson">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
      <div className="lesson-topbar-center">{center}</div>
      <div className="lesson-topbar-right">{right}</div>
    </header>
  )
}

