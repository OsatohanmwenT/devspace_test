import { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { TopicGlyph } from './ReferenceIcons';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Clipboard can be blocked; the code is still selectable by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="absolute right-2.5 top-2.5 rounded-lg border border-[#333338] bg-[#232326] px-2.5 py-1 text-[11px] font-semibold text-[#b2b2b6] transition-colors hover:border-[#4a4a50] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#88bdf2]"
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Snippet({ code }) {
  return (
    <div className="relative">
      <pre className="m-0 overflow-x-auto rounded-xl border border-[#2c2c30] bg-[#1c1c1f] px-4 py-3.5 pr-16 font-rubik text-[14px] leading-[1.7] text-[#f4f4f2]"><code>{code}</code></pre>
      <CopyButton text={code} />
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Code first, prose second — you open a cheatsheet to see the shape of the
// syntax, not to read a paragraph about it. Rule and syntax are the one
// baseline every learner gets, unconditionally; personalization only ever
// adds framing on top (a mental-model line for beginners) or changes what
// starts open (examples, for anyone who's said they want depth or speed).
function CheatsheetEntry({ topic, personalization }) {
  return (
    <article className="grid gap-3 border-b border-[#2c2c30] pb-7 last:border-b-0 last:pb-0 [[data-theme=light]_&]:border-[#ececea]">
      <h3 className="m-0 flex items-center gap-2.5 font-rethink-sans text-[19px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        <span className="grid size-9 flex-none place-items-center rounded-xl bg-[#1c2a4d] text-[#88bdf2] [[data-theme=light]_&]:bg-[#f0f5fd] [[data-theme=light]_&]:text-[#2563eb]">
          <TopicGlyph topicId={topic.id} className="size-[18px]" />
        </span>
        {topic.title}
      </h3>

      {personalization?.wantsMentalModel && topic.guidebook?.mentalModel && (
        <p className="m-0 text-[14px] italic leading-[1.6] text-[#8b7cf6]">{topic.guidebook.mentalModel}</p>
      )}

      <Snippet code={topic.cheatsheet.syntax} />

      <p className="m-0 text-[14px] leading-[1.6] text-[#a8a8ac] [[data-theme=light]_&]:text-[#5c5c5c]">{topic.cheatsheet.rule}</p>

      <details className="group/details" open={personalization?.wantsExamplesUpFront}>
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg text-[13px] font-semibold text-[#88bdf2] marker:hidden hover:text-[#a8cbf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb] [[data-theme=light]_&]:hover:text-[#1d4ed8]">
          <ChevronIcon className="size-4 flex-none transition-transform group-open/details:rotate-180" />
          Example and common mistake
        </summary>
        <div className="grid gap-3 pt-3">
          <Snippet code={topic.cheatsheet.example} />
          <p className="m-0 flex gap-2.5 rounded-xl bg-[#2a2117] px-3.5 py-2.5 text-[14px] leading-[1.6] text-[#d6c9aa] [[data-theme=light]_&]:bg-[#fff8e9] [[data-theme=light]_&]:text-[#5e4b24]">
            <span aria-hidden="true">⚠️</span>
            {topic.cheatsheet.mistake}
          </p>
        </div>
      </details>
    </article>
  )
}

export function CheatsheetDrawer({ title, subtitle, topics, onClose, personalization }) {
  return (
    <Drawer title={title} subtitle={subtitle} onClose={onClose} labelledBy="cheatsheet-title">
      {topics.length === 0 ? (
        <div className="grid justify-items-center gap-3 pt-10 text-center">
          <img className="size-20 object-contain opacity-70" src="/assets/devy.svg" alt="" />
          <p className="m-0 max-w-[30ch] text-[15px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Nothing to look up here yet — this section's quick reference arrives with its lessons.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {personalization?.reason && (
            <p className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-[#211a2b] px-3 py-1.5 text-[12px] font-medium text-[#c4b5fd] [[data-theme=light]_&]:bg-[#f5edf4] [[data-theme=light]_&]:text-[#6d28d9]">
              <span aria-hidden="true">✦</span>
              {personalization.reason}
            </p>
          )}
          <div className="grid gap-7">
            {topics.map((topic) => <CheatsheetEntry key={topic.id} topic={topic} personalization={personalization} />)}
          </div>
        </div>
      )}
    </Drawer>
  )
}
