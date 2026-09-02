import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
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
import { ActionButton } from '../ui/ActionButton';
import { DevyMood } from '../ui/DevyMood';
import GeneratingPath from './GeneratingPath';
import { ChipList, MiniIcon, OptionList, StepHeading } from './OnboardingStep';

// Screens whose option set is long enough to benefit from a 2-column icon
// grid instead of a scanning a straight vertical list.
const GRID_LAYOUT_STEPS = new Set(['branch'])

// Matches a stage's id against the tech it actually teaches, so the path
// preview can show a real HTML/JS/React mark instead of a bare number.
// Falls back to the number when a stage (e.g. "DOM manipulation") doesn't
// map cleanly to one icon — better a blank than a wrong mark.
function stageIcon(stageValue) {
  const tokens = stageValue.split('_')
  const has = (...keywords) => keywords.some((keyword) => tokens.includes(keyword))

  if (has('react')) return 'react'
  if (has('vue')) return 'vue'
  if (has('angular')) return 'angular'
  if (has('typescript')) return 'typescript'
  if (has('html', 'css')) return 'markup'
  if (has('js', 'javascript')) return 'js'
  if (has('python')) return 'python'
  if (has('java')) return 'java'
  if (has('csharp')) return 'csharp'
  if (has('swift')) return 'swift'
  if (has('kotlin')) return 'kotlin'
  if (has('sql', 'database', 'databases')) return 'database'
  if (has('docker', 'containers')) return 'docker'
  if (has('cloud')) return 'cloud'
  if (has('git')) return 'git'
  if (has('figma', 'design')) return 'design'
  if (has('api', 'apis', 'rest', 'graphql', 'networking')) return 'api'
  return null
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
  const recommendedPlacement = resolveRecommendedPlacement(answers)

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
    setAnswers(({ branch, branchFromTriage, role, roleFromSubQuiz, stack, stackFromSubQuiz, experience, javascriptExperience, startingPoint, ...current }) => current)
    setIndex(3)
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
  const hasRouteReview = getVisibleSteps(answers).some((item) => item.id === 'starting_point')
  const isMulti = isMultiSelectStep(step.id)
  const canAdvance = !isChoice || (isMulti ? (value?.length ?? 0) > 0 : value !== undefined)
  const isLast = step.id === 'daily_time_break'

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
          <PathPreview role={roleLabel(branch, role)} stages={startingPointOptions[resolveLadderKey(answers)]?.slice(0, 4) ?? []} />
        )}

        {isPlacementRecommendation && (
          <PlacementRecommendation
            placement={placement}
            stages={startingPointOptions[resolveLadderKey(answers)] ?? []}
            explanation={explainPlacement(answers, placement, roleLabel(branch, role))}
            onChangeCareer={changePath}
            onTestLevel={() => { goNext(); setIsRouteAssessment(true) }}
          />
        )}

        {isBreak && breakContent && !isPathPreview && !isPlacementRecommendation && (
          <BreakScreen key={step.id} message={breakContent.message} insight={breakContent.insight} />
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
          <>
            <StepHeading
              title={step.id === 'role_sub_quiz'
                ? roleSubQuiz[branch]?.prompt ?? ''
                : step.id === 'stack_sub_quiz'
                  ? stackSubQuiz[role]?.prompt ?? ''
                  : COPY[step.id]?.title ?? ''}
              subtitle={step.id === 'role_sub_quiz' || step.id === 'stack_sub_quiz'
                ? 'Pick whichever sounds more like you — there’s no wrong answer.'
                : isMulti ? 'Select all that apply.' : COPY[step.id]?.subtitle}
            />
            {step.id === 'project_interest'
              ? <ChipList options={options} value={value} onSelect={select} />
              : <OptionList options={options} value={value} onSelect={select} layout={GRID_LAYOUT_STEPS.has(step.id) ? 'grid' : 'list'} />}
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

function BreakScreen({ message, insight }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const context = gsap.context(() => {
      gsap.from('[data-break-devy]', { autoAlpha: 0, scale: 0.86, duration: 0.55, ease: 'power2.out' })
      gsap.from('[data-break-copy]', { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power2.out', delay: 0.16 })
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <div ref={rootRef} className="grid w-full max-w-[520px] justify-items-center gap-5 self-center text-center">
      <DevyMood data-break-devy mood="neutral" animate={false} alt="" className="h-24 w-24 object-contain" />
      <div data-break-copy>
        <StepHeading title={message} subtitle={insight} />
      </div>
    </div>
  )
}

function PlacementRecommendation({ placement, stages, explanation, onChangeCareer, onTestLevel }) {
  const current = stages.findIndex((stage) => stage.value === placement.value)

  return (
    <div className="grid w-full max-w-[520px] justify-items-center gap-4 self-center text-center">
      <img className="h-20 w-20 object-contain" src="/assets/devy.svg" alt="" />
      <div className="grid justify-items-center gap-2">
        <p className="m-0 text-sm font-medium text-[#6699ec]">Your recommended start</p>
        <h1 className="m-0 max-w-[28ch] font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          Start with <span className="text-[#6699ec]">{placement.label}</span>
        </h1>
        <p className="m-0 max-w-[52ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {explanation
            ? <>Because you chose <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{explanation.roleLabel}</strong> and said <strong className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">“{explanation.answerLabel}”</strong>, {explanation.rungSummary}, {explanation.tail}</>
            : 'Based on your experience, this is the best foundation before you move into more advanced work.'}
        </p>
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
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={onTestLevel}>Not sure? Test your level instead</button>
        <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={onChangeCareer}>Change career</button>
      </div>
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

function RouteReview({ groups, notSureOption, value, placement, branch, onSelect, isTesting, onTestingChange }) {
  const [testGroup, setTestGroup] = useState(null)
  const [testAnswers, setTestAnswers] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [testQuestionIndex, setTestQuestionIndex] = useState(0)

  const questions = BRANCH_TEST_QUESTIONS[branch] ?? BRANCH_TEST_QUESTIONS.web

  // A group is selected either because the experience-based placement lands
  // inside it, or because the learner picked it directly — in which case
  // they start at that group's first stage rather than a stage they never saw.
  const selectGroup = (group) => {
    const withinPlacement = placement && group.stages.some((stage) => stage.value === placement.value)
    onSelect(withinPlacement ? placement.value : group.stages[0].value)
  }

  // Reaching testing mode without a group already chosen means the learner
  // jumped straight here from the placement screen — default to the
  // recommended group rather than showing a blank "this phase".
  useEffect(() => {
    if (isTesting && !testGroup) {
      const recommended = groups.find((group) => placement && group.stages.some((stage) => stage.value === placement.value))
      setTestGroup(recommended ?? groups[0] ?? null)
    }
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
      <section className="grid w-full max-w-[620px] justify-items-center gap-5 self-center" aria-labelledby="route-test-title">
        <div className="grid justify-items-center gap-2 text-center">
          <p className="m-0 text-sm font-medium text-[#6699ec]">{testResult ? 'Route placement' : 'Route assessment'}</p>
          <h1 id="route-test-title" className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testResult ? 'Your recommended starting point' : `Test out of ${testGroup?.label ?? 'this phase'}`}</h1>
          <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{testResult ? (testResult.score < questions.length - 1 ? 'A couple of these are worth another look, so we moved your starting point a bit earlier.' : 'Based on your answers, this is the best place to begin.') : `Answer ${questions.length} questions and we will place you at the right point in this route.`}</p>
        </div>
        {!testResult ? (
          <div className="grid w-full gap-3">
            <p className="m-0 text-center text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Question {testQuestionIndex + 1} of {questions.length}</p>
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
            {testQuestionIndex === questions.length - 1 && <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" disabled={testAnswers.length !== questions.length || testAnswers.some((answer) => answer === undefined)} onClick={finishTest}>See my route placement</ActionButton>}
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => { onTestingChange(false); setTestAnswers([]); setTestQuestionIndex(0) }}>Back to route options</button>
          </div>
        ) : (
          <div className="grid w-full max-w-[520px] justify-items-center gap-4 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-6 text-center [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white">
            <p className="m-0 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You got {testResult.score} of {questions.length} correct.</p>
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[.08em] text-[#8b7cf6] [[data-theme=light]_&]:text-[#5c49c9]">Recommended start</p>
              <strong className="mt-1 block text-xl font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{testResult.group.label}</strong>
              <p className="m-0 mt-1 text-sm text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{testResult.group.stages.map((stage) => stage.label).join(' · ')}</p>
            </div>
            <ActionButton variant="primary" className="w-full min-h-[52px] text-[15px] font-medium" onClick={() => { onSelect(testResult.group.stages[0].value); onTestingChange(false) }}>Use this starting point</ActionButton>
            <button type="button" className="border-0 bg-transparent text-sm font-medium text-[#6699ec] underline underline-offset-4 hover:text-[#2563eb]" onClick={() => { setTestResult(null); setTestAnswers([]); setTestQuestionIndex(0) }}>Take the assessment again</button>
          </div>
        )}
      </section>
    )
  }

  const recommendedGroup = placement && groups.find((group) => group.stages.some((stage) => stage.value === placement.value))
  const selectedGroup = groups.find((group) => group.stages.some((stage) => stage.value === value))
  const hasMovedOffRecommendation = recommendedGroup && selectedGroup && selectedGroup.id !== recommendedGroup.id

  return (
    <div className="grid w-full max-w-[620px] justify-items-center gap-5 self-center text-center">
      <div className="grid justify-items-center gap-2">
        <p className="m-0 text-sm font-medium text-[#6699ec]">Your learning route</p>
        <h1 className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,34px)] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Review your starting route</h1>
        <p className="m-0 max-w-[48ch] text-[15px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          {hasMovedOffRecommendation
            ? `You moved your start from ${recommendedGroup.label}. You can switch back any time.`
            : 'Choose which phase to begin in. You can always return to earlier lessons later.'}
        </p>
      </div>
      <div className="grid w-full" role="group" aria-label="Choose your starting phase">
        {groups.map((group, index) => {
          const selected = group.stages.some((stage) => stage.value === value)
          const isRecommended = placement && group.stages.some((stage) => stage.value === placement.value)
          const isLast = index === groups.length - 1
          return (
            <div key={group.id} className={`flex items-stretch gap-3 ${isLast ? '' : 'pb-2.5'}`}>
              {/* The marker column stretches to the row's full height (card content
                  determines that height), so the connecting line — filling the
                  leftover space below the circle — always reaches the next marker
                  regardless of how many stages a group lists. */}
              <div className="flex flex-none flex-col items-center">
                <span className={`grid size-7 flex-none place-items-center rounded-full text-[12px] font-semibold transition-colors ${selected ? 'bg-[#5c49c9] text-white' : 'border border-[#404040] [[data-theme=light]_&]:border-[#d4d4d4] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`} aria-hidden="true">
                  {selected ? <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 9.5 17 19 7" /></svg> : index + 1}
                </span>
                {!isLast && <span className="mt-1 w-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]" aria-hidden="true" />}
              </div>
              <div className={`min-w-0 flex-1 rounded-xl border p-3.5 text-left transition-colors ${selected ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e0e0dc] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'}`}>
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
          <div className="flex items-stretch gap-3 pt-1">
            <div className="w-7 flex-none" aria-hidden="true" />
            <button
              type="button"
              className={`min-h-14 min-w-0 flex-1 rounded-xl border px-4 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] ${value === notSureOption.value ? 'border-[#5c49c9] bg-[#2a264c] text-white [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e0e0dc] bg-[#1c1c1e] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'}`}
              aria-pressed={value === notSureOption.value}
              onClick={() => onSelect(notSureOption.value)}
            >
              {notSureOption.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


function StageStrip({ stages, highlightValue, label }) {
  return (
    <ol className="m-0 flex max-w-[560px] flex-wrap items-center justify-center gap-y-3 p-0" aria-label={label}>
      {stages.map((stage, index) => {
        const isHighlighted = stage.value === highlightValue
        const icon = stageIcon(stage.value)
        return (
          <li key={stage.value} className="flex list-none items-center">
            {index > 0 && (
              <span className="mx-1.5 h-px w-5 bg-[#404040] [[data-theme=light]_&]:bg-[#d4d4d4]" aria-hidden="true" />
            )}
            <span
              className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium ${
                isHighlighted
                  ? 'bg-[#2a264c] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]'
                  : 'bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#f2f3f5] text-[#c8c8c6] [[data-theme=light]_&]:text-[#4b4b4d]'
              }`}
            >
              <span
                className={`grid size-5 flex-none place-items-center rounded-full text-[11px] font-semibold ${
                  isHighlighted ? 'bg-[#5c49c9] text-white' : 'bg-[#3a3a3a] [[data-theme=light]_&]:bg-[#e0e0dc] text-[#c8c8c6] [[data-theme=light]_&]:text-[#4b4b4d]'
                }`}
                aria-hidden="true"
              >
                {icon ? <MiniIcon name={icon} className="size-3" /> : index + 1}
              </span>
              {stage.label}
            </span>
          </li>
        )
      })}
    </ol>
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
      <StageStrip stages={stages} highlightValue={stages[0]?.value} label={`${role} learning path`} />
      <p className="m-0 text-[14px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">You’ll gain practical foundations and a clear route to portfolio ready work.</p>
    </div>
  )
}

function roleLabel(branch, role) {
  const fromBranch = BRANCHES.some((item) => item.value === branch)
  if (!fromBranch) return role
  return getStepOptions('role', { branch }).find((option) => option.value === role)?.label ?? role
}
