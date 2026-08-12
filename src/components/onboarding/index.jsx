import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { getPath } from '../../data/paths'
import { branchTriage, BRANCHES, roleSubQuiz } from '../../data/onboarding'
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
} from '../../lib/onboarding'
import { ChipList, OptionList, StepHeading } from './OnboardingStep'

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
  const goBack = () => setIndex((current) => Math.max(current - 1, 0))

  const isChoice = Boolean(answerKey)
  const isBreak = step.type === 'break'
  const isMulti = isMultiSelectStep(step.id)
  const canAdvance = !isChoice || (isMulti ? (value?.length ?? 0) > 0 : value !== undefined)
  const isLast = step.id === 'summary'

  const primaryLabel = step.id === 'welcome' ? 'Let’s go' : isLast ? 'Start learning' : 'Continue'
  const onPrimary = isLast ? () => onComplete(buildProfile(answers)) : goNext

  return (
    <section className="fixed inset-0 z-30 grid grid-rows-[56px_minmax(0,1fr)_96px] overflow-hidden bg-[var(--surface-canvas)] [[data-theme=light]_&]:bg-[var(--surface-canvas)]" aria-label="Set up your learning">
      <header className="flex items-center gap-4 px-6 max-[680px]:px-4">
        <button
          type="button"
          className="grid h-10 w-10 flex-none place-items-center rounded-lg border-0 bg-transparent text-[var(--text-secondary)] disabled:opacity-30 hover:text-[var(--text-primary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-cta)]"
          onClick={goBack}
          disabled={index === 0}
          aria-label="Previous step"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--border-hairline)]"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        >
          <div className="h-full rounded-full bg-[var(--brand-cta)] transition-[width] duration-200" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </header>

      {/* Choice steps pack to the top so the heading and options keep a tight
          rhythm; payoff and welcome screens stay vertically centred. */}
      <main className={`grid justify-items-center gap-6 overflow-auto px-6 pb-8 max-[680px]:px-4 ${isChoice ? 'content-start pt-10 max-[680px]:pt-6' : 'content-center pt-8'}`}>
        {step.id === 'welcome' && (
          <div className="grid justify-items-center gap-5 self-center text-center">
            <img className="h-24 w-24 object-contain" src="/assets/devy.svg" alt="" />
            <StepHeading title="Let’s set up your learning" subtitle="A few quick questions so your path, examples and daily goal actually fit you." />
          </div>
        )}

        {isBreak && breakContent && (
          <div className="grid w-full max-w-[520px] justify-items-center gap-5 self-center text-center">
            <img className="h-24 w-24 object-contain" src="/assets/devy.svg" alt="" />
            <StepHeading title={breakContent.message} subtitle={breakContent.insight} />
          </div>
        )}

        {step.id === 'summary' && (
          <div className="grid w-full max-w-[460px] justify-items-center gap-5 self-center">
            <StepHeading title="You’re all set" subtitle="Here’s what we’ll start you with." />
            <dl className="grid w-full gap-px overflow-hidden rounded-2xl border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-hairline)] bg-[var(--border-default)] [[data-theme=light]_&]:bg-[var(--border-hairline)]">
              <SummaryRow label="Path" value={getPath(buildProfile(answers).pathId).title} />
              {role && <SummaryRow label="Focus" value={roleLabel(branch, role)} />}
              {placement && <SummaryRow label="Starting at" value={placement.label} />}
              <SummaryRow label="Daily goal" value={`${answers.dailyMinutes ?? 10} min`} />
            </dl>
          </div>
        )}

        {isChoice && (
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

      <footer className="flex items-center justify-center px-6 pb-5 max-[680px]:px-4">
        <ActionButton
          variant="primary"
          className="w-[min(100%,520px)] min-h-[52px] text-[15px] font-medium"
          onClick={onPrimary}
          disabled={!canAdvance}
        >
          {primaryLabel}
        </ActionButton>
      </footer>
    </section>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white px-4 py-3.5">
      <dt className="text-[13px] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{label}</dt>
      <dd className="m-0 text-right text-sm font-medium text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}

function roleLabel(branch, role) {
  const fromBranch = BRANCHES.some((item) => item.value === branch)
  if (!fromBranch) return role
  return getStepOptions('role', { branch }).find((option) => option.value === role)?.label ?? role
}
