export const FAMILY_ACCENTS = {
  ml: 'bg-[var(--surface-brand-tint)]',
  data: 'bg-[var(--surface-data-tint)]',
  backend: 'bg-[var(--surface-devy-tint)]',
  security: 'bg-[var(--surface-success-tint)]',
}

export function ExplorePathCard({ path, onSelect }) {
  const family = FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend

  return (
    <article className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-[var(--shadow-raised)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--brand-cta)] focus-within:border-[var(--brand-cta)]">
      <button type="button" className="flex h-full w-full flex-col text-left" onClick={() => onSelect(path)} aria-label={`Open ${path.title} path`}>
        <div className={`grid min-h-40 place-items-center overflow-hidden ${family}`}>
          <img className="block h-32 w-[min(66%,180px)] object-contain" src={path.image} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col border-t border-[var(--border-hairline)] bg-[var(--surface-subtle)] p-[18px] max-[680px]:p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold tracking-[.08em] text-neutral-300 uppercase [[data-theme=light]_&]:text-[var(--border-interactive)]">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          {path.recommended && <span className="rounded-full bg-[var(--surface-brand-tint)] px-2 py-1 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">Recommended</span>}
        </div>
        <h3 className="mt-2 text-xl leading-[1.15] font-medium text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] [[data-theme=light]_&]:text-[var(--text-primary)] max-[680px]:text-lg">{path.title}</h3>
        <p className="mt-2 text-sm leading-[1.5] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{path.description}</p>
        <div className="mt-4 border-t border-[var(--border-default)] pt-3">
          <div className="flex flex-wrap gap-1.5">{path.tools.map((tool) => <span key={tool} className="rounded-full bg-[var(--surface-default)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">{tool}</span>)}</div>
        </div>
        </div>
      </button>
    </article>
  )
}

export function PathPreview({ path, onBack }) {
  return (
    <section className="grid gap-5" aria-labelledby="path-preview-title">
      <button className="min-h-11 justify-self-start py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:rounded focus-visible:outline-3 focus-visible:outline-[var(--brand-cta)] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-[var(--text-secondary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]" onClick={onBack}>← Back to paths</button>
      <article className="grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-[var(--shadow-raised)] md:grid-cols-[minmax(240px,38%)_minmax(0,1fr)]">
        <div className="grid min-h-56 place-items-center bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--surface-subtle)]"><img className="h-44 w-[min(78%,260px)] object-contain" src={path.image} alt="" /></div>
        <div className="grid content-center gap-3 p-[clamp(28px,5vw,60px)]">
          <span className="text-[11px] font-bold tracking-[.08em] text-[var(--brand-cta)] uppercase">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          <h1 id="path-preview-title" className="text-[clamp(32px,4vw,48px)] leading-[1.05] font-semibold text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] [[data-theme=light]_&]:text-[var(--text-primary)]">{path.title}</h1>
          <p className="max-w-[48ch] text-base leading-[1.55] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{path.reason}</p>
          <p className="text-sm text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{path.meta} · {path.tools.join(' · ')}</p>
          <p className="border-t border-[var(--border-default)] pt-4 text-sm text-[var(--text-muted)] [[data-theme=light]_&]:border-[var(--border-hairline)] [[data-theme=light]_&]:text-[var(--text-secondary)]">This path is coming soon. Its curriculum is not available to start yet.</p>
        </div>
      </article>
    </section>
  )
}
