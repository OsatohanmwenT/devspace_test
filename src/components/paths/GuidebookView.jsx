import { useEffect, useRef, useState } from 'react'
import { learningResources } from '../../data/learningResources'
import { SectionEyebrow } from './ReferenceIcons'

function GuidebookChapter({ topic, index, builtOnTopic, onJump }) {
  return (
    <article data-chapter={topic.id} className="grid scroll-mt-8 gap-6 border-t border-[#2c2c30] pt-7 first:border-t-0 first:pt-0 [[data-theme=light]_&]:border-[#ececea]">
      <header>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#88bdf2] [[data-theme=light]_&]:text-[#3d77eb]">Chapter {index + 1} · {topic.lessonTitle}</span>
        <h2 className="mt-1.5 mb-0 font-rethink-sans text-[clamp(21px,2.2vw,25px)] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{topic.title}</h2>
        {builtOnTopic && <p className="mt-2 mb-0 text-[14px] text-[#8c8c91] [[data-theme=light]_&]:text-[#767674]">Builds on <button type="button" onClick={() => onJump(builtOnTopic.id)} className="border-0 bg-transparent p-0 font-semibold text-[#88bdf2] underline underline-offset-2 hover:text-[#a8abf7]">{builtOnTopic.title}</button></p>}
      </header>
      <section><SectionEyebrow section="mentalModel" /><p className="m-0 max-w-[640px] text-[17px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.mentalModel}</p></section>
      <section>
        <SectionEyebrow section="example" />
        <p className="mb-3 max-w-[640px] text-[17px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.walkthrough}</p>
        <pre className="m-0 max-w-[700px] overflow-x-auto border-l-2 border-[#3f3b68] bg-[#1e1e1e] px-5 py-4 font-rubik text-[14.5px] leading-[1.75] text-[#f4f4f2]"><code>{topic.guidebook.code}</code></pre>
      </section>
      <section><SectionEyebrow section="why" /><p className="m-0 max-w-[640px] text-[17px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.why}</p></section>
      <section><SectionEyebrow section="mistakes" accent="text-[#c9a227] [[data-theme=light]_&]:text-[#8a6d10]" /><ul className="m-0 grid max-w-[640px] gap-2 pl-5 text-[16px] leading-[1.65] text-[#b2b2b6] marker:text-[#f0c964] [[data-theme=light]_&]:text-[#626262]">{topic.guidebook.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section>
      <aside className="max-w-[700px] border-l-2 border-[#6699ec] bg-[#211f30] px-5 py-4 [[data-theme=light]_&]:bg-[#eff4ff]"><strong className="block text-xs uppercase tracking-[0.08em] text-[#aaa7ff] [[data-theme=light]_&]:text-[#3d77eb]">Remember</strong><p className="mt-1.5 mb-0 max-w-[640px] text-[16px] leading-[1.65] text-[#d5d3ef] [[data-theme=light]_&]:text-[#37305e]">{topic.guidebook.takeaway}</p></aside>
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
    const handleKeyDown = (event) => { if (event.key === 'Escape') onBack() }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onBack])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || topics.length === 0) return undefined
    const updateActive = () => {
      const threshold = scroller.getBoundingClientRect().top + 96
      const current = [...scroller.querySelectorAll('[data-chapter]')].reduce((found, node) => (node.getBoundingClientRect().top <= threshold ? node : found), null)
      setActiveId(current?.dataset.chapter ?? topics[0].id)
    }
    updateActive()
    const observer = new IntersectionObserver(updateActive, { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] })
    scroller.querySelectorAll('[data-chapter]').forEach((node) => observer.observe(node))
    scroller.addEventListener('scroll', updateActive, { passive: true })
    return () => { observer.disconnect(); scroller.removeEventListener('scroll', updateActive) }
  }, [topics])

  const jumpTo = (topicId) => scrollRef.current?.querySelector(`[data-chapter="${topicId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="fixed inset-0 z-30 grid grid-rows-[64px_minmax(0,1fr)] overflow-hidden bg-[#121214] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#fafaf8] [[data-theme=light]_&]:text-neutral-800" aria-label={`${region.title} guidebook`}>
      <header className="flex items-center border-b border-[#404040] bg-[#1a1a1c] px-6 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white max-[680px]:px-3.5"><button type="button" className="min-h-11 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-[#b2b2b6] hover:bg-[#262629] hover:text-white focus-visible:outline-3 focus-visible:outline-[#88bdf2] focus-visible:outline-offset-2 [[data-theme=light]_&]:text-[#626262] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-700" onClick={onBack}><span aria-hidden="true">←</span> Back to {region.title}</button></header>
      <main ref={scrollRef} className="min-h-0 overflow-y-auto">
        <div className="mx-auto grid w-[min(100%,1320px)] grid-cols-[260px_minmax(0,1fr)] items-start gap-16 px-10 pt-10 pb-16 max-[1100px]:gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:px-6 max-[680px]:px-4 max-[680px]:pt-7 max-[680px]:pb-10">
          {topics.length > 0 && <nav className="sticky top-6 max-[900px]:static max-[900px]:hidden" aria-label="Chapters"><span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d7d80] [[data-theme=light]_&]:text-[#8a8a88]">Chapters</span><ul className="m-0 grid list-none gap-1 p-0">{topics.map((topic, index) => <li key={topic.id}><button type="button" onClick={() => jumpTo(topic.id)} aria-current={topic.id === activeId ? 'true' : undefined} className={`flex w-full origin-left scale-100 gap-2.5 border-l-2 py-2 pl-4 pr-2 text-left text-[15px] leading-[1.45] transition-[color,border-color,transform] duration-150 hover:scale-[1.03] ${topic.id === activeId ? 'border-[#6699ec] bg-[#1e1c2c] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-neutral-800' : 'border-[#2c2c30] text-[#8c8c91] hover:border-[#5a5a60] hover:text-[#d4d4d7] [[data-theme=light]_&]:border-[#e5e5e3] [[data-theme=light]_&]:text-[#767674] [[data-theme=light]_&]:hover:text-neutral-700'}`}><span className="tabular-nums opacity-60">{index + 1}</span>{topic.title}</button></li>)}</ul></nav>}
          <div className={`min-w-0 ${topics.length > 0 ? '[grid-column:2/3]' : '[grid-column:1/-1]'} max-[900px]:[grid-column:1/-1]`}>
            <header className="mb-10 flex items-start gap-5">{region.image && <img className="size-20 flex-none object-contain max-[680px]:size-14" src={region.image} alt="" />}<div className="min-w-0"><span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#88bdf2] [[data-theme=light]_&]:text-[#3d77eb]">Guidebook · {region.level}</span><h1 ref={headingRef} tabIndex="-1" className="mt-1.5 mb-2 font-rethink-sans text-[clamp(26px,3.6vw,34px)] font-semibold leading-[1.1] outline-none">{region.title}</h1><p className="m-0 text-[15px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{topics.length > 0 ? `${topics.length} chapters explaining how these ideas work.` : region.summary}</p></div></header>
            {topics.length === 0 ? <div className="mx-auto grid max-w-[440px] justify-items-center gap-3 rounded-2xl border border-dashed border-[#404040] px-8 py-16 text-center [[data-theme=light]_&]:border-[#d8d8d4]"><img className="size-16 object-contain opacity-70" src="/assets/devy.svg" alt="" /><p className="m-0 max-w-[36ch] text-[17px] font-medium leading-[1.5] text-[#d4d4d7] [[data-theme=light]_&]:text-[#3d3d3d]">No chapters here yet</p><p className="m-0 max-w-[34ch] text-[14.5px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">This region's lesson is ready — reference chapters like this arrive once its content is written up in depth.</p></div> : <div className="grid gap-7">{topics.map((topic, index) => <GuidebookChapter key={topic.id} topic={topic} index={index} builtOnTopic={topics.find((item) => item.id === topic.guidebook.builtOn)} onJump={jumpTo} />)}</div>}
          </div>
        </div>
      </main>
    </section>
  )
}
