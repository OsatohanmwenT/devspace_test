import { useState } from 'react'
import { RichText } from './RichText'
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt } from '../../lib/devy'

function Bubble({ children }) {
  return (
    <div className="rounded-[var(--radius-card)] rounded-tl-md border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3.5 py-3 text-sm leading-[1.55] text-[var(--text-primary)]">
      {children}
    </div>
  )
}

export function DevyAssistant({ step, checked, profile, onClose, focusRing }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const prompts = getPrompts(step, checked).filter(({ id }) => !messages.some((message) => message.id === id))

  const ask = (promptId, label) => {
    const response = getResponse(promptId, step, { checked })
    if (!response) return
    setMessages((current) => [...current, { id: promptId, label, response }])
  }

  const submitDraft = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const available = getPrompts(step, checked)
    const matched = matchPrompt(text, available)
    const response = matched ? getResponse(matched, step, { checked }) : getFallbackResponse(available)
    setMessages((current) => [...current, { id: `text-${current.length}`, label: text, response }])
    setDraft('')
  }

  return (
    <>
      <div className="flex items-center justify-between text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
        <strong className="text-base">Devy</strong>
        <button
          type="button"
          className={`grid w-9 h-9 place-items-center border-0 rounded-lg bg-transparent text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777] hover:bg-[var(--surface-raised)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] ${focusRing}`}
          onClick={onClose}
          aria-label="Close Devy chat"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="mt-5 flex-1 overflow-auto" aria-live="polite">
        <div className="grid gap-3">
          <Bubble>{getGreeting(profile)}</Bubble>

          {messages.map((message, index) => (
            <div className="grid gap-2" key={`${message.id}-${index}`}>
              <p className="m-0 justify-self-end rounded-[var(--radius-card)] rounded-tr-md bg-[var(--surface-brand-tint)] px-3.5 py-2 text-[13px] text-[var(--text-primary)]">
                {message.label}
              </p>
              <Bubble>
                <RichText content={message.response.body} />
                {message.response.code && (
                  <pre className="mt-2.5 overflow-x-auto rounded-lg bg-[var(--surface-default)] px-3 py-2.5 font-['JetBrains_Mono',ui-monospace,monospace] text-[12px] leading-[1.7] text-[var(--border-default)]"><code>{message.response.code}</code></pre>
                )}
              </Bubble>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 mb-5 max-[720px]:mb-4 grid gap-2" role="group" aria-label="Ask Devy">
        {prompts.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] px-4 py-2.5 text-left text-[13px] text-[var(--text-secondary)] hover:border-[var(--border-interactive)] ${focusRing}`}
            onClick={() => ask(id, label)}
          >
            {label}
          </button>
        ))}
        {prompts.length === 0 && (
          <p className="m-0 text-[13px] leading-[1.5] text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]">
            That’s everything I can help with on this step. Keep going and I’ll have more on the next one.
          </p>
        )}
      </div>

      <form
        className="mb-5 max-[720px]:mb-4 flex items-center gap-2 rounded-full border border-[var(--border-interactive)] [[data-theme=light]_&]:border-[var(--border-default)] bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white pr-1.5"
        onSubmit={submitDraft}
      >
        <input
          type="text"
          className="h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-sm text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] [[data-theme=light]_&]:placeholder:text-[var(--text-secondary)] focus:outline-none font-[inherit]"
          placeholder="Ask Devy"
          aria-label="Ask Devy a question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className={`grid h-9 w-9 flex-none place-items-center rounded-full border-0 bg-[var(--brand-cta)] text-white disabled:opacity-40 ${focusRing}`}
          disabled={!draft.trim()}
          aria-label="Send message to Devy"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </>
  )
}
