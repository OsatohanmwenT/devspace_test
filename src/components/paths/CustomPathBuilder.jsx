import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { deriveCustomTitle } from '../../data/paths'
import { ActionButton } from '../ui/ActionButton'

const EXAMPLES = ['Prepare for a junior React role', 'React Native state management', 'Learn Docker for backend deployment', 'Build a recommendation system']
const FOCUS_RING = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]'

function StatusIcon({ type }) {
  return type === 'include'
    ? <svg className="size-4 flex-none text-[#008a62]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    : <svg className="size-4 flex-none text-[#8b8b8b]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}

// Pure so it can be called with an explicit next value right when a message
// is pushed — the component's own `goal`/`experience`/`outcome` state hasn't
// re-rendered yet at that point in the handler, so closing over it directly
// would read stale values.
function buildRoute(goal, experience, outcome) {
  const isReactNative = /react native|state management/i.test(goal)

  if (isReactNative) {
    return {
      id: 'custom-react-native-state', title: 'React Native State Management', goal: 'Master state management in React Native, from component state through server state and performance.', experience, outcome,
      startingPoint: experience === 'I’m completely new' ? 'We’ll start with React Native fundamentals before state gets complex.' : 'You already have the basics, so we begin where state decisions become useful.',
      comfort: 'How comfortable are you with React Native?', comfortOptions: ['I’m completely new', 'I know React but not React Native', 'I’ve built small React Native apps', 'I use it but struggle with state'],
      outcomeQuestion: 'What do you want to be able to do?', outcomeOptions: ['Build a new app', 'Refactor an existing app', 'Prepare for interviews', 'Understand state deeply'],
      focus: ['component state', 'shared state', 'Context', 'Zustand / Redux patterns', 'server state', 'performance'], skip: ['basic JavaScript', 'beginner React fundamentals'], sections: ['Understanding State', 'Sharing State', 'Application State Patterns', 'Server State', 'Production State Architecture'],
      stages: [
        { label: 'Start here', title: 'Understand component state', description: 'Make local state feel predictable before sharing it across your app.' },
        { label: 'Build confidence', title: 'Share state with the right pattern', description: 'Move through Context and state libraries without adding unnecessary complexity.' },
        { label: 'Ship it', title: 'Handle server state and performance', description: 'Keep real app data reliable, responsive, and ready for production.' },
      ],
      project: outcome === 'Prepare for interviews' ? 'Explain and defend the state choices in a React Native app during technical interviews.' : outcome === 'Understand state deeply' ? 'Build a state architecture you can explain, test, and evolve with confidence.' : outcome === 'Build a new app' ? 'Create a polished mobile app with a reliable state foundation.' : 'Refactor an existing React Native app into a clearer, more reliable state system.',
    }
  }

  return {
    id: `custom-${goal.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'route'}`, title: deriveCustomTitle(goal), goal, experience, outcome,
    startingPoint: experience === 'I’m completely new' ? 'We’ll begin with the practical foundations, then build momentum quickly.' : 'We’ll begin from the experience you already have and avoid repeated basics.',
    comfort: 'How familiar are you with this topic?', comfortOptions: ['I’m completely new', 'I know the basics', 'I’ve built small projects', 'I use it but want depth'],
    outcomeQuestion: 'What do you want to be able to do?', outcomeOptions: ['Build a new project', 'Improve an existing project', 'Prepare for interviews', 'Understand it deeply'],
    focus: ['core concepts', 'practical patterns', 'a guided project', 'review and practice'], skip: ['unnecessary beginner material'], sections: ['Foundations', 'Core patterns', 'Build it', 'Make it reliable'],
    stages: [
      { label: 'Start here', title: 'Build useful foundations', description: 'Learn only the concepts you need to make progress on your goal.' },
      { label: 'Put it to work', title: 'Practice the core patterns', description: 'Use short exercises and examples that connect directly to your goal.' },
      { label: 'Make it real', title: 'Build and refine a project', description: 'Turn the learning into a result you can show, explain, or improve.' },
    ],
    project: outcome === 'Prepare for interviews' ? 'Turn your learning into clear examples and talking points for interviews.' : outcome === 'Understand it deeply' ? 'Build a project that makes the concepts concrete and easy to revisit.' : outcome === 'Improve an existing project' ? 'Apply the new skills directly to an existing project and make it stronger.' : 'Build a focused project that proves the skill in a real context.',
  }
}

function matchOption(text, options) {
  const needle = text.trim().toLowerCase()
  if (!needle) return null
  return options.find((option) => {
    const hay = option.toLowerCase()
    if (hay.includes(needle) || needle.includes(hay)) return true
    return hay.split(/\W+/).some((word) => word.length > 3 && needle.includes(word))
  }) ?? null
}

function AssistantRow({ children }) {
  return (
    <div className="devy-message-in min-w-0 flex-1">{children}</div>
  )
}

function TextBubble({ children }) {
  return (
    <div className="inline-block w-fit max-w-full rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-3.5 py-3 text-[15px] leading-[1.55] text-[#e4e4e6] [[data-theme=light]_&]:text-neutral-800">
      {children}
    </div>
  )
}

function UserBubble({ children }) {
  return <p className="devy-message-in m-0 ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-[#2f6fed] px-4 py-2.5 text-[15px] leading-[1.5] text-white">{children}</p>
}

function ThinkingBubble() {
  return (
    <div className="devy-message-in flex items-center gap-2.5" role="status" aria-label="Devy is thinking">
      <img className="devy-talking-avatar size-7 flex-none object-contain" src="/assets/devy.svg" alt="" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] px-4 py-3.5" aria-hidden="true">
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
        <span className="devy-thinking-dot size-1.5 rounded-full bg-[#9a9a9d]" />
      </div>
    </div>
  )
}

// Once answered, the pick is already echoed as its own user bubble right
// below — leaving the options visible (even disabled) would just repeat it.
function ChipRow({ options, onPick, answered }) {
  if (answered) return null

  return (
    <div className="mt-2.5 flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(option)}
          className={`min-h-10 rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-transparent px-4 py-2 text-[14px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] transition-colors hover:border-[#6699ec] ${FOCUS_RING}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ route, onConfirm, onAdjust, disabled }) {
  return (
    <div className="grid w-full max-w-[720px] gap-5 rounded-3xl border border-[#404040] bg-[#1f1f1f] p-6 [[data-theme=light]_&]:border-[#e7e5e0] [[data-theme=light]_&]:bg-white">
      <div><span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Goal</span><p className="mt-1.5 mb-0 text-[15px] leading-[1.6] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.goal}</p></div>
      <div><span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Starting point</span><p className="mt-1.5 mb-0 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.startingPoint}</p></div>
      <div><span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">We’ll focus on</span><ul className="mt-2.5 grid list-none gap-1.5 p-0">{route.focus.map((item) => <li key={item} className="flex items-center gap-2 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"><StatusIcon type="include" />{item}</li>)}</ul></div>
      <div><span className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">We’ll skip</span><ul className="mt-2.5 grid list-none gap-1.5 p-0">{route.skip.map((item) => <li key={item} className="flex items-center gap-2 text-[15px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]"><StatusIcon type="skip" />{item}</li>)}</ul></div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#333] [[data-theme=light]_&]:border-[#eee] pt-4">
        <ActionButton variant="primary" className="min-h-11 flex-1 text-[15px] font-semibold" disabled={disabled} onClick={onConfirm}>Looks good, create path</ActionButton>
        <button type="button" disabled={disabled} className={`border-0 bg-transparent text-[14px] text-[#8b8b90] underline underline-offset-4 hover:text-[#6699ec] disabled:opacity-40 ${FOCUS_RING}`} onClick={onAdjust}>Adjust</button>
      </div>
    </div>
  )
}

function RouteCard({ route, onStart, onAdjust, readOnly, isPrimary, onMakePrimary, disabled }) {
  return (
    <article className="grid w-full max-w-[780px] gap-6 rounded-3xl border border-[#404040] bg-[#1f1f1f] p-6 [[data-theme=light]_&]:border-[#e7e5e0] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_10px_rgba(20,20,20,0.06)]">
      <div>
        <span className="rounded-full bg-[#eeebff] px-3 py-1 text-[13px] font-medium text-[#4936d7]">Custom path{isPrimary ? ' · Primary' : ''}</span>
        <h2 className="mt-3 mb-1.5 font-rethink-sans text-[24px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.title}</h2>
        <p className="m-0 text-[15px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{route.goal}</p>
      </div>

      <aside className="rounded-2xl border border-[#2f6b53] bg-[#132a22] px-5 py-4 [[data-theme=light]_&]:border-[#b7e6d3] [[data-theme=light]_&]:bg-[#e7f8f0]" aria-label="Project payoff">
        <span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#7fe0b8] [[data-theme=light]_&]:text-[#008a62]">You’ll build</span>
        <p className="mt-1 mb-0 text-[15px] leading-[1.55] text-[#d3f3e5] [[data-theme=light]_&]:text-[#046648]">{route.project}</p>
      </aside>

      <div className="flex flex-wrap gap-2" aria-label="Route facts">
        {[[route.sections.length, 'sections'], [15, 'lessons'], [15, 'practice steps'], [1, 'project']].map(([value, label]) => <span key={label} className="rounded-full bg-[#27272a] px-3 py-1.5 text-[13px] text-[#c9c9cc] [[data-theme=light]_&]:bg-[#f3f2ef] [[data-theme=light]_&]:text-[#686968]"><strong className="mr-1 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{value}</strong>{label}</span>)}
      </div>

      <section className="rounded-2xl border border-[#6c8ee8] bg-[#1d2f5d] px-5 py-4 [[data-theme=light]_&]:border-[#cbd8ff] [[data-theme=light]_&]:bg-[#eff4ff]" aria-label="Starting point">
        <span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#a9c4ff] [[data-theme=light]_&]:text-[#315bb5]">Start here</span>
        <h3 className="mt-1 mb-1 font-rethink-sans text-[18px] font-semibold text-white [[data-theme=light]_&]:text-[#1f3c7c]">{route.stages[0].title}</h3>
        <p className="m-0 text-[15px] leading-[1.55] text-[#dbe6ff] [[data-theme=light]_&]:text-[#3a568d]">{route.startingPoint}</p>
      </section>

      <section aria-labelledby="route-story-title">
        <span id="route-story-title" className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Your route</span>
        <ol className="mt-4 grid list-none gap-4 p-0">
          {route.stages.map((stage, index) => <li className="relative flex gap-4" key={stage.title}>
            <div className="flex flex-col items-center"><span className={`grid size-9 place-items-center rounded-full text-[14px] font-semibold ${index === 0 ? 'bg-[#2f6fed] text-white' : 'bg-[#2b2b2e] text-[#c9c9cc] [[data-theme=light]_&]:bg-[#f1f1ef] [[data-theme=light]_&]:text-[#686968]'}`}>{index + 1}</span>{index < route.stages.length - 1 && <span className="mt-1 h-8 w-px border-l border-dashed border-[#767676]" aria-hidden="true" />}</div>
            <div className="pb-3"><span className="text-[12px] font-medium text-[#8b7cf6]">{stage.label}</span><h3 className="mt-0.5 mb-1 text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{stage.title}</h3><p className="m-0 text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{stage.description}</p></div>
          </li>)}
        </ol>
      </section>

      {readOnly
        ? <div className="grid gap-3 border-t border-[#333] [[data-theme=light]_&]:border-[#eee] pt-4">
            {!isPrimary && <ActionButton variant="primary" className="min-h-11 text-[15px] font-semibold" onClick={() => onMakePrimary(route)}>Make this my primary path</ActionButton>}
            <button type="button" onClick={onAdjust} className={`justify-self-center border-0 bg-transparent text-[14px] text-[#8b8b90] underline underline-offset-4 hover:text-[#6699ec] ${FOCUS_RING}`}>Back to paths</button>
          </div>
        : <div className="flex flex-wrap items-center gap-3 border-t border-[#333] [[data-theme=light]_&]:border-[#eee] pt-4">
            <ActionButton variant="primary" className="min-h-11 flex-1 text-[15px] font-semibold" disabled={disabled} onClick={() => onStart(route)}>Jump into your first lesson</ActionButton>
            <button type="button" disabled={disabled} className={`border-0 bg-transparent text-[14px] text-[#8b8b90] underline underline-offset-4 hover:text-[#6699ec] disabled:opacity-40 ${FOCUS_RING}`} onClick={onAdjust}>Adjust route</button>
          </div>}
    </article>
  )
}

export function CustomPathBuilder({ onBack, onStart, existingPath, isPrimary, onMakePrimary }) {
  const idRef = useRef(0)
  const nextId = () => `m${idRef.current++}`

  const [goal, setGoal] = useState(existingPath?.goal ?? '')
  const [experience, setExperience] = useState(existingPath?.experience ?? '')
  const [outcome, setOutcome] = useState(existingPath?.outcome ?? '')
  const [stage, setStage] = useState(existingPath ? 'ready' : 'goal')
  const [messages, setMessages] = useState(() => existingPath
    ? [{ id: nextId(), role: 'assistant', kind: 'route-card', route: existingPath }]
    : [{ id: nextId(), role: 'assistant', kind: 'goal-prompt' }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  // Briefly true between submitting the goal and the hero actually handing
  // off — gives Devy and the heading a beat to fade out instead of just
  // vanishing the instant the docked layout takes over.
  const [heroLeaving, setHeroLeaving] = useState(false)
  const listRef = useRef(null)
  const typingTimerRef = useRef(null)
  const textareaRef = useRef(null)
  const heroComposerRef = useRef(null)
  const dockedComposerRef = useRef(null)
  // Set right before the hero unmounts, read right after the docked composer
  // mounts in its place — a manual FLIP so the input visibly slides from its
  // centered hero position down into the docked bar, instead of just popping.
  const composerFlipFrom = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  useLayoutEffect(() => {
    const from = composerFlipFrom.current
    const node = dockedComposerRef.current
    if (!from || !node) return
    composerFlipFrom.current = null

    const to = node.getBoundingClientRect()
    const dx = from.left - to.left
    const dy = from.top - to.top
    const scale = from.width / to.width

    node.style.transition = 'none'
    node.style.transformOrigin = 'top left'
    node.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
    // Force a synchronous layout flush so the browser commits the "from"
    // transform before the next line changes it — the standard FLIP trick
    // for starting a CSS transition without waiting on a rAF tick.
    void node.offsetHeight
    node.style.transition = 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)'
    node.style.transform = ''

    const clear = () => { node.style.transition = ''; node.style.transformOrigin = '' }
    node.addEventListener('transitionend', clear, { once: true })
  })

  // Grows with Shift+Enter line breaks, capped so a long paste can't swallow
  // the message list — beyond the cap the textarea scrolls internally instead.
  useEffect(() => {
    const node = textareaRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`
  }, [input])

  useEffect(() => () => window.clearTimeout(typingTimerRef.current), [])

  const pushAssistant = (kind, extra = {}) => {
    setMessages((current) => [...current, { id: nextId(), role: 'assistant', kind, ...extra }])
  }
  const pushUser = (text) => {
    setMessages((current) => [...current, { id: nextId(), role: 'user', kind: 'text', text }])
  }
  const typeThenPush = (kind, extra = {}, delay = 550) => {
    setIsTyping(true)
    window.clearTimeout(typingTimerRef.current)
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false)
      pushAssistant(kind, extra)
    }, delay)
  }
  // Stamps the answer onto the specific choice message that was still open,
  // rather than deriving "answered" from live state — so an Adjust reset
  // later doesn't retroactively blank out an already-answered bubble.
  const answerChoice = (answerKey, value) => {
    setMessages((current) => current.map((message) => (
      message.kind === 'choice' && message.answerKey === answerKey && !message.answered
        ? { ...message, answered: value }
        : message
    )))
  }

  const submitGoal = (text) => {
    if (heroLeaving) return
    const trimmed = text.trim()
    if (trimmed.length < 8) return
    // Devy + heading fade out first; the actual hand-off (which is what the
    // composer FLIP keys off) happens once that fade finishes.
    setHeroLeaving(true)
    window.setTimeout(() => {
      composerFlipFrom.current = heroComposerRef.current?.getBoundingClientRect() ?? null
      pushUser(trimmed)
      setGoal(trimmed)
      setInput('')
      const nextRoute = buildRoute(trimmed, '', '')
      setStage('comfort')
      setHeroLeaving(false)
      typeThenPush('choice', { question: nextRoute.comfort, options: nextRoute.comfortOptions, answerKey: 'experience' })
    }, 200)
  }

  // `displayText` lets a typed reply that only fuzzy-matched (or didn't match
  // at all) still echo back what the user actually wrote, while `option`
  // stays the canonical value the rest of the flow reasons about.
  const pickComfort = (option, displayText) => {
    answerChoice('experience', option)
    pushUser(displayText ?? option)
    setExperience(option)
    setInput('')
    const nextRoute = buildRoute(goal, option, '')
    setStage('outcome')
    typeThenPush('choice', { question: nextRoute.outcomeQuestion, options: nextRoute.outcomeOptions, answerKey: 'outcome' })
  }

  const pickOutcome = (option, displayText) => {
    answerChoice('outcome', option)
    pushUser(displayText ?? option)
    setOutcome(option)
    setInput('')
    const nextRoute = buildRoute(goal, experience, option)
    setStage('review')
    typeThenPush('review-card', { route: nextRoute }, 1400)
  }

  const confirmReview = (route) => {
    setStage('ready')
    typeThenPush('route-card', { route, readOnly: false, isPrimary: false }, 1200)
  }

  // Shared by "Adjust" (from the review card) and "Adjust route" (from the
  // final card) — both mean the same thing: forget the last two answers and
  // ask again, as a fresh pair of chat turns rather than reopening a form.
  const revisit = () => {
    setExperience('')
    setOutcome('')
    pushAssistant('text', { text: 'No problem — let’s revisit a couple of things.' })
    const nextRoute = buildRoute(goal, '', '')
    setStage('comfort')
    typeThenPush('choice', { question: nextRoute.comfort, options: nextRoute.comfortOptions, answerKey: 'experience' })
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    if (stage === 'goal') return submitGoal(text)

    // Comfort/outcome are nominally multiple-choice, but typing shouldn't be
    // a dead end — an unmatched reply still advances the flow (falling back
    // to the first option as a reasonable default) rather than stalling and
    // insisting on a chip click.
    if (stage === 'comfort') {
      const options = buildRoute(goal, '', '').comfortOptions
      return pickComfort(matchOption(text, options) ?? options[0], text)
    }

    if (stage === 'outcome') {
      const options = buildRoute(goal, experience, '').outcomeOptions
      return pickOutcome(matchOption(text, options) ?? options[0], text)
    }

    if (stage === 'review') {
      pushUser(text)
      setInput('')
      typeThenPush('text', { text: 'Noted — tap “Looks good, create path” above when you’re ready, or “Adjust” to change your answers.' }, 450)
      return
    }

    // stage === 'ready': the route itself is scripted, not generated live, so
    // being honest about that limit beats pretending to regenerate on request.
    pushUser(text)
    setInput('')
    typeThenPush('text', { text: 'I can’t regenerate the route from a message yet — tap “Adjust route” below and I’ll walk through the questions again.' }, 450)
  }

  if (existingPath) return (
    <section className="mx-auto grid w-full max-w-[860px] gap-6 px-4 py-8" aria-label="Custom path">
      <header className="flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to paths" className={`grid size-9 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${FOCUS_RING}`}>
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <strong className="text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Custom path</strong>
      </header>
      <RouteCard route={existingPath} readOnly isPrimary={isPrimary} onMakePrimary={onMakePrimary} onAdjust={onBack} />
    </section>
  )

  // Hero mode is the very first exchange: a centered "let's noodle"-style
  // question + composer, no message list yet. It ends the instant the goal
  // is submitted — `stage` flips out of 'goal' in the same commit that adds
  // the user's reply, so the composer FLIPs (see composerFlipFrom above)
  // from its centered hero spot down into the docked bar.
  const isHero = stage === 'goal'

  const composerFields = (
    <>
      <textarea
        ref={textareaRef}
        rows={1}
        className="min-h-9 max-h-40 min-w-0 flex-1 resize-none overflow-y-auto rounded-full border-0 bg-transparent px-3 py-2 text-[14px] leading-[1.4] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 placeholder:text-[#89898e] focus:outline-none font-[inherit]"
        placeholder={stage === 'goal' ? 'Describe your learning goal…' : 'Ask a question or reply…'}
        aria-label="Message Devy"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
          }
        }}
      />
      <button type="submit" disabled={!input.trim()} aria-label="Send" className={`mr-0.5 grid size-10 flex-none place-items-center rounded-full border-0 bg-[#2f6fed] text-white transition-[transform,background-color] duration-150 enabled:hover:-translate-y-px enabled:hover:bg-[#3b82f6] enabled:active:translate-y-0 disabled:opacity-40 ${FOCUS_RING}`}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </>
  )

  return (
    <section className={`mx-auto -mt-8 -mb-[72px] grid h-[100vh] w-full max-w-[860px] px-4 max-[680px]:-mt-6 max-[680px]:-mb-14 ${isHero ? 'grid-rows-[auto_minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)_auto]'}`} aria-label="Build a custom path">
      <header className="flex items-center gap-3 py-4">
        <button type="button" onClick={onBack} aria-label="Back to paths" className={`grid size-9 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${FOCUS_RING}`}>
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <strong className="text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Build a custom path</strong>
      </header>

      {isHero ? (
        <div className="flex min-h-0 items-center justify-center">
          <div className="flex w-full max-w-[640px] flex-col items-center gap-6 px-4">
            <div className={`devy-message-in flex flex-col items-center gap-6 transition-[opacity,transform] duration-200 ${heroLeaving ? '-translate-y-1.5 opacity-0' : ''}`}>
              <img className="size-9 object-contain" src="/assets/devy.svg" alt="" />
              <h1 className="m-0 text-center font-rethink-sans text-[26px] font-semibold leading-[1.3] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                What do you want to learn, build, or prepare for?
              </h1>
            </div>

            <form ref={heroComposerRef} className="devy-composer-in flex w-full items-end gap-1.5 rounded-[26px] border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white py-2.5 pr-1 pl-2 transition-[border-color,box-shadow] duration-150 focus-within:border-[#6699ec] focus-within:shadow-[0_0_0_3px_rgba(102,153,236,0.15)]" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
              {composerFields}
            </form>

            <div className={`flex flex-wrap justify-center gap-2 transition-opacity duration-200 ${heroLeaving ? 'pointer-events-none opacity-0' : ''}`} aria-label="Example goals">
              {EXAMPLES.map((example) => (
                <button key={example} type="button" onClick={() => submitGoal(example)} className={`rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-transparent px-3.5 py-2 text-[12.5px] text-[#c4c4c7] [[data-theme=light]_&]:text-[#686968] hover:border-[#6699ec] ${FOCUS_RING}`}>{example}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={listRef} className="scrollbar-hidden flex min-h-0 flex-col overflow-y-auto" aria-live="polite">
            <div className="flex flex-col gap-4 py-2">
              {messages.map((message) => {
                if (message.role === 'user') return <UserBubble key={message.id}>{message.text}</UserBubble>

                switch (message.kind) {
                  case 'goal-prompt':
                    // Only reached once the hero has already handed off (isHero
                    // is false by the time this list renders at all), so this
                    // is always the settled, compact form of the opening question.
                    return (
                      <AssistantRow key={message.id}>
                        <TextBubble>What do you want to learn, build, or prepare for?</TextBubble>
                      </AssistantRow>
                    )
                  case 'text':
                    return <AssistantRow key={message.id}><TextBubble>{message.text}</TextBubble></AssistantRow>
                  case 'choice':
                    return (
                      <AssistantRow key={message.id}>
                        <TextBubble>{message.question}</TextBubble>
                        <ChipRow options={message.options} answered={message.answered} onPick={message.answerKey === 'experience' ? pickComfort : pickOutcome} />
                      </AssistantRow>
                    )
                  case 'review-card':
                    return <AssistantRow key={message.id}><ReviewCard route={message.route} disabled={stage !== 'review'} onConfirm={() => confirmReview(message.route)} onAdjust={revisit} /></AssistantRow>
                  case 'route-card':
                    return <AssistantRow key={message.id}><RouteCard route={message.route} readOnly={message.readOnly} isPrimary={message.isPrimary} onMakePrimary={onMakePrimary} disabled={stage !== 'ready'} onStart={onStart} onAdjust={revisit} /></AssistantRow>
                  default:
                    return null
                }
              })}
              {isTyping && <ThinkingBubble />}
            </div>
          </div>

          <form ref={dockedComposerRef} className="devy-composer-in flex w-full items-end gap-1.5 rounded-[22px] border border-[#5c5c60] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white py-2 my-4 pr-1 pl-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[#6699ec] focus-within:shadow-[0_0_0_3px_rgba(102,153,236,0.15)]" onSubmit={(event) => { event.preventDefault(); handleSend() }}>
            {composerFields}
          </form>
        </>
      )}
    </section>
  )
}
