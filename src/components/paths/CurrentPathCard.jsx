import { currentPath, currentRegion } from '../../data/paths'

export function CurrentPathCard({ onOpenDetail }) {
  const nextLesson = currentPath.cards.flatMap((region) => region.lessons).find((lesson) => lesson.state === 'current')
  const completedRegions = currentPath.cards.filter((region) => region.state === 'completed').length

  return (
    <section className="w-full" aria-labelledby="my-learning-title">
      <article className="grid grid-cols-[minmax(0,1fr)_270px] overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white max-[720px]:grid-cols-1">
        <div className="grid gap-[26px] px-8 py-[30px] max-[720px]:gap-[22px] max-[720px]:px-5 max-[720px]:py-6">
          <div className="min-w-0">
            <span className="inline-block py-[3px] text-[10px] font-bold tracking-[.08em] text-[#4169e1] uppercase">Your active {currentPath.level.toLowerCase()}</span>
            <h2 id="my-learning-title" className="mt-[5px] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(24px,2.5vw,32px)] font-semibold tracking-[-.05em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{currentPath.title}</h2>
          </div>
          <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 max-[720px]:grid-cols-1 max-[720px]:gap-[18px]" aria-labelledby="current-region-title">
            <div className="grid min-w-0 gap-[6px]">
              <span className="text-[10px] font-bold tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] uppercase">Up next</span>
              <h3 id="current-region-title" className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-[21px] font-semibold tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{nextLesson?.title}</h3>
              {nextLesson?.description && <p className="m-[1px_0_0] max-w-[52ch] text-sm leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{nextLesson.description}</p>}
              <small className="text-[11px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{currentRegion.title} · {currentRegion.progress} complete</small>
            </div>
            <button className="min-h-[50px] min-w-[166px] self-center rounded-[12px] border border-[#7c6ff1] bg-[#513deb] px-5 text-sm font-bold text-white shadow-[0_4px_0_#19079b] transition-[background,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[#624ff0] active:translate-y-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 max-[720px]:w-full" aria-label={'Resume ' + nextLesson?.title} onClick={onOpenDetail}>Resume lesson <span aria-hidden="true">→</span></button>
          </section>
        </div>
        <aside className="grid content-center justify-items-center gap-[22px] border-l border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#303030] [[data-theme=light]_&]:bg-white px-6 py-[26px] max-[720px]:grid-cols-[auto_minmax(0,1fr)] max-[720px]:justify-items-start max-[720px]:border-t max-[720px]:border-l-0 max-[720px]:px-5 max-[720px]:py-[18px]" aria-label="Learning progress summary">
          <div className="grid size-24 place-items-center max-[720px]:size-16.5">
            <img className="size-24 object-contain max-[720px]:size-16.5" src={currentPath.emblem} alt="" />
          </div>
          <div className="grid w-full gap-2 max-[720px]:self-center">
            <div
              className="h-2 overflow-hidden rounded-full bg-[#525252] [[data-theme=light]_&]:bg-[#e5e6ea]"
              role="progressbar"
              aria-label={`${currentPath.title} progress`}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={currentPath.progressValue}
              aria-valuetext={`${currentPath.progressValue}% complete`}
            >
              <span className="block h-full rounded-full bg-[#4169e1]" style={{ width: `${currentPath.progressValue}%` }} />
            </div>
            <small className="text-center text-[11px] text-[#a3a3a3] [[data-theme=light]_&]:text-[#737371] max-[720px]:text-left">{completedRegions} of {currentPath.cards.length} regions completed · {currentPath.progressValue}% complete</small>
          </div>
        </aside>
      </article>
    </section>
  )
}
