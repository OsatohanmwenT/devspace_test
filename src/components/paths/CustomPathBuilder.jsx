import { useState } from 'react'
import GeneratingPath from '../onboarding/GeneratingPath'
import { ActionButton } from '../ui/ActionButton'

const EXAMPLES = ['Prepare for a junior React role', 'React Native state management', 'Learn Docker for backend deployment', 'Build a recommendation system']
const GENERATING_LINES = ['Reading your goal…', 'Matching it to material we have…', 'Putting your route together…']

function StatusIcon({ type }) {
  return type === 'include'
    ? <svg className="size-4 flex-none text-[#008a62]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    : <svg className="size-4 flex-none text-[#8b8b8b]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}

function RouteStory({ route, onStart, onAdjust, readOnly }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[760px] content-center justify-items-center gap-6 pb-10" aria-labelledby="custom-path-ready-title">
      <div className="grid justify-items-center gap-2 text-center">
        <img className="size-16 object-contain" src="/assets/devy.svg" alt="" />
        <h1 id="custom-path-ready-title" className="m-0 font-rethink-sans text-[32px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">You’re all set.</h1>
      </div>

      <article className="grid w-full gap-6 rounded-3xl border border-[#404040] bg-[#1f1f1f] p-7 [[data-theme=light]_&]:border-[#e7e5e0] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_2px_10px_rgba(20,20,20,0.06)]">
        <div>
          <span className="rounded-full bg-[#eeebff] px-3 py-1 text-[13px] font-medium text-[#4936d7]">Custom path</span>
          <h2 className="mt-4 mb-2 font-rethink-sans text-[27px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.title}</h2>
          <p className="m-0 text-[16px] leading-[1.6] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{route.goal}</p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Route facts">
          {[[route.sections.length, 'sections'], [15, 'lessons'], [15, 'practice steps'], [1, 'project']].map(([value, label]) => <span key={label} className="rounded-full bg-[#27272a] px-3 py-1.5 text-[13px] text-[#c9c9cc] [[data-theme=light]_&]:bg-[#f3f2ef] [[data-theme=light]_&]:text-[#686968]"><strong className="mr-1 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{value}</strong>{label}</span>)}
        </div>

        <section className="rounded-2xl border border-[#6c8ee8] bg-[#1d2f5d] px-5 py-4 [[data-theme=light]_&]:border-[#cbd8ff] [[data-theme=light]_&]:bg-[#eff4ff]" aria-label="Starting point">
          <span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#a9c4ff] [[data-theme=light]_&]:text-[#315bb5]">Start here</span>
          <h3 className="mt-1 mb-1 font-rethink-sans text-[19px] font-semibold text-white [[data-theme=light]_&]:text-[#1f3c7c]">{route.stages[0].title}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-[#dbe6ff] [[data-theme=light]_&]:text-[#3a568d]">{route.startingPoint}</p>
        </section>

        <section aria-labelledby="route-story-title">
          <span id="route-story-title" className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Your route</span>
          <ol className="mt-4 grid list-none gap-4 p-0">
            {route.stages.map((stage, index) => <li className="relative flex gap-4" key={stage.title}>
              <div className="flex flex-col items-center"><span className={`grid size-9 place-items-center rounded-full text-[14px] font-semibold ${index === 0 ? 'bg-[#2f6fed] text-white' : 'bg-[#2b2b2e] text-[#c9c9cc] [[data-theme=light]_&]:bg-[#f1f1ef] [[data-theme=light]_&]:text-[#686968]'}`}>{index + 1}</span>{index < route.stages.length - 1 && <span className="mt-1 h-8 w-px border-l border-dashed border-[#767676]" aria-hidden="true" />}</div>
              <div className="pb-3"><span className="text-[12px] font-medium text-[#8b7cf6]">{stage.label}</span><h3 className="mt-0.5 mb-1 text-[17px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{stage.title}</h3><p className="m-0 text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{stage.description}</p></div>
            </li>)}
          </ol>
        </section>

        <aside className="rounded-2xl border border-[#b7e6d3] bg-[#e7f8f0] px-5 py-4 text-[#008a62]">
          <span className="text-[12px] font-semibold uppercase tracking-[.1em]">Your project payoff</span>
          <p className="mt-1 mb-0 text-[15px] leading-[1.55]">{route.project}</p>
        </aside>
      </article>

      {readOnly ? <button type="button" onClick={onAdjust} className="border-0 bg-transparent text-[15px] text-[#777] underline underline-offset-4 hover:text-[#2f6fed]">Back to paths</button> : <div className="grid w-[min(100%,500px)] gap-4"><ActionButton variant="primary" className="min-h-[52px] text-[16px] font-semibold" onClick={() => onStart(route)}>Start learning</ActionButton><button type="button" onClick={onAdjust} className="justify-self-center border-0 bg-transparent text-[15px] text-[#777] underline underline-offset-4 hover:text-[#2f6fed]">Adjust route</button></div>}
    </section>
  )
}

export function CustomPathBuilder({ onBack, onStart, existingPath }) {
  const [goal, setGoal] = useState(existingPath?.goal ?? '')
  const [stage, setStage] = useState(existingPath ? 'ready' : 'brief')
  const [isGenerating, setIsGenerating] = useState(false)
  const [experience, setExperience] = useState(existingPath?.experience ?? '')
  const [outcome, setOutcome] = useState(existingPath?.outcome ?? '')
  const isReactNative = /react native|state management/i.test(goal)
  const route = isReactNative
    ? {
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
    : {
        id: `custom-${goal.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'route'}`, title: 'Your custom learning route', goal, experience, outcome,
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

  const startGenerating = (nextStage) => {
    setIsGenerating(true)
    window.setTimeout(() => { setIsGenerating(false); setStage(nextStage) }, 2400)
  }

  if (isGenerating) return <section className="mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[720px] content-center justify-items-center" aria-label="Building your custom path"><GeneratingPath lines={GENERATING_LINES} durationMs={2300} onDone={() => {}} /></section>
  if (existingPath) return <RouteStory route={existingPath} readOnly onAdjust={onBack} />
  if (stage === 'ready') return <RouteStory route={route} onStart={onStart} onAdjust={() => setStage('details')} />

  if (stage === 'details') return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[660px] content-center justify-items-center gap-7 pb-10" aria-labelledby="custom-path-details-title">
      <div className="grid justify-items-center gap-3 text-center"><div className="flex items-center gap-2 text-[14px] text-[#777] [[data-theme=light]_&]:text-[#686968]"><img className="size-9 object-contain" src="/assets/devy.svg" alt="" />Devy read your goal</div><h1 id="custom-path-details-title" className="m-0 font-rethink-sans text-[32px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">A couple of details</h1><p className="m-0 text-[16px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">These shape the route, not the length of this form.</p></div>
      <div className="grid w-full gap-6">
        <fieldset className="m-0 grid gap-4 border-0 p-0"><legend className="text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.comfort}</legend><div className="flex flex-wrap gap-2">{route.comfortOptions.map((option) => <button key={option} type="button" onClick={() => setExperience(option)} className={`min-h-11 rounded-full border px-5 text-[15px] transition-colors ${experience === option ? 'border-[#2f6fed] bg-[#2f6fed] text-white hover:bg-[#2563d9]' : 'border-[#e6e4df] bg-white text-[#686968] hover:border-[#8b7cf6] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1a1a1a] [[data-theme=dark]_&]:text-[#c4c4c7]'}`}>{option}</button>)}</div></fieldset>
        <fieldset className="m-0 grid gap-4 border-0 p-0"><legend className="text-[16px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.outcomeQuestion}</legend><div className="flex flex-wrap gap-2">{route.outcomeOptions.map((option) => <button key={option} type="button" onClick={() => setOutcome(option)} className={`min-h-11 rounded-full border px-5 text-[15px] transition-colors ${outcome === option ? 'border-[#2f6fed] bg-[#2f6fed] text-white hover:bg-[#2563d9]' : 'border-[#e6e4df] bg-white text-[#686968] hover:border-[#8b7cf6] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1a1a1a] [[data-theme=dark]_&]:text-[#c4c4c7]'}`}>{option}</button>)}</div></fieldset>
      </div>
      <ActionButton variant="primary" className="min-h-[52px] w-[min(100%,500px)] text-[16px] font-semibold" disabled={!experience || !outcome} onClick={() => startGenerating('review')}>See my route</ActionButton>
    </section>
  )

  if (stage === 'review') return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[720px] content-center justify-items-center gap-7 pb-10" aria-labelledby="custom-path-review-title">
      <div className="grid justify-items-center gap-3 text-center"><img className="size-14 object-contain" src="/assets/devy.svg" alt="" /><h1 id="custom-path-review-title" className="m-0 font-rethink-sans text-[32px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Review your route</h1><p className="m-0 text-[16px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">We selected what fits your goal and starting point.</p></div>
      <div className="grid w-full gap-6 rounded-3xl border border-[#404040] bg-[#1f1f1f] p-7 [[data-theme=light]_&]:border-[#e7e5e0] [[data-theme=light]_&]:bg-white"><div><span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Goal</span><p className="mt-2 mb-0 text-[16px] leading-[1.6] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.goal}</p></div><div><span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">Starting point</span><p className="mt-2 mb-0 text-[16px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{route.startingPoint}</p></div><div><span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">We’ll focus on</span><ul className="mt-3 grid list-none gap-2 p-0">{route.focus.map((item) => <li key={item} className="flex items-center gap-2 text-[16px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"><StatusIcon type="include" />{item}</li>)}</ul></div><div><span className="text-[12px] font-semibold uppercase tracking-[.1em] text-[#9a9a9d]">We’ll skip</span><ul className="mt-3 grid list-none gap-2 p-0">{route.skip.map((item) => <li key={item} className="flex items-center gap-2 text-[16px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]"><StatusIcon type="skip" />{item}</li>)}</ul></div></div>
      <div className="grid w-[min(100%,500px)] gap-4"><ActionButton variant="primary" className="min-h-[52px] text-[16px] font-semibold" onClick={() => setStage('ready')}>Looks good, create path</ActionButton><button type="button" onClick={() => setStage('details')} className="justify-self-center border-0 bg-transparent text-[15px] text-[#777] underline underline-offset-4 hover:text-[#2f6fed]">Adjust</button></div>
    </section>
  )

  return <section className="mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[720px] content-center justify-items-center gap-3" aria-labelledby="custom-path-title"><img className="size-12 object-contain" src="/assets/devy.svg" alt="" /><h1 id="custom-path-title" className="m-0 max-w-[26ch] text-center font-rethink-sans text-[clamp(22px,3vw,28px)] font-semibold leading-[1.15] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">What do you want to learn, build, or prepare for?</h1><div className="w-full"><label className="sr-only" htmlFor="custom-path-goal">Describe your learning goal</label><textarea id="custom-path-goal" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="For example: I want to prepare for a frontend role, get confident with React, and build a portfolio project for local businesses." className="min-h-24 w-full resize-y rounded-2xl border border-[#404040] bg-[#1a1a1a] p-4 text-[15px] leading-[1.5] text-[#f4f4f2] placeholder:text-[#89898e] outline-none focus:border-[#6699ec] focus:ring-2 focus:ring-[#6699ec]/30 [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800" /></div><div className="flex w-full flex-wrap justify-center gap-2" aria-label="Example learning goals">{EXAMPLES.map((example) => <button key={example} type="button" className="rounded-full border border-[#404040] bg-transparent px-3.5 py-2 text-[12.5px] text-[#c4c4c7] hover:border-[#6699ec] [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:text-[#686968]" onClick={() => setGoal(example)}>{example}</button>)}</div><ActionButton variant="primary" className="min-h-[50px] w-[min(100%,460px)] text-[15px] font-semibold" disabled={goal.trim().length < 8} onClick={() => startGenerating('details')}>Build my route</ActionButton></section>
}
