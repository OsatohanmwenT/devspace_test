import { useState } from 'react'
import { RichText } from './RichText'
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt } from '../../lib/devy'

function Bubble({ children }) {
  return (
    <div className="rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-3.5 py-3 text-sm leading-[1.55] text-[#e4e4e6] [[data-theme=light]_&]:text-[#181818]">
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
      <div className="flex items-center justify-between text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
        <strong className="text-base">Devy</strong>
        <button
          type="button"
          className={`grid w-9 h-9 place-items-center border-0 rounded-lg bg-transparent text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${focusRing}`}
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
              <p className="m-0 justify-self-end rounded-2xl rounded-tr-md bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e5e4f4] px-3.5 py-2 text-[13px] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">
                {message.label}
              </p>
              <Bubble>
                <RichText content={message.response.body} />
                {message.response.code && (
                  <pre className="mt-2.5 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3 py-2.5 font-['JetBrains_Mono',ui-monospace,monospace] text-[12px] leading-[1.7] text-[#d4d4d4]"><code>{message.response.code}</code></pre>
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
            className={`rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-4 py-2.5 text-left text-[13px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] hover:border-[#8a8a8e] [[data-theme=light]_&]:hover:border-[#737371] ${focusRing}`}
            onClick={() => ask(id, label)}
          >
            {label}
          </button>
        ))}
        {prompts.length === 0 && (
          <p className="m-0 text-[13px] leading-[1.5] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
            That’s everything I can help with on this step. Keep going and I’ll have more on the next one.
          </p>
        )}
      </div>

      <form
        className="mb-5 max-[720px]:mb-4 flex items-center gap-2 rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white pr-1.5"
        onSubmit={submitDraft}
      >
        <input
          type="text"
          className="h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] placeholder:text-[#b8b8bb] [[data-theme=light]_&]:placeholder:text-[#686968] focus:outline-none font-[inherit]"
          placeholder="Ask Devy"
          aria-label="Ask Devy a question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className={`grid h-9 w-9 flex-none place-items-center rounded-full border-0 bg-[#513deb] text-white disabled:opacity-40 ${focusRing}`}
          disabled={!draft.trim()}
          aria-label="Send message to Devy"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </>
  )
}
