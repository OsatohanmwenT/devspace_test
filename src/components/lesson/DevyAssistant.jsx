import { useEffect, useRef, useState } from 'react'
import { RichText, StreamedRichText } from './RichText'
import { DevyLottie } from '../ui/DevyLottie'
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt } from '../../lib/devy'

function Bubble({ children }) {
  return (
    <div className="min-w-0 rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-3.5 py-3 text-[15px] leading-[1.55] text-[#e4e4e6] [[data-theme=light]_&]:text-neutral-800">
      {children}
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="devy-message-in flex items-center gap-1.5 justify-self-start rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-4 py-3.5" aria-label="Devy is thinking" role="status">
      <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" aria-hidden="true" />
      <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" aria-hidden="true" />
      <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" aria-hidden="true" />
    </div>
  )
}

export function DevyAssistant({ step, checked, profile, recentMessages = [], lessonTitle, onClose, focusRing }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const conversationRef = useRef(null)
  const thinkingTimerRef = useRef(null)
  const prompts = getPrompts(step, checked).filter(({ id }) => !messages.some((message) => message.id === id))
  const isHintOnly = step?.type === 'question' && !checked

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking, isStreaming])

  useEffect(() => () => window.clearTimeout(thinkingTimerRef.current), [])

  const addResponse = (message) => {
    setIsThinking(true)
    window.clearTimeout(thinkingTimerRef.current)
    thinkingTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, message])
      setIsThinking(false)
      setIsStreaming(true)
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
      <div className="flex items-center justify-between gap-3 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        <span className="flex min-w-0 items-center gap-2.5">
          {/* Devy visibly "thinks" while a reply is on its way, then settles. */}
          <span className="grid size-9 flex-none place-items-center" aria-hidden="true">
            {isThinking || isStreaming ? (
              <DevyLottie clip="thinking" className="size-full" />
            ) : (
              <img src="/assets/devy.svg" alt="" className="size-full" />
            )}
          </span>
          <span className="grid min-w-0">
            <strong className="text-[17px] leading-tight">Devy</strong>
            {lessonTitle && (
              <span className="truncate text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Helping with {lessonTitle}</span>
            )}
          </span>
        </span>
        {/* A "hide panel" glyph rather than a second ×, so it can't be
            mistaken for the lesson's own close button beside it. */}
        <button
          type="button"
          className={`grid w-9 h-9 flex-none place-items-center border-0 rounded-lg bg-transparent text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${focusRing}`}
          onClick={onClose}
          aria-label="Hide Devy"
          title="Hide Devy"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 4.5v15" stroke="currentColor" strokeWidth="1.8" />
            <path d="m15.5 10-2 2 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div ref={conversationRef} className="scrollbar-hidden mt-5 min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <div className="grid min-h-full content-end gap-3">
          {recentMessages.map((message, index) => (
            <div key={message.id} className={index === recentMessages.length - 1 ? 'devy-message-in' : 'blur-[4px] opacity-25 transition-[filter,opacity] duration-300'}>
              <Bubble>{message.text}</Bubble>
            </div>
          ))}

          <div className={messages.length ? 'blur-[4px] opacity-25 transition-[filter,opacity] duration-300' : ''}>
            <Bubble>{getGreeting(profile, { isHintOnly })}</Bubble>
          </div>

          {messages.map((message, index) => (
            <div className={`grid gap-2 ${index === messages.length - 1 ? 'devy-message-in' : ''}`} key={`${message.id}-${index}`}>
              <p className={`m-0 justify-self-end rounded-2xl rounded-tr-md bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e4eaf4] px-4 py-2.5 text-sm text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 transition-[filter,opacity] duration-300 ${index === messages.length - 1 ? '' : 'blur-[4px] opacity-20'}`}>
                {message.label}
              </p>
              <div className={`transition-[filter,opacity] duration-300 ${index === messages.length - 1 ? '' : 'blur-[4px] opacity-25'}`}>
                <Bubble>
                  {index === messages.length - 1 && isStreaming ? (
                    <StreamedRichText content={message.response.body} onDone={() => setIsStreaming(false)} />
                  ) : (
                    <RichText content={message.response.body} />
                  )}
                  {message.response.suggestions?.length > 0 && !(index === messages.length - 1 && isStreaming) && (
                    <span className="mt-3 flex flex-wrap gap-2">
                      {message.response.suggestions.map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          className={`rounded-full border border-[#6699ec]/40 bg-[#6699ec]/10 px-3 py-1.5 text-[13px] font-semibold text-[#88bdf2] transition-colors hover:bg-[#6699ec]/20 [[data-theme=light]_&]:border-[#bfd3f7] [[data-theme=light]_&]:bg-[#eff4ff] [[data-theme=light]_&]:text-[#2563eb] ${focusRing}`}
                          onClick={() => ask(id, label)}
                        >
                          {label}
                        </button>
                      ))}
                    </span>
                  )}
                  {message.response.code && !(index === messages.length - 1 && isStreaming) && (
                    <pre className="mt-2.5 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3.5 py-3 font-rubik text-sm leading-[1.7] text-[#d4d4d4]"><code>{message.response.code}</code></pre>
                  )}
                </Bubble>
              </div>
            </div>
          ))}
          {isThinking && <ThinkingBubble />}
        </div>
      </div>

      <div className="devy-composer-in scrollbar-hidden mt-4 mb-2.5 flex gap-2 overflow-x-auto" role="group" aria-label="Ask Devy">
        {prompts.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`min-h-9 flex-none whitespace-nowrap rounded-full border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white px-3.5 py-2 text-left text-[14px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] transition-[border-color,transform,background-color] duration-150 hover:-translate-y-px hover:border-[#8a8a8e] hover:bg-[#222225] [[data-theme=light]_&]:hover:border-[#737371] [[data-theme=light]_&]:hover:bg-[#fafafa] active:translate-y-0 ${focusRing}`}
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
