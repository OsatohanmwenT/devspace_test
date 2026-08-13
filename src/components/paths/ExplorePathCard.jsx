export const FAMILY_ACCENTS = {
  ml: { accent: '#4169e1', soft: 'rgba(65,105,225,0.16)' },
  data: { accent: '#04adc0', soft: 'rgba(4,173,192,0.16)' },
  backend: { accent: '#88bdf2', soft: 'rgba(136, 189, 242,0.16)' },
  security: { accent: '#a9d94e', soft: 'rgba(169,217,78,0.16)' },
}

export function ExplorePathCard({ path, onSelect }) {
  const family = FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-[#404040] bg-[#1f1f1f] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[#4169e1] focus-within:border-[#4169e1] [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-none">
      <button type="button" className="flex h-full w-full flex-col text-left" onClick={() => onSelect(path)} aria-label={`Open ${path.title} path`}>
        <div className={`grid min-h-40 place-items-center overflow-hidden [[data-theme=light]_&]:bg-[color-mix(in_srgb,${family.soft}_70%,#fafaf8)]`}>
          <img className="block h-32 w-[min(66%,180px)] object-contain" src={path.image} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col border-t border-neutral-800 bg-neutral-800 p-[18px] [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] max-[680px]:p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold tracking-[.08em] text-neutral-300 uppercase [[data-theme=light]_&]:text-[#525252]">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          {path.recommended && <span className="rounded-full bg-[#4169e1]/15 px-2 py-1 text-[10px] font-bold tracking-[.06em] text-[#84a5ff] uppercase [[data-theme=light]_&]:text-[#4169e1]">Recommended</span>}
        </div>
        <h3 className="mt-2 text-xl leading-[1.15] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800 max-[680px]:text-lg">{path.title}</h3>
        <p className="mt-2 text-sm leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.description}</p>
        <div className="mt-4 border-t border-[#404040] pt-3 [[data-theme=light]_&]:border-[#dededb]">
          <div className="flex flex-wrap gap-1.5">{path.tools.map((tool) => <span key={tool} className="rounded-full bg-[#363636] px-2.5 py-1 text-[11px] text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f1efe9] [[data-theme=light]_&]:text-[#525252]">{tool}</span>)}</div>
        </div>
        </div>
      </button>
    </article>
  )
}

export function PathPreview({ path, onBack }) {
  return (
    <section className="grid gap-5" aria-labelledby="path-preview-title">
      <button className="min-h-11 justify-self-start py-2 text-[13px] text-[#9a9a9d] hover:text-[#f4f4f2] focus-visible:rounded focus-visible:outline-3 focus-visible:outline-[#4169e1] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-700" onClick={onBack}>← Back to paths</button>
      <article className="grid overflow-hidden rounded-2xl border border-[#404040] bg-[#1f1f1f] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_6px_rgba(20,20,20,0.06)] md:grid-cols-[minmax(240px,38%)_minmax(0,1fr)]">
        <div className="grid min-h-56 place-items-center bg-[#303030] [[data-theme=light]_&]:bg-[#f5f5f4]"><img className="h-44 w-[min(78%,260px)] object-contain" src={path.image} alt="" /></div>
        <div className="grid content-center gap-3 p-[clamp(28px,5vw,60px)]">
          <span className="text-[11px] font-bold tracking-[.08em] text-[#4169e1] uppercase">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          <h1 id="path-preview-title" className="text-[clamp(32px,4vw,48px)] leading-[1.05] font-semibold text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">{path.title}</h1>
          <p className="max-w-[48ch] text-base leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.reason}</p>
          <p className="text-sm text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">{path.meta} · {path.tools.join(' · ')}</p>
          <p className="border-t border-[#404040] pt-4 text-sm text-[#7d7d80] [[data-theme=light]_&]:border-[#eeeeeb] [[data-theme=light]_&]:text-[#737371]">This path is coming soon. Its curriculum is not available to start yet.</p>
        </div>
      </article>
    </section>
  )
}
