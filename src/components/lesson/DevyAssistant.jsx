import { useEffect, useRef, useState } from 'react'
import { RichText } from './RichText'
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt } from '../../lib/devy'

function Bubble({ children, talking = false }) {
  return (
    <div className="flex items-start gap-2.5">
      <img className={`mt-0.5 size-6 flex-none object-contain ${talking ? 'devy-talking-avatar' : ''}`} src="/assets/devy.svg" alt="" />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-3.5 py-3 text-[15px] leading-[1.55] text-[#e4e4e6] [[data-theme=light]_&]:text-neutral-800">
        {children}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="devy-message-in flex items-center gap-2.5" aria-label="Devy is thinking" role="status">
      <img className="devy-talking-avatar size-6 flex-none object-contain" src="/assets/devy.svg" alt="" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-4 py-3.5" aria-hidden="true">
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
      </div>
    </div>
  )
}

export function DevyAssistant({ step, checked, profile, onClose, focusRing }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const conversationRef = useRef(null)
  const thinkingTimerRef = useRef(null)
  const prompts = getPrompts(step, checked).filter(({ id }) => !messages.some((message) => message.id === id))

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  useEffect(() => () => window.clearTimeout(thinkingTimerRef.current), [])

  const addResponse = (message) => {
    setIsThinking(true)
    window.clearTimeout(thinkingTimerRef.current)
    thinkingTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, message])
      setIsThinking(false)
    }, 600)
  }

  const ask = (promptId, label) => {
    const response = getResponse(promptId, step, { checked })
    if (!response) return
    addResponse({ id: promptId, label, response })
  }

  const submitDraft = (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const available = getPrompts(step, checked)
    const matched = matchPrompt(text, available)
    const response = matched ? getResponse(matched, step, { checked }) : getFallbackResponse(available)
    addResponse({ id: `text-${Date.now()}`, label: text, response })
    setDraft('')
  }

  return (
    <>
      <div className="flex items-center justify-between text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        <strong className="text-lg">Devy</strong>
        <button
          type="button"
          className={`grid w-9 h-9 place-items-center border-0 rounded-lg bg-transparent text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${focusRing}`}
          onClick={onClose}
          aria-label="Close Devy chat"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div ref={conversationRef} className="scrollbar-hidden mt-5 min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <div className="grid min-h-full content-end gap-3">
          <div className={messages.length ? 'blur-[2px] opacity-30 transition-[filter,opacity] duration-300' : ''}>
            <Bubble>{getGreeting(profile)}</Bubble>
          </div>

          {messages.map((message, index) => (
            <div className={`grid gap-2 ${index === messages.length - 1 ? 'devy-message-in' : ''}`} key={`${message.id}-${index}`}>
              <p className={`m-0 justify-self-end rounded-2xl rounded-tr-md bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e4eaf4] px-4 py-2.5 text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 transition-[filter,opacity] duration-300 ${index === messages.length - 1 ? 'opacity-65' : 'blur-[2px] opacity-25'}`}>
                {message.label}
              </p>
              <div className={`transition-[filter,opacity] duration-300 ${index === messages.length - 1 ? '' : 'blur-[2px] opacity-35'}`}>
                <Bubble talking={index === messages.length - 1}>
                  <RichText content={message.response.body} />
                  {message.response.code && (
                    <pre className="mt-2.5 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3.5 py-3 font-rubik text-sm leading-[1.7] text-[#d4d4d4]"><code>{message.response.code}</code></pre>
                  )}
                </Bubble>
              </div>
            </div>
          ))}
          {isThinking && <ThinkingBubble />}
        </div>
      </div>

      <div className="devy-composer-in mt-4 mb-5 flex flex-wrap gap-2 max-[720px]:mb-4" role="group" aria-label="Ask Devy">
        {prompts.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`min-h-10 rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-3.5 py-2 text-left text-[14px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] transition-[border-color,transform,background-color] duration-150 hover:-translate-y-px hover:border-[#8a8a8e] hover:bg-[#222225] [[data-theme=light]_&]:hover:border-[#737371] [[data-theme=light]_&]:hover:bg-[#fafafa] active:translate-y-0 ${focusRing}`}
            onClick={() => ask(id, label)}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="devy-composer-in mb-5 max-[720px]:mb-4 flex items-center gap-2 rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white pr-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[#6699ec] focus-within:shadow-[0_0_0_3px_rgba(102,153,236,0.15)]"
        onSubmit={submitDraft}
      >
        <input
          type="text"
          className="h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 placeholder:text-[#b8b8bb] [[data-theme=light]_&]:placeholder:text-[#686968] focus:outline-none font-[inherit]"
          placeholder="Ask Devy"
          aria-label="Ask Devy a question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className={`grid size-10 flex-none place-items-center rounded-full border-0 bg-[#2563eb] text-white transition-[transform,background-color] duration-150 enabled:hover:-translate-y-px enabled:hover:bg-[#3b82f6] enabled:active:translate-y-0 disabled:opacity-40 ${focusRing}`}
          disabled={!draft.trim()}
          aria-label="Send message to Devy"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </>
  )
}
