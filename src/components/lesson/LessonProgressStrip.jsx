const navButtonClassName = "grid min-h-11 min-w-11 place-items-center border-0 bg-transparent text-[var(--text-muted)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-cta)]"

export function LessonProgressStrip({ currentStep = 1, totalSteps = 2, onPrevious, onNext, streaking = false }) {
  const filledClassName = streaking ? 'h-2 rounded bg-[var(--accent-progress)]' : 'h-2 rounded bg-[var(--brand-cta)]'

  return (
    <div
      className="grid w-[min(100%,600px)] grid-cols-[44px_minmax(0,520px)_44px] items-center justify-self-center gap-3.5 text-[var(--text-muted)] max-[720px]:gap-1.5"
      aria-label="Lesson navigation"
    >
      <button type="button" className={navButtonClassName} disabled={!onPrevious} onClick={onPrevious} aria-label="Previous lesson step">
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div
        className="grid gap-[5px] max-[720px]:gap-[3px]"
        role="img"
        aria-label={`Lesson progress: step ${currentStep} of ${totalSteps}`}
        style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            className={index < currentStep ? filledClassName : 'h-2 rounded bg-[var(--border-default)] [[data-theme=light]_&]:bg-[var(--border-default)]'}
            key={index}
          />
        ))}
      </div>
      <button type="button" className={navButtonClassName} disabled={!onNext} onClick={onNext} aria-label="Next lesson step">
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  )
}
