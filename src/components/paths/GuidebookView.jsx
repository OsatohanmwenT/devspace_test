import { useEffect, useRef, useState } from 'react'
import { learningResources } from '../../data/learningResources'
import { SectionEyebrow } from './ReferenceIcons'

function GuidebookChapter({ topic, index, builtOnTopic, onJump }) {
  return (
    <article
      data-chapter={topic.id}
      className="grid scroll-mt-8 gap-6 border-t border-[var(--surface-raised)] pt-7 first:border-t-0 first:pt-0 [[data-theme=light]_&]:border-[var(--border-hairline)]"
    >
      <header>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--border-focus)] [[data-theme=light]_&]:text-[var(--brand-cta)]">Chapter {index + 1} · {topic.lessonTitle}</span>
        <h2 className="mt-1.5 mb-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(21px,2.2vw,25px)] font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{topic.title}</h2>
        {/* The chapters form a strict chain, so say what this one rests on. */}
        {builtOnTopic && (
          <p className="mt-2 mb-0 text-[14px] text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
            Builds on{' '}
            <button
              type="button"
              onClick={() => onJump(builtOnTopic.id)}
              className="border-0 bg-transparent p-0 font-semibold text-[var(--brand-on-dark)] underline underline-offset-2 hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] [[data-theme=light]_&]:text-[var(--brand-base)]"
            >
              {builtOnTopic.title}
            </button>
          </p>
        )}
      </header>

      <section>
        <SectionEyebrow section="mentalModel" />
        <p className="m-0 max-w-[640px] text-[17px] leading-[1.7] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">{topic.guidebook.mentalModel}</p>
      </section>

      <section>
        <SectionEyebrow section="example" />
        <p className="mb-3 max-w-[640px] text-[17px] leading-[1.7] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">{topic.guidebook.walkthrough}</p>
        <pre className="m-0 max-w-[700px] overflow-x-auto border-l-2 border-[var(--brand-cta)] bg-[var(--surface-default)] px-5 py-4 font-[var(--font-code)] text-[14.5px] leading-[1.75] text-[var(--text-primary)]"><code>{topic.guidebook.code}</code></pre>
      </section>

      <section>
        <SectionEyebrow section="why" />
        <p className="m-0 max-w-[640px] text-[17px] leading-[1.7] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--border-interactive)]">{topic.guidebook.why}</p>
      </section>

      <section>
        <SectionEyebrow section="mistakes" accent="text-[var(--accent-progress)]" />
        <ul className="m-0 grid max-w-[640px] gap-2 pl-5 text-[16px] leading-[1.65] text-[var(--text-secondary)] marker:text-[var(--accent-progress)] [[data-theme=light]_&]:text-[var(--border-interactive)]">
          {topic.guidebook.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
        </ul>
      </section>

      <aside className="max-w-[700px] border-l-2 border-[var(--brand-cta)] bg-[var(--surface-brand-tint)] px-5 py-4">
        <strong className="block text-xs uppercase tracking-[0.08em] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">Remember</strong>
        <p className="mb-0 mt-1.5 max-w-[640px] text-[16px] leading-[1.65] text-[var(--text-primary)]">{topic.guidebook.takeaway}</p>
      </aside>
    </article>
  )
}

export function GuidebookView({ region, onBack }) {
  const headingRef = useRef(null)
  const scrollRef = useRef(null)
  const topics = learningResources[region.id]?.topics ?? []
  const [activeId, setActiveId] = useState(topics[0]?.id ?? null)

  useEffect(() => {
    headingRef.current?.focus()
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onBack])

  // The last chapter whose start has passed the top of the viewport is the one
  // being read. Driven by IntersectionObserver rather than scroll events so it
  // also tracks programmatic and smooth scrolling.
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || topics.length === 0) return undefined

    const updateActive = () => {
      const threshold = scroller.getBoundingClientRect().top + 96
      const current = [...scroller.querySelectorAll('[data-chapter]')].reduce(
        (found, node) => (node.getBoundingClientRect().top <= threshold ? node : found),
        null,
      )
      setActiveId(current?.dataset.chapter ?? topics[0].id)
    }

    updateActive()
    const observer = new IntersectionObserver(updateActive, {
      root: scroller,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    })
    scroller.querySelectorAll('[data-chapter]').forEach((node) => observer.observe(node))

    scroller.addEventListener('scroll', updateActive, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', updateActive)
    }
  }, [topics])

  const jumpTo = (topicId) => {
    scrollRef.current
      ?.querySelector(`[data-chapter="${topicId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="fixed inset-0 z-30 grid grid-rows-[64px_minmax(0,1fr)] overflow-hidden bg-[var(--surface-canvas)] text-[var(--text-primary)] [[data-theme=light]_&]:bg-[var(--surface-canvas)] [[data-theme=light]_&]:text-[var(--text-primary)]" aria-label={`${region.title} guidebook`}>
      <header className="flex items-center border-b border-[var(--border-default)] bg-[var(--surface-default)] px-6 max-[680px]:px-3.5">
        <button
          type="button"
          className="min-h-11 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-white focus-visible:outline-3 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2 [[data-theme=light]_&]:text-[var(--border-interactive)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] [[data-theme=light]_&]:hover:text-[var(--text-primary)]"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span> Back to {region.title}
        </button>
      </header>

      <main ref={scrollRef} className="min-h-0 overflow-y-auto">
        <div className="mx-auto grid w-[min(100%,1320px)] grid-cols-[260px_minmax(0,1fr)] items-start gap-16 px-10 pt-10 pb-16 max-[1100px]:gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:px-6 max-[680px]:px-4 max-[680px]:pt-7 max-[680px]:pb-10">
          {topics.length > 0 && (
            <nav className="sticky top-6 max-[900px]:static max-[900px]:hidden" aria-label="Chapters">
              <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Chapters</span>
              <ul className="m-0 grid list-none gap-1 p-0">
                {topics.map((topic, index) => {
                  const isActive = topic.id === activeId
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => jumpTo(topic.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex w-full gap-2.5 border-l-2 py-2 pl-4 pr-2 text-left text-[15px] leading-[1.45] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--border-focus)] ${
                          isActive
                            ? 'border-[var(--brand-cta)] bg-[var(--surface-brand-tint)] font-semibold text-[var(--text-primary)]'
                            : 'border-[var(--border-hairline)] text-[var(--text-muted)] hover:border-[var(--border-interactive)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="tabular-nums opacity-60">{index + 1}</span>
                        {topic.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          <div className={`min-w-0 ${topics.length > 0 ? '[grid-column:2/3]' : '[grid-column:1/-1]'} max-[900px]:[grid-column:1/-1]`}>
            {/* Compact header — the region's rationale and goals live on the
                path detail page, where they orient rather than delay. */}
            <header className="mb-10 flex items-start gap-5">
              {region.image && <img className="size-20 flex-none object-contain max-[680px]:size-14" src={region.image} alt="" />}
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--border-focus)] [[data-theme=light]_&]:text-[var(--brand-cta)]">Guidebook · {region.level}</span>
                <h1 ref={headingRef} tabIndex="-1" className="mt-1.5 mb-2 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(26px,3.6vw,34px)] font-semibold leading-[1.1] outline-none">{region.title}</h1>
                <p className="m-0 text-[15px] leading-[1.6] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
                  {topics.length > 0 ? `${topics.length} chapters explaining how these ideas work.` : region.summary}
                </p>
              </div>
            </header>

            {topics.length === 0 ? (
              <div className="mx-auto grid max-w-[440px] justify-items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--border-default)] px-8 py-16 text-center">
                <img className="size-16 object-contain opacity-70" src="/assets/devy.svg" alt="" />
                <p className="m-0 max-w-[36ch] text-[17px] font-medium leading-[1.5] text-[var(--text-secondary)]">
                  No chapters here yet
                </p>
                <p className="m-0 max-w-[34ch] text-[14.5px] leading-[1.6] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
                  This region's lesson is ready — reference chapters like this arrive once its content is written up in depth.
                </p>
              </div>
            ) : (
              <div className="grid gap-7">
                {topics.map((topic, index) => (
                  <GuidebookChapter
                    key={topic.id}
                    topic={topic}
                    index={index}
                    builtOnTopic={topics.find((item) => item.id === topic.guidebook.builtOn)}
                    onJump={jumpTo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </section>
  )
}
