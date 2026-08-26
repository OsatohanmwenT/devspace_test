export function CurrentPathCard({ path, onOpenDetail }) {
  const currentPath = path
  const nextLesson = currentPath.cards.flatMap((region) => region.lessons).find((lesson) => lesson.state === 'current')

  return (
    <button type="button" aria-label={'Open ' + currentPath.title} onClick={onOpenDetail} className="flex h-full min-h-[164px] w-full flex-col items-start justify-between gap-5 rounded-2xl border border-[#404040] bg-[#1f1f1f] px-5 py-4 text-left transition-[border-color,background,transform] duration-150 hover:-translate-y-0.5 hover:border-[#525252] hover:bg-[#252525] focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-3 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] [[data-theme=light]_&]:hover:bg-[#fafafa]">
      <div className="flex w-full items-start justify-between gap-5">
        <div className="min-w-0">
          <h2 id="my-learning-title" className="text-[19px] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">{currentPath.title}</h2>
          <p className="mt-0.5 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{currentPath.progressValue}% complete <span aria-hidden="true">·</span> Next: {nextLesson?.title}</p>
        </div>
      </div>
      <span className="text-[13px] font-semibold text-[#8ee6ad] [[data-theme=light]_&]:text-[#168a46]">Open path</span>
    </button>
  )
}
