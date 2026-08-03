// Literal colors extracted from the now-deleted `.path-family-*` CSS rules
// (--path-accent / --path-soft) — that field on each path was never read by
// any component, so every path silently rendered with no family accent at all.
// Applied here (card border/art tint) and in LearningPathDetail (eyebrow color).
export const FAMILY_ACCENTS = {
  ml: { accent: '#4169e1', soft: 'rgba(157,98,255,0.16)' },
  data: { accent: '#04adc0', soft: 'rgba(4,173,192,0.16)' },
  backend: { accent: '#888df2', soft: 'rgba(136,141,242,0.16)' },
  security: { accent: '#a9d94e', soft: 'rgba(169,217,78,0.16)' },
}

export function ExplorePathCard({ path, onSelect }) {
  const family = FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend

  return (
    <article
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
    >
      <div
        className={`grid min-h-44 place-items-center overflow-hidden [[data-theme=light]_&]:bg-[color-mix(in_srgb,${family.soft}_58%,#ffffff)] max-[900px]:min-h-[156px] max-[680px]:min-h-[164px]`}
      >
        <img className="block h-[150px] w-[min(78%,210px)] object-contain max-[900px]:h-[132px] max-[680px]:h-[138px]" src={path.image} alt="" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col border-t border-neutral-800 [[data-theme=light]_&]:border-[#e5e5e5] bg-neutral-800 [[data-theme=light]_&]:bg-[#f5f5f4] p-[18px] max-[680px]:p-4">
        <span className="text-[11px] font-bold tracking-[.08em] text-neutral-300 [[data-theme=light]_&]:text-[#525252] uppercase">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
        <h3 className="my-[6px] mb-2 font-['Space_Grotesk',Arial,sans-serif] text-xl leading-[1.15] font-medium tracking-[-.035em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] max-[680px]:text-lg">{path.title}</h3>
        <p className="mb-2.5 text-xs leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.reason}</p>
        {/* <div className="mt-2 flex items-center justify-between gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] pt-3">
          <span className="text-[11px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{path.meta}</span>
          <button className="whitespace-nowrap py-1 text-xs font-semibold text-neutral-100 transition-colors hover:text-white focus-visible:outline-3 focus-visible:outline-neutral-300 focus-visible:outline-offset-3" onClick={() => onSelect(path)}>
            {path.type === 'career' ? 'View path' : 'View skill'} <span aria-hidden="true">→</span>
          </button>
        </div> */}
      </div>
    </article>
  )
}

export function PathPreview({ path, onBack }) {
  const [level, curriculum] = path.meta.split(' · ')

  return (
    <section className="grid gap-3" aria-labelledby="path-preview-title">
      <button className="mb-[18px] min-h-11 justify-self-start bg-transparent py-2 text-[13px] text-[#9a9a9d] hover:text-[#f4f4f2] focus-visible:rounded focus-visible:outline-3 focus-visible:outline-[#9f9dd7] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-[#202020]" onClick={onBack}>← Back to paths</button>
      <article className="grid grid-cols-[minmax(240px,38%)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#2a2a2d] bg-[#1c1c21] max-[900px]:grid-cols-1 [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:bg-white">
        <div className="grid min-h-[360px] place-items-center bg-[#28282f] max-[900px]:min-h-[220px] [[data-theme=light]_&]:bg-[#f3f3f1]">
          <img className="h-60 w-[min(78%,280px)] object-contain max-[900px]:h-[180px]" src={path.image} alt="" />
        </div>
        <div className="grid content-center gap-3 p-[clamp(28px,5vw,60px)]">
          <span className="text-[11px] font-bold tracking-[.08em] text-[#4169e1] uppercase">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          <h1 id="path-preview-title" className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-[clamp(32px,4vw,48px)] leading-[1.05] font-semibold tracking-[-.055em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{path.title}</h1>
          <p className="m-0 max-w-[48ch] text-base leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.reason}</p>
          <dl className="mt-2.5 flex gap-7">
            <div className="grid gap-1"><dt className="text-[11px] font-bold tracking-[.08em] text-[#7d7d80] uppercase">Level</dt><dd className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{level}</dd></div>
            <div className="grid gap-1"><dt className="text-[11px] font-bold tracking-[.08em] text-[#7d7d80] uppercase">Curriculum</dt><dd className="m-0 text-[15px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{curriculum}</dd></div>
          </dl>
          <p className="border-t border-[#2a2a2d] pt-4 text-sm text-[#7d7d80] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:text-[#737371]">This path is coming soon. Its curriculum is not available to start yet.</p>
        </div>
      </article>
    </section>
  )
}
