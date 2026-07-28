const bushCount = 8

export function LessonSimulation({ progress = 0 }) {
  return (
    <div className="lesson-simulation" aria-hidden="true">
      <div className="lesson-simulation-bushes">
        {Array.from({ length: bushCount }, (_, index) => (
          <svg key={index} className="lesson-simulation-bush" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a4 4 0 0 1 4 4 4 4 0 0 1 3 6.6A4 4 0 0 1 15 20H9a4 4 0 0 1-4-6.4A4 4 0 0 1 8 7a4 4 0 0 1 4-4Z" fill="currentColor" />
          </svg>
        ))}
      </div>
      <div className="lesson-simulation-track">
        <button type="button" className="lesson-simulation-play-button" aria-label="Preview route" tabIndex={-1}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6v12l10-6L9 6Z" fill="currentColor" /></svg>
        </button>
        <span className="lesson-simulation-rail" />
        <span className="lesson-simulation-marker" style={{ left: `${progress}%` }} />
      </div>
    </div>
  )
}
