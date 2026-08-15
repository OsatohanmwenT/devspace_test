import { useEffect, useState } from 'react';
import { BRANCHES, branchTriage, roleSubQuiz, startingPointOptions } from '../../data/onboarding';
import { getPath } from '../../data/paths';
import {
    buildProfile,
    getBreakContent,
    getStepOptions,
    getVisibleSteps,
    isMultiSelectStep,
    resolveBranch,
    resolvePlacement,
    resolveRole,
    STEP_ANSWER_KEY,
} from '../../lib/onboarding';
import { ActionButton } from '../ui/ActionButton';
import GeneratingPath from './GeneratingPath';
import { ChipList, OptionIcon, OptionList, StepHeading } from './OnboardingStep';

const COPY = {
  motivation: { title: 'What brings you here?', subtitle: 'This shapes the examples we use, not what you can access.' },
  branch: { title: 'Which area feels closest to what you want to do?', subtitle: 'You can change this later — nothing here locks you in.' },
  branch_triage: { title: branchTriage.prompt, subtitle: 'Pick whichever sounds most appealing. We’ll work out the rest.' },
  role: { title: 'Which of these sounds most like you?', subtitle: 'Not sure? Pick “Help me choose” and we’ll ask a different way.' },
  experience: { title: 'Where are you starting from?', subtitle: 'Be honest — it only affects where we begin, not what you can reach.' },
  starting_point: { title: 'Where would you like to start?', subtitle: 'Skip ahead if the early material is already familiar.' },
  project_interest: { title: 'What would make learning feel worth it?', subtitle: 'We’ll lean on this for project examples.' },
  immediate_need: { title: 'What should Devspace help with first?', subtitle: 'This sets what we surface on your home screen.' },
  daily_time: { title: 'How long do you want to learn each day?', subtitle: 'This sets your daily goal. You can change it any time.' },
}

export default function OnboardingView({ onComplete }) {
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [isRouteAssessment, setIsRouteAssessment] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = getVisibleSteps(answers)
  const step = steps[Math.min(index, steps.length - 1)]
  const answerKey = STEP_ANSWER_KEY[step.id]
  const value = answerKey ? answers[answerKey] : undefined
  const options = getStepOptions(step.id, answers)
  const breakContent = step.type === 'break' ? getBreakContent(step.questionId, answers) : null
  const branch = resolveBranch(answers)
  const role = resolveRole(answers)
  const placement = resolvePlacement(answers)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

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

  const goNext = () => setIndex((current) => Math.min(current + 1, getVisibleSteps(answers).length - 1))
  const goBack = () => {
    setIsRouteAssessment(false)
    setIndex((current) => Math.max(current - 1, 0))
  }
  const changePath = () => {
    setIsRouteAssessment(false)
    setAnswers(({ branch, branchFromTriage, role, roleFromSubQuiz, experience, startingPoint, ...current }) => current)
    setIndex(3)
  }

  const isChoice = Boolean(answerKey)
  const isBreak = step.type === 'break'
  const isPathPreview = isBreak && Boolean(role) && (step.questionId === 'role' || step.questionId === 'role_sub_quiz')
  const isPlacementRecommendation = isBreak && step.questionId === 'experience' && Boolean(placement)
  const hasRouteReview = getVisibleSteps(answers).some((item) => item.id === 'starting_point')
  const isMulti = isMultiSelectStep(step.id)
  const canAdvance = !isChoice || (isMulti ? (value?.length ?? 0) > 0 : value !== undefined)
  const isLast = step.id === 'summary'

  const primaryLabel = step.id === 'welcome'
    ? 'Let’s go'
    : step.id === 'starting_point'
      ? 'Continue with this route'
      : isPlacementRecommendation && hasRouteReview
        ? 'Review your route'
      : isLast ? 'Start learning' : 'Continue'
  const onPrimary = isLast ? () => setIsGenerating(true) : goNext

  return (
    <section className={`fixed inset-0 z-30 grid overflow-hidden bg-[#121214] [[data-theme=light]_&]:bg-[#fafaf8] ${step.id === 'welcome' ? 'grid-rows-[56px_minmax(0,1fr)]' : 'grid-rows-[56px_minmax(0,1fr)_96px]'}`} aria-label="Set up your learning">
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
          <div className="h-full rounded-full bg-[#6699ec] transition-[width] duration-200" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      <main className={`onboarding-scrollbar grid justify-items-center gap-6 overflow-auto px-6 py-8 max-[680px]:px-4 ${isGenerating ? 'content-center' : isRouteAssessment ? 'content-start sm:content-center' : isChoice && step.id !== 'starting_point' && step.id !== 'project_interest' && step.id !== 'daily_time' ? 'content-start pt-10 max-[680px]:pt-6' : 'content-center pt-8'}`}>
        {isGenerating && (
          <GeneratingPath onDone={() => onComplete(buildProfile(answers))} />
        )}

        {!isGenerating && step.id === 'welcome' && (
          <div className="grid justify-items-center gap-5 self-center text-center">
            <img className="h-24 w-24 object-contain" src="/assets/devy.svg" alt="" />
            <StepHeading title="Let’s set up your learning" subtitle="A few quick questions so Devspace knows what you want, where to start, and what examples will feel relevant." />
            <ActionButton
              variant="primary"
              className="mt-3 w-[min(100%,520px)] max-w-[46ch] min-h-[52px] text-[15px] font-medium"
              onClick={onPrimary}
            >
              {primaryLabel}
            </ActionButton>
          </div>
        )}

        {isPathPreview && (
          <PathPreview role={roleLabel(branch, role)} stages={startingPointOptions[role]?.slice(0, 4) ?? []} />
        )}

        {isPlacementRecommendation && (
          <PlacementRecommendation placement={placement} stages={startingPointOptions[role] ?? []} onChangeCareer={changePath} />
        )}

        {isBreak && breakContent && !isPathPreview && !isPlacementRecommendation && (
          <div className="grid w-full max-w-[520px] justify-items-center gap-5 self-center text-center">
            <img className="h-24 w-24 object-contain" src="/assets/devy.svg" alt="" />
            <StepHeading title={breakContent.message} subtitle={breakContent.insight} />
          </div>
        )}

        {!isGenerating && step.id === 'summary' && (
          <div className="grid w-full max-w-[460px] justify-items-center gap-5 self-center text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#1e3a2a] text-[#4ade80] [[data-theme=light]_&]:bg-[#e3f6e9] [[data-theme=light]_&]:text-[#1a8a4c]" aria-hidden="true">
              <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 9.5 17 19 7" /></svg>
            </span>
            <StepHeading title="You’re all set" />
            <dl className="grid w-full gap-px overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#404040] [[data-theme=light]_&]:bg-[#eeeeeb]">
              <SummaryRow icon="compass" label="Path" value={getPath(buildProfile(answers).pathId).title} />
              {role && <SummaryRow icon="target" label="Focus" value={roleLabel(branch, role)} />}
              {placement && <SummaryRow icon="sprout" label="Starting at" value={placement.label} />}
              <SummaryRow icon="clock" label="Daily goal" value={`${answers.dailyMinutes ?? 10} min`} />
            </dl>
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={changePath}>Change career</button>
          </div>
        )}

        {step.id === 'starting_point' && (
          <RouteReview options={options} value={value} placement={placement} onSelect={select} isTesting={isRouteAssessment} onTestingChange={setIsRouteAssessment} />
        )}

        {isChoice && step.id !== 'starting_point' && (
          <>
            <StepHeading
              title={step.id === 'role_sub_quiz' ? roleSubQuiz[branch]?.prompt ?? '' : COPY[step.id]?.title ?? ''}
              subtitle={step.id === 'role_sub_quiz'
                ? 'Pick whichever sounds more like you — there’s no wrong answer.'
                : isMulti ? 'Select all that apply.' : COPY[step.id]?.subtitle}
            />
            {step.id === 'project_interest'
              ? <ChipList options={options} value={value} onSelect={select} />
              : <OptionList options={options} value={value} onSelect={select} />}
          </>
        )}
      </main>

      {step.id !== 'welcome' && !isRouteAssessment && !isGenerating && <footer className="flex items-center justify-center px-6 pb-5 max-[680px]:px-4">
        <ActionButton
          variant="primary"
          className="w-[min(100%,520px)] min-h-[52px] text-[15px] font-medium"
          onClick={onPrimary}
          disabled={!canAdvance}
        >
          {primaryLabel}
        </ActionButton>
      </footer>}
    </section>
  )
}

function PlacementRecommendation({ placement, stages, onChangeCareer }) {
  const current = stages.findIndex((stage) => stage.value === placement.value)

  return (
    <div className="grid w-full max-w-[520px] justify-items-center gap-4 self-center text-center">
      <img className="h-20 w-20 object-contain" src="/assets/devy.svg" alt="" />
      <div className="grid justify-items-center gap-2">
        <p className="m-0 text-sm font-medium text-[#6699ec]">Your recommended start</p>
        <h1 className="m-0 max-w-[28ch] font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Start with {placement.label}</h1>
        <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Based on your experience, this is the best foundation before you move into more advanced work.</p>
      </div>
      <section className="w-full rounded-2xl border border-[#404040] bg-[#1f1f1f] p-5 text-left [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white" aria-label="Recommended learning route">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Start here</p>
        <strong className="mt-1.5 block text-[18px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{placement.label}</strong>
        <p className="mb-0 mt-1.5 text-sm leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Build the core knowledge you'll use in every lesson that follows.</p>
        {stages[current + 1] && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#e0e0dc]">
            <span className="text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Then continue to</span>
            <strong className="text-right text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{stages[current + 1].label}</strong>
          </div>
        )}
      </section>
      <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={onChangeCareer}>Change career</button>
    </div>
  )
}

const ROUTE_TEST_QUESTIONS = [
  {
    prompt: 'Which SQL command reads data from a table?',
    options: ['SELECT', 'INSERT', 'DELETE'],
    answer: 0,
  },
  {
    prompt: 'What does a WHERE clause do in a query?',
    options: ['Sorts results', 'Filters matching records', 'Creates a new table'],
    answer: 1,
  },
  {
    prompt: 'Which field is most useful for uniquely identifying a record?',
    options: ['Primary key', 'Display name', 'Created date'],
    answer: 0,
  },
]

function RouteReview({ options, value, placement, onSelect, isTesting, onTestingChange }) {
  const [testOption, setTestOption] = useState(null)
  const [testAnswers, setTestAnswers] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [testQuestionIndex, setTestQuestionIndex] = useState(0)

  const finishTest = () => {
    const score = ROUTE_TEST_QUESTIONS.reduce((total, question, index) => total + Number(testAnswers[index] === question.answer), 0)
    const routeOptions = options.filter((option) => option.value !== 'not_sure')
    const currentIndex = Math.max(0, routeOptions.findIndex((option) => option.value === testOption?.value))
    const resultIndex = score === 3
      ? Math.min(currentIndex + 1, routeOptions.length - 1)
      : score < 2
        ? Math.max(currentIndex - 1, 0)
        : currentIndex
    setTestResult({ score, option: routeOptions[resultIndex] })
  }

  if (isTesting) {
    return (
      <section className="grid w-full max-w-[620px] justify-items-center gap-5 self-center" aria-labelledby="route-test-title">
        <div className="grid justify-items-center gap-2 text-center">
          <p className="m-0 text-sm font-medium text-[#6699ec]">{testResult ? 'Route placement' : 'Route assessment'}</p>
          <h1 id="route-test-title" className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testResult ? 'Your recommended starting point' : `Test out of ${testOption?.label ?? 'this route'}`}</h1>
          <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{testResult ? 'Based on your answers, this is the best place to begin.' : 'Answer three questions and we will place you at the right point in this route.'}</p>
        </div>
        {!testResult ? (
          <div className="grid w-full gap-3">
            <p className="m-0 text-center text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Question {testQuestionIndex + 1} of {ROUTE_TEST_QUESTIONS.length}</p>
            <div role="group" aria-labelledby={`route-question-${testQuestionIndex}`} className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-4 [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
              <p id={`route-question-${testQuestionIndex}`} className="m-0 px-1 text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testQuestionIndex + 1}. {ROUTE_TEST_QUESTIONS[testQuestionIndex].prompt}</p>
              {ROUTE_TEST_QUESTIONS[testQuestionIndex].options.map((option, optionIndex) => {
                const selected = testAnswers[testQuestionIndex] === optionIndex
                return <button key={option} type="button" className={`min-h-11 rounded-xl border px-4 text-left text-sm font-medium transition-colors ${selected ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] bg-[#262626] text-[#f4f4f2] hover:border-[#6699ec] [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'} focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]`} aria-pressed={selected} onClick={() => {
                  setTestAnswers((current) => {
                    const next = [...current]
                    next[testQuestionIndex] = optionIndex
                    return next
                  })
                  if (testQuestionIndex < ROUTE_TEST_QUESTIONS.length - 1) setTestQuestionIndex((current) => current + 1)
                }}>{option}</button>
              })}
            </div>
            {testQuestionIndex === ROUTE_TEST_QUESTIONS.length - 1 && <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" disabled={testAnswers.length !== ROUTE_TEST_QUESTIONS.length || testAnswers.some((answer) => answer === undefined)} onClick={finishTest}>See my route placement</ActionButton>}
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => { onTestingChange(false); setTestAnswers([]); setTestQuestionIndex(0) }}>Back to route options</button>
          </div>
        ) : (
          <div className="grid w-full max-w-[520px] justify-items-center gap-4 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6 text-center [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
            <p className="m-0 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You got {testResult.score} of {ROUTE_TEST_QUESTIONS.length} correct.</p>
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Recommended start</p>
              <strong className="mt-1 block text-xl font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testResult.option.label}</strong>
            </div>
            <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" onClick={() => { onSelect(testResult.option.value); onTestingChange(false) }}>Use this starting point</ActionButton>
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => { setTestResult(null); setTestAnswers([]); setTestQuestionIndex(0) }}>Take the assessment again</button>
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="grid w-full max-w-[620px] justify-items-center gap-5 self-center text-center">
      <div className="grid justify-items-center gap-2">
        <p className="m-0 text-sm font-medium text-[#6699ec]">Your learning route</p>
        <h1 className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Review your starting route</h1>
        <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Choose where to begin. You can always return to earlier lessons later.</p>
      </div>
      <div className="grid w-full gap-2.5" role="group" aria-label="Choose your starting point">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <div
              key={option.value}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-1.5 text-left transition-colors ${selected ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e0e0dc] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'}`}
            >
              <button type="button" className="min-h-11 min-w-0 flex-1 rounded-lg px-3 text-left font-medium focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" aria-pressed={selected} onClick={() => onSelect(option.value)}>{option.label}</button>
              {option.value !== 'not_sure' && <button type="button" className="min-h-11 rounded-lg border border-current/25 px-3 text-sm font-medium text-[#b9afff] [[data-theme=light]_&]:text-[#5c49c9] hover:bg-white/10 [[data-theme=light]_&]:hover:bg-[#e8e4ff] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" onClick={() => { setTestOption(option); setTestAnswers([]); setTestResult(null); setTestQuestionIndex(0); onTestingChange(true) }}>Test out</button>}
              <span className={`ml-auto rounded-full px-3 py-1 text-[13px] ${selected ? 'bg-white/15 [[data-theme=light]_&]:bg-[#dcd5ff]' : 'bg-[#262626] [[data-theme=light]_&]:bg-[#f2f3f5] text-[#9a9a9d]'}`}>{selected ? 'Starting here' : 'Start here'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


function PathPreview({ role, stages }) {
  return (
    <div className="grid w-full max-w-[620px] justify-items-center gap-5 self-center text-center">
      <div className="grid justify-items-center gap-2">
        <p className="m-0 text-sm font-medium text-[#6699ec]">Your learning path</p>
        <h1 className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{role} it is.</h1>
        <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Here’s a quick view of the skills you’ll build, step by step.</p>
      </div>
      <ol className="m-0 flex max-w-[560px] flex-wrap items-center justify-center gap-y-3 p-0" aria-label={`${role} learning path`}>
        {stages.map((stage, index) => {
          const isFirst = index === 0
          return (
            <li key={stage.value} className="flex list-none items-center">
              {index > 0 && (
                <span className="mx-1.5 h-px w-5 bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]" aria-hidden="true" />
              )}
              <span
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium ${
                  isFirst
                    ? 'bg-[#2a264c] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]'
                    : 'bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#f2f3f5] text-[#c8c8c6] [[data-theme=light]_&]:text-[#4b4b4d]'
                }`}
              >
                <span
                  className={`grid size-5 flex-none place-items-center rounded-full text-[11px] font-semibold ${
                    isFirst ? 'bg-[#5c49c9] text-white' : 'bg-[#3a3a3a] [[data-theme=light]_&]:bg-[#e0e0dc] text-[#c8c8c6] [[data-theme=light]_&]:text-[#4b4b4d]'
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {stage.label}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="m-0 text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You’ll gain practical foundations and a clear route to portfolio ready work.</p>
    </div>
  )
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 py-3.5">
      <OptionIcon name={icon} selected={false} />
      <dt className="text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{label}</dt>
      <dd className="m-0 ml-auto text-right text-sm font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{value}</dd>
    </div>
  )
}

function roleLabel(branch, role) {
  const fromBranch = BRANCHES.some((item) => item.value === branch)
  if (!fromBranch) return role
  return getStepOptions('role', { branch }).find((option) => option.value === role)?.label ?? role
}
