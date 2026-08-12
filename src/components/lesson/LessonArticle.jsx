import { RichText } from './RichText'

export function LessonArticle({ article }) {
  return (
    <article
      className="h-full overflow-auto bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white"
      aria-labelledby="lesson-article-title"
    >
      <div className="max-w-[62ch] mx-auto pt-[clamp(24px,4vw,48px)] px-7 pb-10 max-[720px]:pt-6 max-[720px]:px-5 max-[720px]:pb-9">
        <h1
          id="lesson-article-title"
          className="m-0 mb-2.5 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-[clamp(26px,2.8vw,34px)] max-[720px]:text-[25px] font-semibold leading-[1.16]"
        >
          {article.title}
        </h1>
        <p className="m-0 max-w-[60ch] text-[17px] leading-[1.55] text-[var(--text-secondary)] max-[720px]:text-base">
          {article.intro}
        </p>

        {article.video && (
          <div className="relative flex overflow-hidden flex-col items-center justify-center gap-6 mt-[22px] rounded-[20px] bg-[var(--surface-default)] px-6 py-10 aspect-[16/9] max-w-[62ch] text-center">
            <div className="grid gap-2">
              <h2 className="m-0 text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-[clamp(22px,3vw,30px)] font-semibold">{article.video.title}</h2>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{article.video.subtitle}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                className="grid size-16 place-items-center rounded-full border-0 bg-[var(--accent-data)] text-[var(--surface-canvas)] shadow-[var(--shadow-raised)] transition-transform duration-[var(--duration-fast)] hover:scale-[1.06]"
                aria-label={`Play: ${article.video.title}`}
              >
                <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
              </button>
              {article.video.badgeLabel && (
                <span
                  className="absolute -right-1.5 -bottom-1.5 grid w-[26px] h-[26px] place-items-center border-2 border-[var(--surface-canvas)] rounded-full bg-[var(--border-interactive)] text-white text-[10px] font-bold tracking-[0.02em]"
                  aria-hidden="true"
                >
                  {article.video.badgeLabel}
                </span>
              )}
            </div>
            <span className="absolute right-4 top-3.5 rounded-md bg-[var(--surface-overlay)] px-2 py-[3px] text-xs font-semibold text-[var(--text-primary)]">{article.video.duration}</span>
            <img className="absolute left-[18px] bottom-3.5 h-[14px] w-auto opacity-50" src="/assets/logo.svg" alt="" />
          </div>
        )}

        {article.sections.map((section) => (
          <section className="max-w-[62ch] mt-[26px] max-[720px]:mt-6" key={section.title}>
            <h2 className="m-0 mb-2 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-xl font-semibold">{section.title}</h2>
            <p className="m-0 text-[17px] leading-[1.6] text-[var(--text-secondary)] max-[720px]:text-base"><RichText content={section.body} /></p>
          </section>
        ))}

        {article.diagram && (
          <section className="max-w-[62ch] mt-[26px] max-[720px]:mt-6">
            <h2 className="m-0 mb-2 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-xl font-semibold">{article.diagram.title}</h2>
            <p className="m-0 text-[17px] leading-[1.6] text-[var(--text-secondary)] max-[720px]:text-base">{article.diagram.body}</p>
            <div
              className="flex items-center flex-wrap gap-2 mt-3.5 border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] rounded-xl bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--surface-subtle)] p-3.5"
              role="img"
              aria-label={article.diagram.label}
            >
              {article.diagram.nodes.map((node, index) => (
                <div className="flex items-center gap-2" key={node}>
                  <span className="border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] rounded-lg bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white px-2.5 py-2 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] text-[13px] font-semibold">{node}</span>
                  {index < article.diagram.nodes.length - 1 && <i className="text-[var(--brand-cta)] text-[17px] not-italic" aria-hidden="true">→</i>}
                </div>
              ))}
            </div>
          </section>
        )}

        {article.example && (
          <section className="max-w-[62ch] mt-[26px] max-[720px]:mt-6">
            <h2 className="m-0 mb-2 text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-xl font-semibold">{article.example.title}</h2>
            <p className="m-0 text-[17px] leading-[1.6] text-[var(--text-secondary)] max-[720px]:text-base">{article.example.body}</p>
            <pre className="mt-3.5 overflow-auto rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-canvas)] px-[18px] py-4 font-[var(--font-code)] text-sm leading-[1.7] text-[var(--text-primary)]"><code>{article.example.code}</code></pre>
          </section>
        )}

        {article.next && (
          <aside className="grid gap-1.5 max-w-[62ch] mt-7 border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] rounded-[14px] bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--surface-subtle)] px-[18px] py-4">
            <span className="block text-[var(--brand-cta)] text-xs font-bold tracking-[0.08em] uppercase">Up next</span>
            <strong className="text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] font-['Rethink_Sans',Arial,sans-serif] text-xl">{article.next.title}</strong>
            <p className="m-0 leading-[1.55] text-[var(--text-secondary)]">{article.next.body}</p>
          </aside>
        )}
      </div>
    </article>
  )
}
