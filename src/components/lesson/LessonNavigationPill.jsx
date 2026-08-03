export function LessonNavigationPill() {
  return (
    <div
      className="grid grid-cols-[36px_auto_36px] items-center border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] rounded-[7px] overflow-hidden text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-xs font-semibold"
      aria-label="Lesson navigation"
    >
      <button
        type="button"
        className="grid w-9 h-8 place-items-center border-0 border-r border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#89898e] [[data-theme=light]_&]:text-[#aaa] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6f66ec]"
        disabled
        aria-label="Previous lesson step"
      >
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span className="min-w-[72px] text-center">Lesson</span>
      <button
        type="button"
        className="grid w-9 h-8 place-items-center border-0 border-l border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#89898e] [[data-theme=light]_&]:text-[#aaa] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#6f66ec]"
        disabled
        aria-label="Next lesson step"
      >
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  )
}

