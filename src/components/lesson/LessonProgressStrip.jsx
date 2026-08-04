const navButtonClassName = "grid w-9 h-9 max-[720px]:w-[34px] place-items-center border-0 bg-transparent text-[#89898e] [[data-theme=light]_&]:text-[#aaa] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]"

export function LessonProgressStrip({ currentStep = 1, totalSteps = 2, onPrevious, onNext, streaking = false }) {
  const filledClassName = streaking ? 'h-2 rounded bg-[#f0c964]' : 'h-2 rounded bg-[#2986f2]'

  return (
    <div
      className="grid grid-cols-[36px_minmax(0,520px)_36px] max-[720px]:grid-cols-[34px_minmax(0,1fr)_34px] items-center justify-self-center gap-3.5 max-[720px]:gap-1.5 w-[min(100%,600px)] text-[#89898e] [[data-theme=light]_&]:text-[#aaa]"
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
            className={index < currentStep ? filledClassName : 'h-2 rounded bg-[#404040] [[data-theme=light]_&]:bg-[#e1e1e1]'}
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

