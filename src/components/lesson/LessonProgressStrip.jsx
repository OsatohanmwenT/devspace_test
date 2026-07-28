export function LessonProgressStrip() {
  return (
    <div className="lesson-shell-navigation" aria-label="Lesson navigation">
      <button type="button" disabled aria-label="Previous lesson step">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="lesson-shell-progress" role="img" aria-label="Lesson progress: step 1 of 12">
        {Array.from({ length: 12 }, (_, index) => <span className={index === 0 ? 'is-active' : ''} key={index} />)}
      </div>
      <button type="button" disabled aria-label="Next lesson step">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  )
}
