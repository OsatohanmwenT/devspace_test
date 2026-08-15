import { useState } from 'react'

const pageCopy = {
  Home: {
    intro: 'I can help you decide what to do next.',
    prompts: ['What should I do next?', 'How am I doing?', 'I want more practice'],
  },
  Paths: {
    intro: 'I can help you choose a path and understand where it leads.',
    prompts: ['Which path suits me?', 'How does a path work?', 'I want to build something specific'],
  },
  Leaderboard: {
    intro: 'I can explain your league and how to earn XP.',
    prompts: ['How do leagues work?', 'How can I earn XP?', 'What do I need this week?'],
  },
  Practice: {
    intro: 'I can help you fit a useful practice session into your day.',
    prompts: ['What should I practise?', 'I want a quick win', 'How does practice help?'],
  },
}

function answerFor(prompt, pathTitle, nextLesson) {
  if (prompt.includes('next') || prompt.includes('quick')) return nextLesson ? `Your best next step is ${nextLesson} in ${pathTitle}. It keeps your path moving without asking you to choose from scratch.` : 'Open a path and I will help you choose a useful next step.'
  if (prompt.includes('practice')) return 'Practice is a short way to strengthen one skill. Pick a session that fits the time you have, then return to your path when you are ready.'
  if (prompt.includes('league') || prompt.includes('XP') || prompt.includes('week')) return 'Lessons and practice earn XP. Your weekly total decides your league position, so a short session still counts.'
  if (prompt.includes('path')) return 'A path is a sequence of lessons that builds toward a practical goal. You can explore any path and still keep your current progress.'
  if (prompt.includes('doing')) return `You are currently working through ${pathTitle}. Small, regular sessions are the easiest way to make progress.`
  return 'I can help with what is on this page. Try one of the suggestions above, or ask about your next lesson, practice, or learning path.'
}

export function DevyDrawer({ page, pathTitle, nextLesson, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const content = pageCopy[page] ?? pageCopy.Home

  const ask = (prompt) => {
    setMessages((current) => [...current, { prompt, answer: answerFor(prompt, pathTitle, nextLesson) }])
  }

  const submit = (event) => {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt) return
    ask(prompt)
    setDraft('')
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(440px,100vw)] flex-col border-l border-[#404040] bg-[#1f1f1f] shadow-none [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white" aria-label="Devy assistant">
      <header className="flex items-center justify-between border-b border-[#404040] px-4 py-4 [[data-theme=light]_&]:border-[#e1e1e1]">
        <div className="flex items-center gap-3">
          <img className="size-9 object-contain" src="/assets/devy.svg" alt="" />
          <div><strong className="block text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Devy</strong><span className="mt-1 inline-flex rounded-full bg-[#262626] px-2.5 py-1 text-[11px] text-[#9a9a9d] [[data-theme=light]_&]:bg-[#f2f3f5]">{page === 'Home' ? pathTitle : page}</span></div>
        </div>
        <button type="button" className="grid size-10 place-items-center rounded-lg bg-transparent text-[#9a9a9d] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5]" onClick={onClose} aria-label="Close Devy">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        {messages.length === 0 && <div className="grid justify-items-center gap-3 py-4 text-center">
          <img className="size-[72px] object-contain" src="/assets/devy.svg" alt="" />
          <p className="m-0 max-w-[30ch] text-sm leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Ask about anything on this page, or pick one of these.</p>
        </div>}
        <div className={`${messages.length ? '' : 'mt-4'} grid gap-3`} aria-live="polite">
          {messages.map((message, index) => <div key={`${message.prompt}-${index}`} className="grid gap-2"><p className="m-0 justify-self-end rounded-2xl rounded-tr-md bg-[#2f2e3e] px-4 py-2.5 text-sm text-[#f4f4f2] [[data-theme=light]_&]:bg-[#e4eaf4] [[data-theme=light]_&]:text-neutral-800">{message.prompt}</p><p className="m-0 rounded-2xl rounded-tl-md border border-[#404040] bg-[#262626] px-4 py-3 text-sm leading-[1.55] text-[#e4e4e6] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#f5f5f5] [[data-theme=light]_&]:text-neutral-800">{message.answer}</p></div>)}
        </div>
        {messages.length === 0 && <div className="mt-5 flex flex-wrap justify-center gap-2">{content.prompts.map((prompt) => <button key={prompt} type="button" className="rounded-full border border-[#404040] bg-transparent px-3.5 py-2 text-[13px] text-[#c4c4c7] hover:border-[#6699ec] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-[#525252]" onClick={() => ask(prompt)}>{prompt}</button>)}</div>}
      </div>
      <form className="m-3.5 flex items-center gap-2 rounded-full bg-[#1a1a1a] pr-1.5 focus-within:ring-2 focus-within:ring-[#6699ec] [[data-theme=light]_&]:bg-[#f5f5f4]" onSubmit={submit}>
        <input className="h-12 min-w-0 flex-1 rounded-full border-0 bg-transparent px-5 text-sm text-[#f4f4f2] placeholder:text-[#9a9a9d] focus:outline-none [[data-theme=light]_&]:text-neutral-800" placeholder="Ask Devy…" aria-label="Ask Devy" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button type="submit" className="grid size-11 flex-none place-items-center rounded-full bg-[#513dec] text-white transition-colors hover:bg-[#6350f0] disabled:opacity-40" disabled={!draft.trim()} aria-label="Send message to Devy">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </aside>
  )
}
