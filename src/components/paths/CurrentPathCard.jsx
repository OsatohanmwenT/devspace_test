import { currentPath } from '../../data/paths'

export function CurrentPathCard({ onOpenDetail }) {
  const nextLesson = currentPath.cards.flatMap((region) => region.lessons).find((lesson) => lesson.state === 'current')

  return (
    <section aria-labelledby="my-learning-title">
      <article className="flex items-center justify-between gap-6 rounded-2xl border border-[#404040] bg-[#1f1f1f] px-6 py-5 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white max-[720px]:items-start max-[720px]:flex-col max-[720px]:px-5">
        <div className="min-w-0">
          <h2 id="my-learning-title" className="text-[22px] font-medium tracking-[-.04em] text-[#f4f4f2] font-['Space_Grotesk',Arial,sans-serif] [[data-theme=light]_&]:text-[#202020]">{currentPath.title}</h2>
          <p className="mt-1 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{currentPath.progressValue}% complete <span aria-hidden="true">·</span> Next: {nextLesson?.title}</p>
        </div>
        <button className="min-h-11 flex-none rounded-xl border border-[#7c6ff1] bg-[#513deb] px-5 text-sm font-bold text-white shadow-[0_4px_0_#19079b] transition-[background,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#624ff0] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 max-[720px]:w-full" aria-label={'Continue ' + nextLesson?.title} onClick={onOpenDetail}>Continue <span aria-hidden="true">→</span></button>
      </article>
    </section>
  )
}
