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
      className="absolute right-2 top-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-overlay)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)] opacity-0 transition-opacity hover:text-[var(--text-primary)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] group-hover:opacity-100"
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Snippet({ code }) {
  return (
    <div className="group relative">
      <pre className="m-0 overflow-x-auto border-l-2 border-[var(--brand-cta)] bg-[var(--surface-default)] px-4 py-3.5 font-[var(--font-code)] text-[14px] leading-[1.7] text-[var(--text-primary)]"><code>{code}</code></pre>
      <CopyButton text={code} />
    </div>
  )
}

// Code first, prose second — you open a cheatsheet to see the shape of the
// syntax, not to read a paragraph about it.
function CheatsheetEntry({ topic }) {
  return (
    <article className="grid gap-3 border-b border-[var(--surface-raised)] pb-7 last:border-b-0 last:pb-0 [[data-theme=light]_&]:border-[var(--border-hairline)]">
      <h3 className="m-0 flex items-center gap-2.5 font-['Rethink_Sans',Arial,sans-serif] text-[19px] font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
        <span className="grid size-8 flex-none place-items-center bg-[var(--surface-brand-tint)] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">
          <TopicGlyph topicId={topic.id} className="size-[18px]" />
        </span>
        {topic.title}
      </h3>

      <Snippet code={topic.cheatsheet.syntax} />

      <p className="m-0 text-[14px] leading-[1.6] text-[var(--text-secondary)]">{topic.cheatsheet.rule}</p>

      <details className="group/details">
        <summary className="cursor-pointer list-none text-[13px] font-semibold text-[var(--border-focus)] marker:hidden hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] [[data-theme=light]_&]:text-[var(--brand-cta)]">
          Example and common mistake
        </summary>
        <div className="grid gap-3 pt-3">
          <Snippet code={topic.cheatsheet.example} />
          <p className="m-0 border-l-2 border-[var(--accent-progress)] bg-[var(--surface-progress-tint)] px-3.5 py-2.5 text-[14px] leading-[1.6] text-[var(--text-primary)]">
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
          <p className="m-0 max-w-[30ch] text-[15px] leading-[1.6] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
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
