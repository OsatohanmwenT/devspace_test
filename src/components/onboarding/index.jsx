import { gsap } from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BRANCHES, branchTriage, roleSubQuiz, stackSubQuiz, startingPointOptions } from '../../data/onboarding';
import {
    buildProfile,
    explainPlacement,
    getBreakContent,
    getStageGroups,
    getStepOptions,
    getVisibleSteps,
    isMultiSelectStep,
    resolveBranch,
    resolveLadderKey,
    resolvePlacement,
    resolveRecommendedPlacement,
    resolveRole,
    STEP_ANSWER_KEY,
} from '../../lib/onboarding';
import { CASCADE, FAN, POP, reducedMotion, SWAP, useBuildIn } from '../../lib/onboardingMotion';
import { ActionButton } from '../ui/ActionButton';
import { DevyLottie } from '../ui/DevyLottie';
import GeneratingPath from './GeneratingPath';
import { StepFrame } from './motion/StepFrame';
import { WordReveal } from './motion/WordReveal';
import { ChipList, MiniIcon, OptionList, StepHeading } from './OnboardingStep';
import { StageCards } from './StageCards';

// Screens whose option set is long enough to benefit from a 2-column icon
// grid instead of a scanning a straight vertical list.
const GRID_LAYOUT_STEPS = new Set(['branch'])

const QUESTION_DEVY_CLIPS = {
  motivation: 'listening',
  branch: 'walk',
  branch_triage: 'walk',
  role: 'listening',
  role_sub_quiz: 'listening',
  stack: 'thinking',
  stack_sub_quiz: 'thinking',
  experience: 'thinking',
  javascript_experience: 'thinking',
  starting_point: 'walk',
  project_interest: 'walk',
  daily_time: 'walk',
}

// A tiny taste of what each branch actually looks like day-to-day — shown on
// the branch break screen so "AI & Automation it is" is backed by something
// concrete, the way Brilliant's onboarding shows a real code snippet instead
// of an icon. Three short, independent cards per branch (not one multi-line
// snippet) since only one faces the viewer at a time as they orbit. A line
// tagged `out()` renders as its own highlighted "result" row — a small
// terminal-style chip, the same idea as a REPL printing what the code above
// it produced — instead of just tinting the value inline like the rest.
const T = 'text-[#8b7cf6]' // keyword/verb tint
const V = 'text-[#4ade80]' // value/result tint
const code = (node) => ({ out: false, node })
const out = (node) => ({ out: true, node })
const BRANCH_ORBIT_CARDS = {
  web: [
    [code(<>&lt;<span className={T}>button</span> onClick={'{submit}'}&gt;</>), code(<>&nbsp;&nbsp;Send</>)],
    [code(<>fetch(<span className={V}>'/api/users'</span>)</>)],
    [code(<>useState(<span className={V}>0</span>)</>)],
  ],
  mobile: [
    [code(<><span className={T}>Navigator</span>.push(Profile())</>)],
    [code(<>onTap: () =&gt; like()</>)],
    [code(<>StatusBar.setStyle(<span className={V}>'light'</span>)</>)],
  ],
  backend: [
    [code(<><span className={T}>POST</span> /api/orders</>), out(<>201 Created</>)],
    [code(<><span className={T}>SELECT</span> * FROM users</>)],
    [code(<>cache.set(key, value)</>)],
  ],
  data: [
    [code(<><span className={T}>SELECT</span> avg(revenue)</>)],
    [code(<>df.groupby(<span className={V}>'region'</span>).sum()</>)],
    [code(<>chart.plot(x, y)</>)],
  ],
  ai: [
    [code(<>model.fit(training_data)</>)],
    [code(<>predict(image)</>), out(<>"cat" (98%)</>)],
    [code(<>automate(daily_report)</>)],
  ],
  product: [
    [code(<><span className={T}>As a</span> user, I want</>), code(<>faster checkout.</>)],
    [code(<>Impact: <span className={V}>High</span> · Effort: Low</>)],
    [code(<>Sprint 12 — 8 stories</>)],
  ],
  marketing: [
    [code(<><span className={T}>A/B test</span>: Subject A</>), out(<>open rate 34% ↑</>)],
    [code(<>segment: age 18–24</>)],
    [code(<>CTR: 2.4%</>), out(<>3.1% ↑</>)],
  ],
  content_media: [
    [code(<>00:12 — cut to B-roll</>)],
    [code(<>caption: "wait for it…"</>)],
    [code(<>publish: Tue 9am</>)],
  ],
  design: [
    [code(<>spacing: <span className={V}>8px</span></>)],
    [code(<>radius: <span className={V}>12px</span></>)],
    [code(<>contrast: <span className={V}>4.6:1 ✓</span></>)],
  ],
  cloud: [
    [code(<><span className={T}>docker build</span> .</>)],
    [code(<>kubectl apply -f api.yaml</>)],
    [code(<>uptime()</>), out(<>99.98%</>)],
  ],
}

// Cards stay facing the learner as they travel around one central Devy. The
// wrapper clips at its own edge (`overflow-hidden`) so a card mid-swing never
// spills past the break screen into whatever sits below it.
//
// Entrance is P4 (card fan): each card's *inner* face pops in from a tilted,
// shrunken state while its *outer* orbit track holds still — the CSS orbit
// keyframes own the outer transform, so the fan can't also live there. The
// orbit only starts travelling once the last card has landed.
function BranchOrbit({ branch }) {
  const cards = BRANCH_ORBIT_CARDS[branch]
  const rootRef = useRef(null)
  const [fanned, setFanned] = useState(() => reducedMotion())

  useLayoutEffect(() => {
    if (!rootRef.current || !cards || reducedMotion()) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-orbit-face]', {
        autoAlpha: 0,
        scale: FAN.scaleFrom,
        rotate: (index) => (index - 1) * FAN.angle * 1.4,
        y: FAN.rise,
        duration: FAN.duration,
        ease: FAN.ease,
        stagger: FAN.stagger,
        delay: 0.25,
        onComplete: () => setFanned(true),
      })
    }, rootRef)

    return () => context.revert()
  }, [cards])

  if (!cards) return null

  return (
    <div ref={rootRef} className="relative mx-auto h-[230px] w-full max-w-[420px] overflow-hidden [--orbit-radius:clamp(70px,22vw,130px)]" aria-hidden="true">
      <div className="absolute inset-0">
        {cards.map((lines, i) => (
          <div
            key={i}
            className="devy-orbit-card absolute left-1/2 top-1/2 w-[136px]"
            style={{ animationDelay: `${-i * 6}s`, animationPlayState: fanned ? 'running' : 'paused' }}
            aria-hidden="true"
          >
            <div data-orbit-face className="onb-card onb-card--raised overflow-hidden rounded-lg text-left font-mono text-[11px] leading-[1.5]">
              <div className="px-2.5 py-2 text-[#e4e4e6] [[data-theme=light]_&]:text-[#34343a]">
                {lines.filter((line) => !line.out).map((line, j) => <div key={j}>{line.node}</div>)}
              </div>
              {lines.filter((line) => line.out).map((line, j) => (
                <div key={j} className="border-t border-[#2c3a2e] bg-[#132318] px-2.5 py-1.5 text-[#4ade80] [[data-theme=light]_&]:border-[#cdeed6] [[data-theme=light]_&]:bg-[#eafcee] [[data-theme=light]_&]:text-[#1a8a4c]">
                  <p className="m-0 text-[9px] font-semibold uppercase tracking-[.08em] opacity-70">Output</p>
                  {line.node}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div data-break-devy className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
        <span aria-hidden="true" className="devy-thought-glow absolute inset-0 -z-10 rounded-full bg-[#6699ec]/25 blur-2xl [[data-theme=light]_&]:bg-[#6699ec]/30" />
        <DevyLottie clip="thinking" className="relative h-28 w-28" />
      </div>
    </div>
  )
}

const COPY = {
  motivation: { title: 'What brings you here?', subtitle: 'This shapes the examples we use, not what you can access.' },
  branch: { title: 'Which area feels closest to what you want to do?', subtitle: 'You can change this later — nothing here locks you in.' },
  branch_triage: { title: branchTriage.prompt, subtitle: 'Pick whichever sounds most appealing. We’ll work out the rest.' },
  role: { title: 'Which of these sounds most like you?', subtitle: 'Not sure? Pick “Help me choose” and we’ll ask a different way.' },
  stack: { title: 'Which would you like to focus on?', subtitle: 'Not sure? Pick “Help me choose” and we’ll ask a different way.' },
  experience: { title: 'Where are you starting from?', subtitle: 'Be honest — it only affects where we begin, not what you can reach.' },
  javascript_experience: { title: 'How familiar are you with JavaScript?', subtitle: 'This helps us decide whether it is useful to choose a framework yet.' },
  starting_point: { title: 'Where would you like to start?', subtitle: 'Skip ahead if the early material is already familiar.' },
  project_interest: { title: 'What would make learning feel worth it?', subtitle: 'We’ll lean on this for project examples.' },
  immediate_need: { title: 'What should Devspace help with first?', subtitle: 'This sets what we surface on your home screen.' },
  daily_time: { title: 'How long do you want to learn each day?', subtitle: 'This sets your daily goal. You can change it any time.' },
}

export default function OnboardingView({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  // +1 when moving forward, -1 when going back — the step swap (P1) scales
  // the incoming screen from the opposite side so "back" feels like stepping
  // out rather than pressing further in.
  const [direction, setDirection] = useState(1)
  const [isRouteAssessment, setIsRouteAssessment] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const scrollRef = useRef(null)

  const steps = getVisibleSteps(answers)
  const step = steps[Math.min(index, steps.length - 1)]
  const answerKey = STEP_ANSWER_KEY[step.id]
  const value = answerKey ? answers[answerKey] : undefined
  const options = getStepOptions(step.id, answers)
  const breakContent = step.type === 'break' ? getBreakContent(step.questionId, answers) : null
  const branch = resolveBranch(answers)
  const role = resolveRole(answers)
  const placement = resolvePlacement(answers)
  const recommendedPlacement = resolveRecommendedPlacement(answers)
  const ladderStages = startingPointOptions[resolveLadderKey(answers)]?.filter((stage) => stage.value !== 'not_sure') ?? []

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useEffect(() => {
    const scrollArea = scrollRef.current
    if (!scrollArea) return undefined

    const updateScrollHint = () => {
      setShowScrollHint(scrollArea.scrollHeight - scrollArea.clientHeight - scrollArea.scrollTop > 12)
    }

    const frame = window.requestAnimationFrame(updateScrollHint)
    const observer = new ResizeObserver(updateScrollHint)
    observer.observe(scrollArea)
    scrollArea.addEventListener('scroll', updateScrollHint, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      scrollArea.removeEventListener('scroll', updateScrollHint)
    }
  }, [step.id, isGenerating, isRouteAssessment])

  useEffect(() => {
    if (step.id === 'starting_point' && !answers.startingPoint && placement) {
      setAnswers((current) => ({ ...current, startingPoint: placement.value }))
    }
  }, [answers.startingPoint, placement, step.id])

  const select = (nextValue) => {
    setAnswers((current) => {
      if (!isMultiSelectStep(step.id)) return { ...current, [answerKey]: nextValue }
      const chosen = current[answerKey] ?? []
      return {
        ...current,
        [answerKey]: chosen.includes(nextValue)
          ? chosen.filter((item) => item !== nextValue)
          : [...chosen, nextValue],
      }
    })
  }

  const goNext = () => {
    setDirection(1)
    setIndex((current) => Math.min(current + 1, getVisibleSteps(answers).length - 1))
  }
  const goBack = () => {
    setDirection(-1)
    setIsRouteAssessment(false)
    setIndex((current) => Math.max(current - 1, 0))
  }
  const changePath = () => {
    setDirection(-1)
    setIsRouteAssessment(false)
    setAnswers(({ branch, branchFromTriage, role, roleFromSubQuiz, stack, stackFromSubQuiz, experience, javascriptExperience, startingPoint, ...current }) => current)
    setIndex(3)
  }

  // The decisive path off the placement screen: accept the recommendation
  // outright and skip past the explicit route-review step (and its break
  // screen) rather than making the learner inspect and reconfirm what was
  // just recommended. "Review your full route" and the options tucked behind
  // "This doesn't feel right" are what still reach that review screen.
  const acceptPlacement = (placementValue) => {
    const nextAnswers = { ...answers, startingPoint: placementValue }
    setAnswers(nextAnswers)
    setDirection(1)
    setIndex((current) => {
      const nextSteps = getVisibleSteps(nextAnswers)
      let next = current + 1
      while (nextSteps[next] && (nextSteps[next].id === 'starting_point' || nextSteps[next].id === 'starting_point_break')) next += 1
      return Math.min(next, nextSteps.length - 1)
    })
  }

  const reviewRoute = () => {
    setIsRouteAssessment(false)
    goNext()
  }

  const isChoice = Boolean(answerKey)
  const isBreak = step.type === 'break'
  const isPathPreview = isBreak && Boolean(role) && (step.questionId === 'role' || step.questionId === 'role_sub_quiz')
  const isFrontend = role === 'frontend_developer'
  const isPlacementRecommendation = isBreak && Boolean(placement) && (
    (!isFrontend && step.questionId === 'experience')
    || (isFrontend && answers.javascriptExperience === 'new_to_javascript' && step.questionId === 'javascript_experience')
    || (isFrontend && answers.javascriptExperience !== 'new_to_javascript' && (
      (step.questionId === 'stack' && answers.stack !== 'help_me_choose')
      || (step.questionId === 'stack_sub_quiz' && answers.stack === 'help_me_choose')
    ))
  )
  const isMulti = isMultiSelectStep(step.id)
  const canAdvance = !isChoice || (isMulti ? (value?.length ?? 0) > 0 : value !== undefined)
  const isLast = step.id === 'daily_time_break'
  // Layout that depends on which screen is showing — the footer, the grid
  // rows, and how <main> aligns its content — is keyed off the screen that's
  // actually on stage, not the step state. Otherwise the frame re-lays out
  // the instant Continue is pressed, while the old screen is still playing
  // its exit, and the content visibly jumps as if the page had scrolled.
  const wantedLayout = {
    isWelcome: step.id === 'welcome',
    hasFooter: step.id !== 'welcome' && !isPlacementRecommendation && !isRouteAssessment && !isGenerating,
    mainAlign: isGenerating
      ? 'content-center'
      : isPathPreview
        ? 'content-end pb-28'
        : isRouteAssessment
          ? 'content-start sm:content-center'
          : isChoice && step.id !== 'starting_point' && step.id !== 'project_interest' && step.id !== 'daily_time'
            ? 'content-start pt-10 max-[680px]:pt-6'
            : 'content-center pt-8',
  }
  const wantedLayoutRef = useRef(wantedLayout)
  wantedLayoutRef.current = wantedLayout
  const [layout, setLayout] = useState(wantedLayout)
  const hasFooter = layout.hasFooter

  // The footer CTA lights up (one sheen) the first time an answer makes it
  // usable on a given step — not on every re-render, and not on break
  // screens where it was never disabled.
  const [litStep, setLitStep] = useState(null)
  useEffect(() => {
    if (isChoice && canAdvance && litStep !== step.id) setLitStep(step.id)
    if (!isChoice) setLitStep(null)
  }, [isChoice, canAdvance, step.id, litStep])
  const ctaLit = isChoice && canAdvance && litStep === step.id

  // The progress bar's leading edge flashes after each move; re-keying the
  // attribute restarts the one-shot animation.
  const [progressMove, setProgressMove] = useState(0)
  useEffect(() => { setProgressMove((current) => current + 1) }, [index])

  const primaryLabel = step.id === 'welcome'
    ? 'Let’s go'
    : step.id === 'starting_point'
      ? 'Continue with this route'
      : isLast ? 'Start learning' : 'Continue'
  const onPrimary = isLast ? () => setIsGenerating(true) : goNext

  // What the step swap keys on: a different step, entering/leaving the route
  // test, or the generating screen all count as a new screen.
  const screenKey = isGenerating ? 'generating' : `${step.id}${isRouteAssessment ? ':test' : ''}`

  return (
    <section className={`fixed inset-0 z-30 grid overflow-hidden bg-[#121214] [[data-theme=light]_&]:bg-[#fafaf8] ${layout.isWelcome ? 'grid-rows-[56px_minmax(0,1fr)]' : 'grid-rows-[56px_minmax(0,1fr)_96px]'}`} aria-label="Set up your learning">
      <header className="flex items-center gap-4 px-6 max-[680px]:px-4">
        <button
          type="button"
          className="grid h-10 w-10 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#9a9a9d] disabled:opacity-30 hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
          onClick={goBack}
          disabled={index === 0 || isGenerating}
          aria-label="Previous step"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#eeeeeb]"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <div key={progressMove} data-moved={progressMove > 1 ? '' : undefined} className="onb-progress-fill h-full rounded-full bg-[#6699ec]" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <main ref={scrollRef} className={`scrollbar-hidden grid min-w-0 justify-items-center overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable] px-6 py-8 max-[680px]:px-4 ${layout.mainAlign}`}>
        <StepFrame stepKey={screenKey} direction={direction} onExitComplete={() => { setLayout(wantedLayoutRef.current); scrollRef.current?.scrollTo({ top: 0 }) }} className="grid w-full min-w-0 max-w-full justify-items-center gap-6">
          {isGenerating && (
            <GeneratingPath
              onDone={() => onComplete(buildProfile(answers))}
            />
          )}

          {!isGenerating && step.id === 'welcome' && (
            <WelcomeScreen onPrimary={onPrimary} primaryLabel={primaryLabel} />
          )}

          {isPathPreview && (
            <RoleReveal role={roleLabel(branch, role)} stages={ladderStages} />
          )}

          {isPlacementRecommendation && (
            <PlacementRecommendation
              placement={placement}
              roleLabel={roleLabel(branch, role)}
              explanation={explainPlacement(answers, placement, roleLabel(branch, role))}
              onStartLearning={() => acceptPlacement(placement.value)}
              onReviewRoute={reviewRoute}
              onChangeCareer={changePath}
              onTestLevel={() => { goNext(); setIsRouteAssessment(true) }}
            />
          )}

          {!isGenerating && isBreak && breakContent && !isPathPreview && !isPlacementRecommendation && (
            <BreakScreen
              key={step.id}
              message={breakContent.message}
              insight={breakContent.insight}
              snippet={(step.questionId === 'branch' || step.questionId === 'branch_triage') && branch ? <BranchOrbit branch={branch} /> : null}
            />
          )}

          {step.id === 'starting_point' && (
            <RouteReview
              groups={getStageGroups(options)}
              notSureOption={options.find((option) => option.value === 'not_sure')}
              value={value}
              placement={recommendedPlacement}
              branch={branch}
              onSelect={select}
              isTesting={isRouteAssessment}
              onTestingChange={setIsRouteAssessment}
            />
          )}

          {isChoice && step.id !== 'starting_point' && (
            <QuestionScreen stepId={step.id}>
              <StepHeading
                title={step.id === 'role_sub_quiz'
                  ? roleSubQuiz[branch]?.prompt ?? ''
                  : step.id === 'stack_sub_quiz'
                    ? stackSubQuiz[role]?.prompt ?? ''
                    : COPY[step.id]?.title ?? ''}
                subtitle={step.id === 'role_sub_quiz' || step.id === 'stack_sub_quiz'
                  ? 'Pick whichever sounds more like you — there’s no wrong answer.'
                  : isMulti ? 'Select all that apply.' : COPY[step.id]?.subtitle}
                devyClip={QUESTION_DEVY_CLIPS[step.id]}
              />
              {step.id === 'project_interest'
                ? <ChipList options={options} value={value} onSelect={select} />
                : <OptionList options={options} value={value} onSelect={select} layout={GRID_LAYOUT_STEPS.has(step.id) ? 'grid' : 'list'} />}
            </QuestionScreen>
          )}
        </StepFrame>
      </main>

      {/* When a list runs past the fold, the bottom edge is genuinely blurred
          (not just faded) so the last visible rows read as a crowd with more
          behind it — the blur ramps in through the mask, so it never draws
          a hard line across an option. */}
      {showScrollHint && <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 z-10 h-28 bg-[linear-gradient(to_bottom,rgba(18,18,20,0)_0%,rgba(18,18,20,.35)_55%,rgba(18,18,20,.85)_100%)] backdrop-blur-[5px] [mask-image:linear-gradient(to_bottom,transparent,black_60%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_60%)] [[data-theme=light]_&]:bg-[linear-gradient(to_bottom,rgba(250,250,248,0)_0%,rgba(250,250,248,.35)_55%,rgba(250,250,248,.85)_100%)] ${hasFooter ? 'bottom-24' : 'bottom-0'}`} />}

      {hasFooter && <footer className="flex items-center justify-center px-6 pb-5 max-[680px]:px-4">
        <ActionButton
          key={ctaLit ? `${step.id}-lit` : step.id}
          variant="primary"
          className={`w-[min(100%,520px)] min-h-[52px] text-[15px] font-medium ${ctaLit ? 'onb-cta-lit' : ''}`}
          onClick={onPrimary}
          disabled={!canAdvance}
        >
          {primaryLabel}
        </ActionButton>
      </footer>}
    </section>
  )
}

// Every question screen: the heading pops in as one unit, then the options
// arrive with a light stagger — the one place order earns a cascade. The
// `data-build` marks live on StepHeading / OptionList / ChipList; the
// heading is scoped by its own wrapper so the two runs don't overlap.
function QuestionScreen({ stepId, children }) {
  const [heading, options] = Array.isArray(children) ? children : [children, null]
  const headingRef = useRef(null)
  const optionsRef = useRef(null)
  useBuildIn(headingRef, [stepId])
  useBuildIn(optionsRef, [stepId], { mode: 'cascade', delay: 0.12 })
  return (
    <div className="grid w-full justify-items-center gap-6">
      <div ref={headingRef} className="grid w-full justify-items-center">{heading}</div>
      <div ref={optionsRef} className="grid w-full justify-items-center">{options}</div>
    </div>
  )
}

// Vertical, centred: the one genuinely celebratory moment in the flow, so it
// gets the bigger bounce rather than the everyday pop — Devy, title, copy and
// CTA arrive together as one springy block. (A fanned stack of teaser cards
// was tried here and parked — see TeaserCards.jsx.)
function WelcomeScreen({ onPrimary, primaryLabel }) {
  const rootRef = useRef(null)
  useBuildIn(rootRef, [], { mode: 'bounce' })

  return (
    <div ref={rootRef} className="grid justify-items-center gap-5 self-center text-center">
      <span data-build data-build-order="0">
        <DevyLottie clip="wave" ariaLabel="Devy" className="h-40 w-40" />
      </span>
      <h1 data-build data-build-order="1" className="m-0 max-w-[22ch] font-rethink-sans text-[clamp(30px,4vw,40px)] font-medium leading-[1.15] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        Let’s set up your learning
      </h1>
      <p data-build data-build-order="2" className="m-0 max-w-[48ch] text-[16px] leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        A few quick questions so Devspace knows what you want, where to start, and what examples will feel relevant.
      </p>
      <span data-build data-build-order="3" className="w-[min(100%,520px)] max-w-[46ch]">
        <ActionButton
          variant="primary"
          className="mt-3 w-full min-h-[52px] text-[15px] font-medium"
          onClick={onPrimary}
        >
          {primaryLabel}
        </ActionButton>
      </span>
    </div>
  )
}

// The role reveal — "{role} it is." over a row of illustrated stage cards, so
// the choice is backed by what the route actually teaches. The carousel below
// already scans itself into place, so the heading just materialises (scale,
// no travel) rather than adding a second directional motion to watch.
// (A fuller tinted path card exists in PathCard.jsx, parked for later.)
function RoleReveal({ role, stages }) {
  const rootRef = useRef(null)
  useBuildIn(rootRef, [role], { mode: 'scale' })

  return (
    <div ref={rootRef} className="grid w-full max-w-[620px] justify-items-center gap-6 self-end text-center">
      <div className="grid justify-items-center gap-2">
        <p data-build data-build-order="0" className="m-0 text-sm font-medium text-[#6699ec]">Your learning path</p>
        <h1 className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          <WordReveal text={`${role} it is.`} delay={CASCADE.stagger} />
        </h1>
        <p data-build data-build-order="2" className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Here’s a quick view of the skills you’ll build, step by step.</p>
      </div>
      <StageCards stages={stages} label={`${role} learning path`} />
    </div>
  )
}

// Reveals `text` a character at a time, like Duolingo's onboarding bubbles —
// skipped entirely for reduced-motion, where the full line just appears.
function useTypewriter(text, speed = 18) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text)
      return undefined
    }

    setShown('')
    let index = 0
    const id = window.setInterval(() => {
      index += 1
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(id)
    }, speed)

    return () => window.clearInterval(id)
  }, [text, speed])

  return shown
}

function BreakScreen({ message, insight, snippet }) {
  const rootRef = useRef(null)
  const typed = useTypewriter(message)
  const isTyping = typed.length < message.length
  // A brief scale-bump the instant typing finishes — a small "there, said it"
  // payoff so the moment reads as a beat rather than a timer just running out.
  const [justFinished, setJustFinished] = useState(false)

  useEffect(() => {
    if (isTyping || !message) return undefined
    setJustFinished(true)
    const timer = window.setTimeout(() => setJustFinished(false), 280)
    return () => window.clearTimeout(timer)
  }, [isTyping, message])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      // Devy pops in with an overshoot, the bubble follows a beat behind with
      // its own — the second bounce reads as "he just said something",
      // instead of both fading up together as one flat block.
      const timeline = gsap.timeline()
      timeline
        .from('[data-break-devy]', { autoAlpha: 0, scale: 0.5, y: 16, duration: 0.5, ease: 'back.out(1.9)' })
        .from('[data-break-bubble]', { autoAlpha: 0, scale: 0.8, x: -12, duration: 0.4, ease: 'back.out(2.2)' }, '-=0.22')
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <div ref={rootRef} className="grid w-full max-w-[560px] justify-items-center gap-4 self-center">
      <div className="flex w-full items-end justify-center gap-3">
        {!snippet && <div className="relative flex-none">
          <span aria-hidden="true" className="devy-thought-glow absolute inset-0 -z-10 rounded-full bg-[#6699ec]/25 blur-2xl [[data-theme=light]_&]:bg-[#6699ec]/30" />
          <DevyLottie data-break-devy clip="thinking" className="relative h-24 w-24" />
        </div>}
        <div
          data-break-bubble
          className={`onb-card onb-card--raised relative max-w-[320px] rounded-2xl rounded-bl-md px-4 py-3 text-left text-[17px] font-medium leading-[1.4] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 ${justFinished ? 'devy-bubble-pop' : ''}`}
          role="status"
        >
          <span className="sr-only">{message}</span>
          <span aria-hidden="true">{typed}{isTyping && <span className="devy-caret" />}</span>
        </div>
      </div>
      {snippet && <div className="w-full">{snippet}</div>}
      {insight && (
        <p
          className={`m-0 max-w-[60ch] text-center text-[15px] leading-[1.5] text-[#9a9a9d] transition-[opacity,transform] duration-300 ease-out [[data-theme=light]_&]:text-[#686968] ${isTyping ? 'translate-y-1.5 opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          {insight}
        </p>
      )}
    </div>
  )
}

// Kept deliberately small: one recommendation, one reason, one decisive
// action. The corrections (test my level / pick a different stage / change
// career) still exist, but tucked behind "This doesn't feel right" rather
// than sitting next to the primary action asking to be second-guessed.
function PlacementRecommendation({ placement, roleLabel, explanation, onStartLearning, onReviewRoute, onChangeCareer, onTestLevel }) {
  const [showOptions, setShowOptions] = useState(false)
  const rootRef = useRef(null)
  useBuildIn(rootRef, [placement?.value])

  return (
    <div ref={rootRef} className="grid w-full max-w-[420px] justify-items-center gap-2.5 self-center text-center">
      <span data-build data-build-order="0"><DevyLottie clip="wave" ariaLabel="Devy" className="mb-1 h-24 w-24" /></span>
      <p data-build data-build-order="1" className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Your recommended start</p>
      <h1 data-build data-build-order="2" className="m-0 max-w-[22ch] font-rethink-sans text-[clamp(24px,3vw,30px)] font-medium leading-[1.2] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
        Start with <span className="text-[#6699ec]">{placement.label}</span>
      </h1>
      <p data-build data-build-order="3" className="m-0 max-w-[40ch] text-[14px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
        {explanation ? `${explanation.rungSummary}, ${explanation.tail}` : 'Based on your experience, this is the best place to begin.'}
      </p>

      <p data-build data-build-order="4" className="m-0 mt-0.5 text-[13px] font-medium text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
        {roleLabel} · {placement.label}
      </p>

      <span data-build data-build-order="6" className="w-full">
        <ActionButton variant="primary" className="mt-3 min-h-[52px] w-full text-[15px] font-semibold" onClick={onStartLearning}>
          Start learning →
        </ActionButton>
      </span>

      <div data-build data-build-order="7" className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={onReviewRoute}>Review your full route</button>
        <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => setShowOptions((current) => !current)} aria-expanded={showOptions}>This doesn’t feel right</button>
      </div>

      <AnimatePresence initial={false}>
        {showOptions && (
          <motion.div
            className="w-full overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: SWAP.ease }}
          >
            <div className="mt-1 grid w-full gap-1 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-1.5 text-left [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
              <button type="button" className="min-h-11 rounded-xl border-0 bg-transparent px-3.5 text-left text-sm font-medium text-[#f4f4f2] hover:bg-[#262626] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f5f5]" onClick={onTestLevel}>Test my level</button>
              <button type="button" className="min-h-11 rounded-xl border-0 bg-transparent px-3.5 text-left text-sm font-medium text-[#f4f4f2] hover:bg-[#262626] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f5f5]" onClick={onReviewRoute}>Choose a different starting point</button>
              <button type="button" className="min-h-11 rounded-xl border-0 bg-transparent px-3.5 text-left text-sm font-medium text-[#f4f4f2] hover:bg-[#262626] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f5f5]" onClick={onChangeCareer}>Change career</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Keyed by branch rather than by role or stage — enough to keep the quiz on
// topic without authoring a separate bank for every one of the ~40 roles.
const BRANCH_TEST_QUESTIONS = {
  web: [
    { prompt: 'Which HTML element should wrap a page’s main navigation links?', options: ['<nav>', '<div>', '<footer>', '<span>'], answer: 0 },
    { prompt: 'Which CSS layout mode arranges items in a single row or column?', options: ['Flexbox', 'Float', 'Position: absolute', 'Table layout'], answer: 0 },
    { prompt: 'What does the DOM represent?', options: ['The server’s file system', 'The page as a tree of nodes', 'The site’s CSS rules', 'A JSON API response'], answer: 1 },
  ],
  mobile: [
    { prompt: 'What lets an app move a user between screens?', options: ['A navigator / router', 'A stylesheet', 'A database', 'A build script'], answer: 0 },
    { prompt: 'What is “app state” most concerned with?', options: ['The colour scheme', 'Data that changes while the app runs', 'The app’s file size', 'The app icon'], answer: 1 },
    { prompt: 'Why do mobile apps call remote APIs?', options: ['To change the app icon', 'To fetch or send data over the network', 'To compile the code', 'To sign the app for release'], answer: 1 },
  ],
  backend: [
    { prompt: 'Which HTTP method is typically used to create a new resource?', options: ['GET', 'POST', 'DELETE', 'HEAD'], answer: 1 },
    { prompt: 'What does REST rely on to identify a resource?', options: ['A URL', 'A cookie only', 'A CSS class', 'A font'], answer: 0 },
    { prompt: 'What is the main job of a database index?', options: ['Encrypt the data', 'Speed up lookups', 'Format dates', 'Back up the table'], answer: 1 },
  ],
  data: [
    { prompt: 'Which SQL command reads data from a table?', options: ['SELECT', 'INSERT', 'DELETE', 'DROP'], answer: 0 },
    { prompt: 'What does a WHERE clause do in a query?', options: ['Sorts results', 'Filters matching records', 'Creates a new table', 'Renames a column'], answer: 1 },
    { prompt: 'What is the mean of a set of numbers?', options: ['The middle value', 'The most frequent value', 'The sum divided by the count', 'The largest value'], answer: 2 },
  ],
  ai: [
    { prompt: 'What does a Python function return when it has no return statement?', options: ['0', 'None', 'An empty string', 'It errors'], answer: 1 },
    { prompt: 'In machine learning, what is “training data” used for?', options: ['Testing the final model', 'Teaching the model patterns', 'Storing the app’s logs', 'Styling the output'], answer: 1 },
    { prompt: 'What does “overfitting” mean?', options: ['The model is too simple', 'The model fits training data well but generalises poorly', 'The dataset is too small to load', 'The code fails to run'], answer: 1 },
  ],
  product: [
    { prompt: 'What does a product roadmap primarily communicate?', options: ['Server uptime', 'What’s planned and roughly when', 'The company’s tax filings', 'Employee salaries'], answer: 1 },
    { prompt: 'What is a “user story” typically used for?', options: ['Describing a feature from the user’s perspective', 'Logging server errors', 'Naming a database table', 'Writing marketing copy'], answer: 0 },
    { prompt: 'What does prioritisation in product work usually balance?', options: ['Font choices', 'Impact against effort', 'Screen resolution', 'Server location'], answer: 1 },
  ],
  marketing: [
    { prompt: 'What does a marketing “funnel” describe?', options: ['A pricing model', 'The stages a customer moves through before converting', 'A file format', 'A type of ad blocker'], answer: 1 },
    { prompt: 'What is A/B testing used for?', options: ['Comparing two versions to see which performs better', 'Testing app crashes', 'Encrypting user data', 'Formatting emails'], answer: 0 },
    { prompt: 'What does “audience segmentation” mean?', options: ['Splitting a video into clips', 'Grouping people by shared traits to target messaging', 'Sorting files alphabetically', 'Blocking spam accounts'], answer: 1 },
  ],
  content_media: [
    { prompt: 'In video editing, what is a “cut” for?', options: ['Adding music', 'Joining or trimming clips together', 'Rendering the final export', 'Adjusting the microphone'], answer: 1 },
    { prompt: 'What does “pacing” refer to in content?', options: ['File size', 'The rhythm and speed at which a piece unfolds', 'The camera brand used', 'The upload schedule'], answer: 1 },
    { prompt: 'Why does a content creator plan a publishing schedule?', options: ['To keep audiences engaged consistently', 'To reduce video resolution', 'To avoid copyright law', 'To increase file compression'], answer: 0 },
  ],
  design: [
    { prompt: 'What is a wireframe primarily used for?', options: ['Final visual polish', 'Laying out structure before visual design', 'Writing code', 'Hosting a website'], answer: 1 },
    { prompt: 'What does “usability testing” evaluate?', options: ['Server response time', 'Whether real users can complete tasks easily', 'Code test coverage', 'Font licensing'], answer: 1 },
    { prompt: 'What is a design system meant to provide?', options: ['A single logo file', 'Reusable, consistent components and rules', 'A hosting plan', 'A marketing budget'], answer: 1 },
  ],
  cloud: [
    { prompt: 'What does a container (e.g. Docker) package together?', options: ['Only source code', 'An app and everything it needs to run', 'Just the database', 'A design file'], answer: 1 },
    { prompt: 'What is CI/CD primarily used for?', options: ['Automating building, testing, and deploying code', 'Designing UI components', 'Writing marketing copy', 'Managing employee schedules'], answer: 0 },
    { prompt: 'What does a firewall do?', options: ['Compress files', 'Control what network traffic is allowed through', 'Render web pages', 'Store passwords in plain text'], answer: 1 },
  ],
}

// Counts from 0 up to `target` over `duration` seconds — the score line on
// the assessment result ticks up rather than just stating the number.
function useCountUp(target, duration = 0.6) {
  const [shown, setShown] = useState(reducedMotion() ? target : 0)

  useEffect(() => {
    if (reducedMotion()) { setShown(target); return undefined }
    const counter = { value: 0 }
    const tween = gsap.to(counter, { value: target, duration, ease: 'power2.out', onUpdate: () => setShown(Math.round(counter.value)) })
    return () => tween.kill()
  }, [target, duration])

  return shown
}

// A result card — it materialises in place rather than rising in, so it
// reads as "here's what you got" settling into view, not arriving from off-page.
function AssessmentResult({ testResult, questions, onUse, onRetry }) {
  const rootRef = useRef(null)
  const score = useCountUp(testResult.score)
  useBuildIn(rootRef, [testResult.group.id], { mode: 'scale' })

  return (
    <div ref={rootRef} className="grid w-full max-w-[520px] justify-items-center gap-4 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6 text-center [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
      <p data-build data-build-order="0" className="m-0 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You got <span className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{score}</span> of {questions.length} correct.</p>
      <div data-build data-build-order="1">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Recommended start</p>
        <strong className="mt-1 block text-xl font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          {testResult.group.label}
        </strong>
        <p className="m-0 mt-1 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{testResult.group.stages.map((stage) => stage.label).join(' · ')}</p>
      </div>
      <span data-build data-build-order="2" className="w-full"><ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" onClick={onUse}>Use this starting point</ActionButton></span>
      <button data-build data-build-order="3" type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={onRetry}>Take the assessment again</button>
    </div>
  )
}

function RouteReview({ groups, notSureOption, value, placement, branch, onSelect, isTesting, onTestingChange }) {
  const [testGroup, setTestGroup] = useState(null)
  const [testAnswers, setTestAnswers] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [testQuestionIndex, setTestQuestionIndex] = useState(0)
  const [popping, setPopping] = useState(null)
  const rootRef = useRef(null)

  const questions = BRANCH_TEST_QUESTIONS[branch] ?? BRANCH_TEST_QUESTIONS.web

  // A group is selected either because the experience-based placement lands
  // inside it, or because the learner picked it directly — in which case
  // they start at that group's first stage rather than a stage they never saw.
  const selectGroup = (group) => {
    const withinPlacement = placement && group.stages.some((stage) => stage.value === placement.value)
    setPopping(group.id)
    onSelect(withinPlacement ? placement.value : group.stages[0].value)
  }

  useEffect(() => {
    if (popping === null) return undefined
    const timer = window.setTimeout(() => setPopping(null), POP.duration * 1000 + 20)
    return () => window.clearTimeout(timer)
  }, [popping])

  // Reaching testing mode without a group already chosen means the learner
  // jumped straight here from the placement screen — default to the
  // recommended group rather than showing a blank "this phase".
  useEffect(() => {
    if (isTesting && !testGroup) {
      const recommended = groups.find((group) => placement && group.stages.some((stage) => stage.value === placement.value))
      setTestGroup(recommended ?? groups[0] ?? null)
    }
  }, [isTesting])

  // The heading cascades, then the route draws itself top to bottom: each
  // row lands and the connector below it grows down to meet the next.
  useBuildIn(rootRef, [isTesting, testResult?.group.id ?? null, testQuestionIndex], { mode: isTesting ? 'pop' : 'cascade' })
  useLayoutEffect(() => {
    if (isTesting || !rootRef.current || reducedMotion()) return undefined
    const context = gsap.context(() => {
      gsap.from('[data-route-line]', {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 0.34,
        ease: 'power2.out',
        stagger: CASCADE.stagger,
        delay: CASCADE.stagger * 3 + 0.08,
      })
    }, rootRef)
    return () => context.revert()
  }, [isTesting])

  const finishTest = () => {
    const score = questions.reduce((total, question, index) => total + Number(testAnswers[index] === question.answer), 0)
    const currentIndex = Math.max(0, groups.findIndex((group) => group.id === testGroup?.id))
    const resultIndex = score === questions.length
      ? Math.min(currentIndex + 1, groups.length - 1)
      : score < questions.length - 1
        ? Math.max(currentIndex - 1, 0)
        : currentIndex
    setTestResult({ score, group: groups[resultIndex] })
  }

  if (isTesting) {
    return (
      <section ref={rootRef} className="grid w-full max-w-[620px] justify-items-center gap-5 self-center" aria-labelledby="route-test-title">
        <div className="grid justify-items-center gap-2 text-center">
          <p data-build data-build-order="0" className="m-0 text-sm font-medium text-[#6699ec]">{testResult ? 'Route placement' : 'Route assessment'}</p>
          <h1 data-build data-build-order="1" id="route-test-title" className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testResult ? 'Your recommended starting point' : `Test out of ${testGroup?.label ?? 'this phase'}`}</h1>
          <p data-build data-build-order="2" className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{testResult ? (testResult.score < questions.length - 1 ? 'A couple of these are worth another look, so we moved your starting point a bit earlier.' : 'Based on your answers, this is the best place to begin.') : `Answer ${questions.length} questions and we will place you at the right point in this route.`}</p>
        </div>
        {!testResult ? (
          <div className="grid w-full gap-3">
            <p data-build data-build-order="3" className="m-0 text-center text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Question {testQuestionIndex + 1} of {questions.length}</p>
            {/* Each question is its own screen inside the card: the swap runs
                on the card only, so the heading above stays put. */}
            <StepFrame stepKey={`q-${testQuestionIndex}`} className="w-full">
              <div role="group" aria-labelledby={`route-question-${testQuestionIndex}`} className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
                <p id={`route-question-${testQuestionIndex}`} className="m-0 px-1 text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testQuestionIndex + 1}. {questions[testQuestionIndex].prompt}</p>
                {questions[testQuestionIndex].options.map((option, optionIndex) => {
                  const selected = testAnswers[testQuestionIndex] === optionIndex
                  return <button key={option} type="button" className={`min-h-11 rounded-xl border px-4 text-left text-sm font-medium transition-colors ${selected ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] bg-[#262626] text-[#f4f4f2] hover:border-[#6699ec] [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'} focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]`} aria-pressed={selected} onClick={() => {
                    setTestAnswers((current) => {
                      const next = [...current]
                      next[testQuestionIndex] = optionIndex
                      return next
                    })
                    if (testQuestionIndex < questions.length - 1) setTestQuestionIndex((current) => current + 1)
                  }}>{option}</button>
                })}
              </div>
            </StepFrame>
            {testQuestionIndex === questions.length - 1 && <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" disabled={testAnswers.length !== questions.length || testAnswers.some((answer) => answer === undefined)} onClick={finishTest}>See my route placement</ActionButton>}
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => { onTestingChange(false); setTestAnswers([]); setTestQuestionIndex(0) }}>Back to route options</button>
          </div>
        ) : (
          <AssessmentResult
            testResult={testResult}
            questions={questions}
            onUse={() => { onSelect(testResult.group.stages[0].value); onTestingChange(false) }}
            onRetry={() => { setTestResult(null); setTestAnswers([]); setTestQuestionIndex(0) }}
          />
        )}
      </section>
    )
  }

  const recommendedGroup = placement && groups.find((group) => group.stages.some((stage) => stage.value === placement.value))
  const selectedGroup = groups.find((group) => group.stages.some((stage) => stage.value === value))
  const hasMovedOffRecommendation = recommendedGroup && selectedGroup && selectedGroup.id !== recommendedGroup.id

  return (
    <div ref={rootRef} className="grid w-full max-w-[620px] justify-items-center gap-5 self-center text-center">
      <div className="grid justify-items-center gap-2">
        <p data-build data-build-order="0" className="m-0 text-sm font-medium text-[#6699ec]">Your learning route</p>
        <h1 data-build data-build-order="1" className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Review your starting route</h1>
        <p data-build data-build-order="2" className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {hasMovedOffRecommendation
            ? `You moved your start from ${recommendedGroup.label}. You can switch back any time.`
            : 'Choose which phase to begin in. You can always return to earlier lessons later.'}
        </p>
      </div>
      <div className="onb-option-group grid w-full" role="group" aria-label="Choose your starting phase" data-just-selected={popping !== null ? '' : undefined}>
        {groups.map((group, index) => {
          const selected = group.stages.some((stage) => stage.value === value)
          const isRecommended = placement && group.stages.some((stage) => stage.value === placement.value)
          const isLast = index === groups.length - 1
          return (
            <div key={group.id} className={`flex items-stretch gap-3 ${isLast ? '' : 'pb-2.5'}`} data-selected={selected ? '' : undefined}>
              {/* The marker column stretches to the row's full height (card content
                  determines that height), so the connecting line — filling the
                  leftover space below the circle — always reaches the next marker
                  regardless of how many stages a group lists. */}
              <div className="flex flex-none flex-col items-center">
                <span data-build data-build-order={3 + index} className={`grid size-7 flex-none place-items-center rounded-full text-[12px] font-semibold transition-colors ${selected ? 'bg-[#5c49c9] text-white' : 'border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`} aria-hidden="true">
                  {selected
                    ? <motion.svg key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 22 }} className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 9.5 17 19 7" /></motion.svg>
                    : index + 1}
                </span>
                {!isLast && <span data-route-line className="mt-1 w-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]" aria-hidden="true" />}
              </div>
              <div data-build data-build-order={3 + index} className={`min-w-0 flex-1 rounded-xl border p-3.5 text-left transition-colors ${selected ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e0e0dc] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'} ${popping === group.id ? 'onb-select-pop' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" aria-pressed={selected} onClick={() => selectGroup(group)}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{group.label}</span>
                      {isRecommended && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${selected ? 'bg-white/20' : 'bg-[#8b7cf6]/15 text-[#8b7cf6]'}`}>Recommended</span>}
                    </span>
                    <span className={`mt-0.5 block text-[13px] ${selected ? 'text-white/70' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}>{group.stages.map((stage) => stage.label).join(' · ')}</span>
                  </button>
                  <button type="button" className={`flex-none rounded-md px-1 py-0.5 text-[12px] font-medium underline underline-offset-2 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] ${selected ? 'text-white/70 hover:text-white' : 'text-[#8b8b90] [[data-theme=light]_&]:text-[#8a8a8d] hover:text-[#6699ec]'}`} onClick={() => { setTestGroup(group); setTestAnswers([]); setTestResult(null); setTestQuestionIndex(0); onTestingChange(true) }}>Test out</button>
                </div>
              </div>
            </div>
          )
        })}
        {notSureOption && (
          <div className="flex items-stretch gap-3 pt-1" data-selected={value === notSureOption.value ? '' : undefined}>
            <div className="w-7 flex-none" aria-hidden="true" />
            <button
              type="button"
              data-build
              data-build-order={3 + groups.length}
              className={`min-h-14 min-w-0 flex-1 rounded-xl border px-4 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] ${value === notSureOption.value ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e0e0dc] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'} ${popping === 'not_sure' ? 'onb-select-pop' : ''}`}
              aria-pressed={value === notSureOption.value}
              onClick={() => { setPopping('not_sure'); onSelect(notSureOption.value) }}
            >
              {notSureOption.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function roleLabel(branch, role) {
  const fromBranch = BRANCHES.some((item) => item.value === branch)
  if (!fromBranch) return role
  return getStepOptions('role', { branch }).find((option) => option.value === role)?.label ?? role
}
