import { useState } from 'react'
import { Drawer } from '../ui/Drawer'
import { TopicGlyph } from './ReferenceIcons'

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
      className="absolute right-2 top-2 rounded-md border border-[#3a3a3e] bg-[#1f1f22] px-2 py-1 text-[11px] font-semibold text-[#b2b2b6] opacity-0 transition-opacity hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#888df2] group-hover:opacity-100"
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Snippet({ code }) {
  return (
    <div className="group relative">
      <pre className="m-0 overflow-x-auto rounded-xl border border-[#343438] bg-[#121214] px-4 py-3.5 font-['JetBrains_Mono',ui-monospace,monospace] text-[13.5px] leading-[1.7] text-[#f4f4f2]"><code>{code}</code></pre>
      <CopyButton text={code} />
    </div>
  )
}

// Code first, prose second — you open a cheatsheet to see the shape of the
// syntax, not to read a paragraph about it.
function CheatsheetEntry({ topic }) {
  return (
    <article className="grid gap-3 border-b border-[#2c2c30] pb-7 last:border-b-0 last:pb-0 [[data-theme=light]_&]:border-[#ececea]">
      <h3 className="m-0 flex items-center gap-2.5 font-['Space_Grotesk',Arial,sans-serif] text-[19px] font-semibold tracking-[-0.03em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
        <span className="grid size-8 flex-none place-items-center rounded-lg bg-[#252528] text-[#888df2] [[data-theme=light]_&]:bg-[#f1f0fd] [[data-theme=light]_&]:text-[#513deb]">
          <TopicGlyph topicId={topic.id} className="size-[18px]" />
        </span>
        {topic.title}
      </h3>

      <Snippet code={topic.cheatsheet.syntax} />

      <p className="m-0 text-[14px] leading-[1.6] text-[#a8a8ac] [[data-theme=light]_&]:text-[#5c5c5c]">{topic.cheatsheet.rule}</p>

      <details className="group/details">
        <summary className="cursor-pointer list-none text-[13px] font-semibold text-[#888df2] marker:hidden hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:text-[#513deb]">
          Example and common mistake
        </summary>
        <div className="grid gap-3 pt-3">
          <Snippet code={topic.cheatsheet.example} />
          <p className="m-0 rounded-lg border-l-2 border-[#f0c964] bg-[#241f16] px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-[#d6c9aa] [[data-theme=light]_&]:bg-[#fff8e9] [[data-theme=light]_&]:text-[#5e4b24]">
            {topic.cheatsheet.mistake}
          </p>
        </div>
      </details>
    </article>
  )
}

export function CheatsheetDrawer({ title, subtitle, topics, onClose }) {
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
        <div className="grid gap-7">
          {topics.map((topic) => <CheatsheetEntry key={topic.id} topic={topic} />)}
        </div>
      )}
    </Drawer>
  )
}
