import { useEffect, useMemo, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { ConceptTransition } from './ConceptTransition'
import { LessonArticle } from './LessonArticle'
import { LessonQuestion } from './LessonQuestion'
import { DevyAssistant } from './DevyAssistant'
import { ChecklistIcon } from '../ui/icons'
import { getLesson, writingProgramsLesson } from './lessonContent'
import { buildLessonFlow } from './lessonFlow'
import { isQuestionComplete, isQuestionCorrect } from './questionState'
import { CheatsheetDrawer } from '../paths/CheatsheetDrawer'
import { getLessonTopics } from '../../data/learningResources'

const STREAK_THRESHOLD = 3

function loadLessonSession(storageKey, flowLength) {
  const empty = { stepIndex: 0, activityStates: {}, streak: 0 }
  try {
    const savedSession = JSON.parse(localStorage.getItem(storageKey))
    if (!savedSession) return empty

    return {
      stepIndex: Math.min(Math.max(savedSession.stepIndex ?? 0, 0), flowLength - 1),
      activityStates: savedSession.activityStates ?? {},
      streak: savedSession.streak ?? 0,
    }
  } catch {
    return empty
  }
}

function UnavailableLesson({ lessonId }) {
  return (
    <div className="grid h-full place-items-center px-6 text-center">
      <div className="grid max-w-[42ch] gap-2">
        <h1 className="m-0 font-['Rethink_Sans',Arial,sans-serif] text-[clamp(24px,3vw,30px)] font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
          This lesson isn’t written yet
        </h1>
        <p className="m-0 text-[15px] leading-[1.55] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777]">
          <code className="font-['JetBrains_Mono',ui-monospace,monospace] text-[.9em]">{lessonId}</code> has no content authored against it yet. Pick another lesson from your path.
        </p>
      </div>
    </div>
  )
}

export default function LessonView({ navigationStyle = 'segments', lessonId = writingProgramsLesson.id, onExit, onComplete, profile }) {
  const activeLessonId = typeof lessonId === 'string' ? lessonId : writingProgramsLesson.id
  const lesson = getLesson(activeLessonId)
  // Rebuilt per lesson rather than once at module load, so the id actually selects content.
  const lessonFlow = useMemo(() => (lesson ? buildLessonFlow(lesson) : []), [lesson])

  const storageKey = `devspace-lesson-session:${activeLessonId}`
  const [session, setSession] = useState(() => loadLessonSession(storageKey, lessonFlow.length || 1))
  const [isDevyOpen, setIsDevyOpen] = useState(false)
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false)
  const lessonTopics = useMemo(() => getLessonTopics(activeLessonId), [activeLessonId])

  const currentStep = lessonFlow[session.stepIndex]
  const isMilestone = currentStep?.kind === 'transition' || currentStep?.kind === 'complete'
  const isQuestion = currentStep?.type === 'question'

  const questionState = isQuestion ? session.activityStates[currentStep.id] : undefined
  const answer = questionState?.answer
  const isChecked = questionState?.checked ?? false
  const canCheck = isQuestion && isQuestionComplete(currentStep.question, answer)
  const isLastStep = session.stepIndex === lessonFlow.length - 1

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(session))
  }, [session, storageKey])

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [])

  const goNext = () => {
    setSession((current) => ({ ...current, stepIndex: Math.min(current.stepIndex + 1, lessonFlow.length - 1) }))
    setIsDevyOpen(false)
  }

  const goPrevious = () => {
    setSession((current) => ({ ...current, stepIndex: Math.max(current.stepIndex - 1, 0) }))
    setIsDevyOpen(false)
  }

  const answerQuestion = (nextAnswer) => {
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { answer: nextAnswer, checked: false } },
    }))
  }

  const checkQuestion = () => {
    const correct = isQuestionCorrect(currentStep.question, answer)
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { answer, checked: true } },
      streak: correct ? current.streak + 1 : 0,
    }))
  }

  const finishLesson = () => {
    localStorage.removeItem(storageKey)
    onComplete?.(activeLessonId)
    onExit()
  }

  const footerAction = !currentStep
    ? null
    : currentStep.kind === 'transition'
      ? { label: `Continue to ${currentStep.nextConcept.title}`, onClick: goNext }
      : currentStep.kind === 'complete'
        ? { label: 'Return to path', onClick: finishLesson }
        : currentStep.type === 'article'
          ? { label: 'Continue', onClick: goNext }
          : isQuestion
            ? (isChecked
              ? { label: 'Continue', onClick: goNext }
              : { label: 'Check', onClick: checkQuestion, disabled: !canCheck })
            : { label: 'Continue', onClick: goNext }

  // Ctrl/Cmd+Enter drives the primary action; number keys pick an option.
  useEffect(() => {
    const handleKeyDown = (event) => {
      // The drawer owns the keyboard while it's open.
      if (isCheatsheetOpen) return
      if (event.key === 'Escape') {
        onExit()
        return
      }
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        if (footerAction && !footerAction.disabled) {
          event.preventDefault()
          footerAction.onClick()
        }
        return
      }
      if (!isQuestion || isChecked) return
      if (currentStep.question.type !== 'multiple-choice') return

      const digit = Number(event.key)
      if (Number.isInteger(digit) && digit >= 1 && digit <= currentStep.question.options.length) {
        event.preventDefault()
        answerQuestion(digit - 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  const isDevyPanelOpen = isDevyOpen && !isMilestone
  const focusRing = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-cta)]'
  const showStreak = session.streak >= STREAK_THRESHOLD

  return (
    <section
      className="fixed inset-0 z-20 grid grid-rows-[56px_minmax(0,1fr)_92px] max-[720px]:grid-rows-[56px_minmax(0,1fr)_84px] overflow-hidden bg-[var(--surface-canvas)] [[data-theme=light]_&]:bg-white text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]"
      aria-label="Lesson"
    >
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className={`grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777] hover:bg-[var(--surface-raised)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)] ${focusRing}`}
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
          <LessonProgressStrip
            currentStep={session.stepIndex + 1}
            totalSteps={Math.max(lessonFlow.length, 1)}
            onPrevious={session.stepIndex > 0 ? goPrevious : undefined}
            onNext={!isLastStep && (!isQuestion || isChecked) ? goNext : undefined}
            streaking={showStreak}
          />
        )}

        {/* Reference belongs where the work happens — this is the moment you
            actually need to look up syntax. */}
        {lessonTopics.length > 0 && (
          <button
            type="button"
            className={`grid w-11 h-11 place-items-center justify-self-end border-0 rounded-lg bg-transparent text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777] hover:bg-[var(--surface-raised)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)] ${focusRing}`}
            onClick={() => setIsCheatsheetOpen(true)}
            aria-label="Open cheatsheet"
          >
            <ChecklistIcon className="w-[19px] h-[19px]" />
          </button>
        )}
      </header>

      <main
        className={`min-w-0 min-h-0 overflow-auto p-0 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0 max-[720px]:mt-[min(42vh,340px)]' : 'ml-0'}`}
      >
        {!lesson && <UnavailableLesson lessonId={activeLessonId} />}
        {currentStep?.type === 'article' && <LessonArticle article={currentStep.content} />}
        {isQuestion && (
          <div className="grid min-h-full w-[min(100%,760px)] place-items-center mx-auto px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
            <LessonQuestion
              key={currentStep.id}
              question={currentStep.question}
              headingLevel="h1"
              answer={answer}
              checked={isChecked}
              onAnswer={answerQuestion}
            />
          </div>
        )}
        {currentStep?.kind === 'transition' && <ConceptTransition {...currentStep.transition} />}
        {currentStep?.kind === 'complete' && <ConceptTransition {...currentStep.completion} />}
      </main>

      {!isMilestone && <aside
        className={`absolute z-[1] top-16 bottom-0 left-0 flex w-80 max-[720px]:w-full flex-col p-5 border-r max-[720px]:border-r-0 max-[720px]:border-b border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white transition-transform duration-[180ms] ease-in-out max-[720px]:top-[60px] ${isDevyPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Devy chat"
      >
        <DevyAssistant
          key={currentStep?.id}
          step={currentStep}
          checked={isChecked}
          profile={lesson?.role ? { ...profile, role: lesson.role } : profile}
          onClose={() => setIsDevyOpen(false)}
          focusRing={focusRing}
        />
      </aside>}

      <footer
        className={`${isMilestone ? 'flex justify-center' : 'grid grid-cols-[auto_minmax(0,1fr)_auto]'} items-center gap-3 border-t border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] pt-2.5 px-6 pb-4 max-[720px]:pt-2 max-[720px]:px-3.5 max-[720px]:pb-3 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0' : 'ml-0'}`}
      >
        {!isMilestone && <button
          type="button"
          className={`relative grid w-[70px] h-[70px] max-[720px]:w-[58px] max-[720px]:h-[58px] place-items-center border-0 bg-transparent p-0 ${focusRing}`}
          onClick={() => setIsDevyOpen(true)}
          aria-label="Open Devy chat"
          aria-expanded={isDevyOpen}
        >
          <img className="w-full h-full object-contain" src="/assets/devy.svg" alt="" />
          {showStreak && <span className="absolute inset-0 rounded-full ring-2 ring-[var(--accent-progress)]" aria-hidden="true" />}
        </button>}

        {!isMilestone && (
          <p className="m-0 min-w-0 text-[13px] leading-[1.4] text-[var(--accent-progress)]" role="status" aria-live="polite">
            {showStreak ? `${session.streak} correct answers in a row!` : ''}
          </p>
        )}

        {footerAction && <ActionButton
          variant="primary"
          className={`${isMilestone ? 'w-[min(100%,640px)]' : 'min-w-[200px] max-[720px]:min-w-[140px]'} min-h-[50px] text-[15px] font-semibold`}
          onClick={footerAction.onClick}
          disabled={footerAction.disabled}
        >
          {footerAction.label}
        </ActionButton>}
      </footer>

      {isCheatsheetOpen && (
        <CheatsheetDrawer
          title="Cheatsheet"
          subtitle={lesson?.title}
          topics={lessonTopics}
          onClose={() => setIsCheatsheetOpen(false)}
        />
      )}
    </section>
  )
}
