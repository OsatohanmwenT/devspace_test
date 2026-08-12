export function CurrentPathCard({ path, onOpenDetail }) {
  const currentPath = path
  const nextLesson = currentPath.cards.flatMap((region) => region.lessons).find((lesson) => lesson.state === 'current')

  return (
    <section aria-labelledby="my-learning-title">
      <article className="flex items-center justify-between gap-6 rounded-[var(--radius-card)] bg-[var(--surface-brand-tint)] px-6 py-6 max-[720px]:items-start max-[720px]:flex-col">
        <div className="min-w-0">
          <h2 id="my-learning-title" className="font-[var(--font-display)] text-[var(--type-subheading)] font-medium text-[var(--text-primary)]">{currentPath.title}</h2>
          <p className="meta-copy mt-1">{currentPath.progressValue}% complete <span aria-hidden="true">·</span> Next: {nextLesson?.title}</p>
        </div>
        <button className="min-h-11 flex-none rounded-[var(--radius-control)] border border-[var(--brand-cta)] bg-[var(--brand-cta)] px-5 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--shadow-cta)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none max-[720px]:w-full" aria-label={'Continue ' + nextLesson?.title} onClick={onOpenDetail}>Continue <span aria-hidden="true">→</span></button>
      </article>
    </section>
  )
}
