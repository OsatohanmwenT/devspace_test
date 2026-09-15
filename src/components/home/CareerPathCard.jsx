export function CareerPathCard({ currentPath, currentRegionCard, onOpenCareerPath, className = '' }) {
  return (
    <section className={`flex flex-col border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px] ${className}`}>
      <p className="m-0 text-[11px] font-semibold tracking-[0.1em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">CAREER PATH</p>
      <div className="mt-2.5 flex items-center gap-3">
        <img className="size-11 flex-none object-contain" src={currentPath.emblem} alt="" aria-hidden="true" />
        <div className="grid gap-0.5 min-w-0">
          <strong className="truncate text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-semibold">{currentPath.title}</strong>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{currentRegionCard.title} · {currentRegionCard.percent}%</span>
        </div>
      </div>
      <button
        type="button"
        className="mt-auto inline-flex items-center gap-1 self-start text-[13px] font-medium text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb] hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] rounded"
        onClick={onOpenCareerPath}
      >
        View path <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}
