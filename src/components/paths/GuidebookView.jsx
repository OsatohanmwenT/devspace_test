import { useEffect, useRef, useState } from 'react'
import { learningResources } from '../../data/learningResources'
import { SectionEyebrow } from './ReferenceIcons'

function GuidebookChapter({ topic, index, registerRef }) {
  return (
    <article
      ref={(node) => registerRef(topic.id, node)}
      id={`chapter-${topic.id}`}
      className="grid scroll-mt-8 gap-6 border-t border-[#2c2c30] pt-10 first:border-t-0 first:pt-0 [[data-theme=light]_&]:border-[#ececea]"
    >
      <header>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888df2] [[data-theme=light]_&]:text-[#513deb]">Chapter {index + 1} · {topic.lessonTitle}</span>
        <h2 className="mt-1.5 mb-0 font-['Space_Grotesk',Arial,sans-serif] text-[clamp(24px,3vw,30px)] font-semibold tracking-[-0.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">{topic.title}</h2>
      </header>

      <section>
        <SectionEyebrow section="mentalModel" />
        <p className="m-0 text-[16px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.mentalModel}</p>
      </section>

      <section>
        <SectionEyebrow section="example" />
        <p className="mb-3 text-[16px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.walkthrough}</p>
        <pre className="m-0 overflow-x-auto rounded-xl border border-[#343438] bg-[#121214] px-5 py-4 font-['JetBrains_Mono',ui-monospace,monospace] text-sm leading-[1.75] text-[#f4f4f2]"><code>{topic.guidebook.code}</code></pre>
      </section>

      <section>
        <SectionEyebrow section="why" />
        <p className="m-0 text-[16px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.why}</p>
      </section>

      <section>
        <SectionEyebrow section="mistakes" accent="text-[#c9a227] [[data-theme=light]_&]:text-[#8a6d10]" />
        <ul className="m-0 grid gap-2 pl-5 text-[15px] leading-[1.6] text-[#b2b2b6] marker:text-[#f0c964] [[data-theme=light]_&]:text-[#626262]">
          {topic.guidebook.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
        </ul>
      </section>

      <aside className="rounded-xl border-l-2 border-[#6f66ec] bg-[#211f30] px-5 py-4 [[data-theme=light]_&]:bg-[#f1efff]">
        <strong className="block text-xs uppercase tracking-[0.08em] text-[#aaa7ff] [[data-theme=light]_&]:text-[#513deb]">Remember</strong>
        <p className="mt-1.5 mb-0 text-[15px] leading-[1.6] text-[#d5d3ef] [[data-theme=light]_&]:text-[#37305e]">{topic.guidebook.takeaway}</p>
      </aside>
    </article>
  )
}

export function GuidebookView({ region, onBack }) {
  const headingRef = useRef(null)
  const scrollRef = useRef(null)
  const chapterRefs = useRef({})
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

  // The chapter nearest the top of the viewport is the one being read.
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || topics.length === 0) return undefined

    const updateActive = () => {
      const top = scroller.getBoundingClientRect().top + 80
      const current = topics
        .map((topic) => ({ id: topic.id, node: chapterRefs.current[topic.id] }))
        .filter((entry) => entry.node)
        .reduce((closest, entry) => (
          entry.node.getBoundingClientRect().top <= top ? entry : closest
        ), null)

      setActiveId(current?.id ?? topics[0].id)
    }

    updateActive()
    scroller.addEventListener('scroll', updateActive, { passive: true })
    return () => scroller.removeEventListener('scroll', updateActive)
  }, [topics])

  const jumpTo = (topicId) => {
    chapterRefs.current[topicId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="fixed inset-0 z-30 grid grid-rows-[64px_minmax(0,1fr)] overflow-hidden bg-[#121214] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#fafaf8] [[data-theme=light]_&]:text-[#181818]" aria-label={`${region.title} guidebook`}>
      <header className="flex items-center border-b border-[#404040] bg-[#1a1a1c] px-6 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white max-[680px]:px-3.5">
        <button
          type="button"
          className="min-h-11 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-[#b2b2b6] hover:bg-[#262629] hover:text-white focus-visible:outline-3 focus-visible:outline-[#888df2] focus-visible:outline-offset-2 [[data-theme=light]_&]:text-[#626262] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-[#181818]"
          onClick={onBack}
        >
          <span aria-hidden="true">←</span> Back to {region.title}
        </button>
      </header>

      <main ref={scrollRef} className="min-h-0 overflow-y-auto">
        <div className="mx-auto grid w-[min(100%,1060px)] grid-cols-[210px_minmax(0,1fr)] items-start gap-14 px-6 pt-10 pb-16 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[680px]:px-4 max-[680px]:pt-7 max-[680px]:pb-10">
          {topics.length > 0 && (
            <nav className="sticky top-6 max-[900px]:static max-[900px]:hidden" aria-label="Chapters">
              <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#7d7d80] [[data-theme=light]_&]:text-[#8a8a88]">Chapters</span>
              <ul className="m-0 grid list-none gap-0.5 p-0">
                {topics.map((topic, index) => {
                  const isActive = topic.id === activeId
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => jumpTo(topic.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`w-full rounded-md border-l-2 py-1.5 pl-3 pr-2 text-left text-[13px] leading-[1.4] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#888df2] ${
                          isActive
                            ? 'border-[#6f66ec] bg-[#1e1c2c] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:bg-[#f1f0fd] [[data-theme=light]_&]:text-[#181818]'
                            : 'border-transparent text-[#8c8c91] hover:text-[#d4d4d7] [[data-theme=light]_&]:text-[#767674] [[data-theme=light]_&]:hover:text-[#181818]'
                        }`}
                      >
                        <span className="mr-1.5 tabular-nums opacity-60">{index + 1}</span>
                        {topic.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          <div className="min-w-0">
            {/* Compact header — the region's rationale and goals live on the
                path detail page, where they orient rather than delay. */}
            <header className="mb-10 flex items-start gap-5">
              {region.image && <img className="size-20 flex-none object-contain max-[680px]:size-14" src={region.image} alt="" />}
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#888df2] [[data-theme=light]_&]:text-[#513deb]">Guidebook · {region.level}</span>
                <h1 ref={headingRef} tabIndex="-1" className="mt-1.5 mb-2 font-['Space_Grotesk',Arial,sans-serif] text-[clamp(26px,3.6vw,34px)] font-semibold leading-[1.1] tracking-[-0.05em] outline-none">{region.title}</h1>
                <p className="m-0 text-[15px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                  {topics.length > 0 ? `${topics.length} chapters explaining how these ideas work.` : region.summary}
                </p>
              </div>
            </header>

            {topics.length === 0 ? (
              <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-[#404040] px-6 py-14 text-center [[data-theme=light]_&]:border-[#d8d8d4]">
                <img className="size-20 object-contain opacity-70" src="/assets/devy.svg" alt="" />
                <p className="m-0 max-w-[36ch] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                  No chapters here yet — they'll arrive as this section's lessons are written.
                </p>
              </div>
            ) : (
              <div className="grid gap-10">
                {topics.map((topic, index) => (
                  <GuidebookChapter
                    key={topic.id}
                    topic={topic}
                    index={index}
                    registerRef={(id, node) => { chapterRefs.current[id] = node }}
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
