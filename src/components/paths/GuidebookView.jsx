import { useState } from 'react'
import { getGuidebookEntries } from '../../data/guidebookEntries'
import { Drawer } from '../ui/Drawer'
import { ArrowLeftIcon } from '../ui/icons'

function GuidebookEntry({ entry, entries, onOpenEntry, onBack }) {
  return (
    <article className="mx-auto grid w-full max-w-[760px] gap-6">
      <header className="grid gap-4">
        <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-1 rounded-md border-0 bg-transparent p-0 text-xs font-semibold text-[#88bdf2] hover:text-[#a8cbf7] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb] [[data-theme=light]_&]:hover:text-[#1d4ed8]"><ArrowLeftIcon className="size-4" />All concepts</button>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#88bdf2] [[data-theme=light]_&]:text-[#3d77eb]">{entry.category}</span>
          <h3 className="mt-1.5 mb-0 font-rethink-sans text-[27px] font-semibold leading-[1.15] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.title}</h3>
        </div>
      </header>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">Definition</p><p className="m-0 text-[17px] leading-[1.7] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.definition}</p></section>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">Mental model</p><p className="m-0 text-[16px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{entry.mentalModel}</p></section>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">Syntax</p><pre className="m-0 overflow-x-auto border-l-2 border-[#3f3b68] bg-[#1e1e1e] px-5 py-4 font-rubik text-[14px] leading-[1.75] text-[#f4f4f2]"><code>{entry.syntax}</code></pre></section>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">How it works</p><p className="m-0 text-[16px] leading-[1.7] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{entry.howItWorks}</p></section>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">When to use it</p><ul className="m-0 grid gap-2 pl-5 text-[15px] leading-[1.65] text-[#b2b2b6] marker:text-[#88bdf2] [[data-theme=light]_&]:text-[#626262]">{entry.whenToUse.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">Examples</p><div className="grid gap-5">{entry.examples.map((example) => <div key={example.title}><strong className="text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{example.title}</strong><pre className="mt-2 mb-2 overflow-x-auto border-l-2 border-[#3f3b68] bg-[#1e1e1e] px-5 py-4 font-rubik text-[14px] leading-[1.75] text-[#f4f4f2]"><code>{example.code}</code></pre><p className="m-0 text-[15px] leading-[1.65] text-[#b2b2b6] [[data-theme=light]_&]:text-[#626262]">{example.explanation}</p></div>)}</div></section>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#c9a227] [[data-theme=light]_&]:text-[#8a6d10]">Common mistakes</p><ul className="m-0 grid gap-2 pl-5 text-[15px] leading-[1.65] text-[#b2b2b6] marker:text-[#f0c964] [[data-theme=light]_&]:text-[#626262]">{entry.mistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul></section>
      <aside className="border-l-2 border-[#6699ec] bg-[#211f30] px-5 py-4 [[data-theme=light]_&]:bg-[#eff4ff]"><strong className="block text-xs uppercase tracking-[0.08em] text-[#aaa7ff] [[data-theme=light]_&]:text-[#3d77eb]">Things to remember</strong><ul className="mt-2 mb-0 grid gap-1.5 pl-5 text-[15px] leading-[1.65] text-[#d5d3ef] marker:text-[#aaa7ff] [[data-theme=light]_&]:text-[#37305e]">{entry.remember.map((item) => <li key={item}>{item}</li>)}</ul></aside>
      <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#8c8c91] [[data-theme=light]_&]:text-[#686968]">Related concepts</p><div className="flex flex-wrap gap-2">{entry.related.map((relatedId) => { const relatedEntry = entries.find((item) => item.id === relatedId); return <button key={relatedId} type="button" onClick={() => onOpenEntry(relatedId)} className="rounded-lg border border-[#3f3b68] bg-[#211f30] px-3 py-2 text-sm font-semibold text-[#b8ccf7] hover:bg-[#292642] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:border-[#cbdcf3] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-[#2563eb]">{relatedEntry.title}</button> })}</div></section>
    </article>
  )
}

export function GuidebookView({ region, onBack }) {
  const entries = getGuidebookEntries(region.id)
  const [activeId, setActiveId] = useState(null)
  const activeEntry = entries.find((entry) => entry.id === activeId)
  const [query, setQuery] = useState('')
  const visibleEntries = entries.filter((entry) => `${entry.title} ${entry.category} ${entry.definition}`.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Drawer title="Guidebook" onClose={onBack} labelledBy="guidebook-title" placement="bottom" expandable compactHeader>
      {!activeEntry && <div className="mx-auto grid w-full max-w-[1040px] gap-7">
        <header><p className="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-[#88bdf2] [[data-theme=light]_&]:text-[#3d77eb]">Your reference book</p><h3 className="mt-1 mb-1 font-rethink-sans text-[26px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Find the idea you need</h3><p className="m-0 max-w-[62ch] text-[15px] leading-[1.55] text-[#aaa9b0] [[data-theme=light]_&]:text-[#626262]">Choose a concept for a clear explanation, example, and common pitfalls.</p></header>
        {entries.length === 0 ? <p className="m-0 max-w-[30ch] pt-8 text-[15px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Nothing to study here yet — this section's guidebook arrives with its lessons.</p> : <><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Python concepts" aria-label="Search Python concepts" className="min-h-12 w-full rounded-xl border border-[#404040] bg-transparent px-4 text-[15px] text-[#f4f4f2] outline-none placeholder:text-[#85838c] focus:border-[#88bdf2] [[data-theme=light]_&]:border-[#d8d8d4] [[data-theme=light]_&]:text-neutral-800" /><nav aria-label={`${region.title} concepts`}><span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#7d7d80] [[data-theme=light]_&]:text-[#8a8a88]">{visibleEntries.length} of {entries.length} concepts</span>{visibleEntries.length === 0 ? <p className="m-0 text-[15px] text-[#9a9a9d]">No concepts match that search.</p> : <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">{visibleEntries.map((entry) => <li key={entry.id}><button type="button" onClick={() => setActiveId(entry.id)} className="grid min-h-[150px] w-full content-between rounded-xl border border-[#2c2c30] bg-[#1c1c1f] p-4 text-left transition-colors hover:border-[#55505f] hover:bg-[#24212e] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:border-[#e4e4e0] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:hover:border-[#cbdcf3] [[data-theme=light]_&]:hover:bg-[#f6f9fe]"><span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#85838c] [[data-theme=light]_&]:text-[#777774]">{entry.category}</span><span><span className="block text-[18px] font-semibold leading-[1.25] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{entry.title}</span><span className="mt-2 block text-[14px] leading-[1.5] text-[#aaa9b0] [[data-theme=light]_&]:text-[#626262]">{entry.definition}</span></span></button></li>)}</ul>}</nav></>}
      </div>}
      {activeEntry && <GuidebookEntry entry={activeEntry} entries={entries} onOpenEntry={setActiveId} onBack={() => setActiveId(null)} />}
    </Drawer>
  )
}
