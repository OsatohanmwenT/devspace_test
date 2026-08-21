import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { ConceptTransition } from './ConceptTransition'
import { LessonArticle } from './LessonArticle'
import { LessonQuestion } from './LessonQuestion'
import { DevyAssistant } from './DevyAssistant'
import { GemIcon } from '../ui/icons'
import { DevyMood } from '../ui/DevyMood'
import { getLesson, writingProgramsLesson } from './lessonContent'
import { buildLessonFlow } from './lessonFlow'
import { isQuestionComplete, isQuestionCorrect } from './questionState'
import { NotesDrawer } from './NotesDrawer'
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
      <div className="grid max-w-[42ch] justify-items-center gap-2">
        {/* A dead end is Devy's problem, not the learner's — the annoyance is
            pointed at the missing content. */}
        <DevyMood mood="annoyed" className="mb-2 size-[132px]" />
        <h1 className="m-0 font-rethink-sans text-[clamp(24px,3vw,30px)] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          This lesson isn’t written yet
        </h1>
        <p className="m-0 text-[15px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#777]">
          <code className="font-rubik text-[.9em]">{lessonId}</code> has no content authored against it yet. Pick another lesson from your path.
        </p>
      </div>
    </div>
  )
}

export default function LessonView({ navigationStyle = 'segments', lessonId = writingProgramsLesson.id, onExit, onComplete, profile, xp = 0 }) {
  const activeLessonId = typeof lessonId === 'string' ? lessonId : writingProgramsLesson.id
  const lesson = getLesson(activeLessonId)
  // Rebuilt per lesson rather than once at module load, so the id actually selects content.
  const lessonFlow = useMemo(() => (lesson ? buildLessonFlow(lesson) : []), [lesson])

  const storageKey = `devspace-lesson-session:${activeLessonId}`
  const [session, setSession] = useState(() => loadLessonSession(storageKey, lessonFlow.length || 1))
  const [isDevyOpen, setIsDevyOpen] = useState(false)
  const [devyPanelWidth, setDevyPanelWidth] = useState(() => Math.round(Math.max(320, window.innerWidth * 0.25)))
  const resizeStartRef = useRef(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false)
  const [isLessonMenuOpen, setIsLessonMenuOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const [successPulse, setSuccessPulse] = useState(0)
  const [errorPulse, setErrorPulse] = useState(0)
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
    setSuccessPulse(0)
    setErrorPulse(0)
  }

  const goPrevious = () => {
    setSession((current) => ({ ...current, stepIndex: Math.max(current.stepIndex - 1, 0) }))
    setIsDevyOpen(false)
    setSuccessPulse(0)
    setErrorPulse(0)
  }

  const answerQuestion = (nextAnswer) => {
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { answer: nextAnswer, checked: false } },
    }))
  }

  const checkQuestion = () => {
    const correct = isQuestionCorrect(currentStep.question, answer)
    if (correct) setSuccessPulse((current) => current + 1)
    else setErrorPulse((current) => current + 1)
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
      if (isNotesOpen || isCheatsheetOpen) return
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
  const focusRing = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]'
  const showStreak = session.streak >= STREAK_THRESHOLD

  const startDevyResize = (event) => {
    if (window.innerWidth <= 720) return
    event.preventDefault()
    resizeStartRef.current = { x: event.clientX, width: devyPanelWidth }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const resizeDevy = (event) => {
    if (!resizeStartRef.current) return
    const { x, width } = resizeStartRef.current
    const nextWidth = width + event.clientX - x
    setDevyPanelWidth(Math.round(Math.min(Math.max(nextWidth, 320), Math.max(320, window.innerWidth * 0.25))))
  }

  const stopDevyResize = () => {
    resizeStartRef.current = null
  }

  return (
    <section
      className="fixed inset-0 z-20 grid grid-rows-[64px_minmax(0,1fr)_76px] max-[720px]:grid-rows-[64px_minmax(0,1fr)_68px] overflow-hidden bg-[#121212] [[data-theme=light]_&]:bg-[#fafaf8] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
      aria-label="Lesson"
      style={{ '--devy-panel-width': `${devyPanelWidth}px` }}
    >
      {successPulse > 0 && <div key={successPulse} className="lesson-success-glow" aria-hidden="true" />}
      {errorPulse > 0 && <div key={errorPulse} className="lesson-error-glow" aria-hidden="true" />}
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fdfcf9] px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className={`grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 max-[720px]:invisible ${focusRing}`}
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="justify-self-center max-[720px]:hidden">
          {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
            <LessonProgressStrip
              currentStep={session.stepIndex + 1}
              totalSteps={Math.max(lessonFlow.length, 1)}
              onPrevious={session.stepIndex > 0 ? goPrevious : undefined}
              onNext={!isLastStep && (!isQuestion || isChecked) ? goNext : undefined}
              streaking={showStreak}
            />
          )}
        </div>

        <div className="justify-self-center min-[721px]:absolute min-[721px]:right-20">
          <span className="flex h-9 items-center gap-1.5 rounded-full border border-[#e1e1e1] bg-white px-2.5 text-sm font-medium text-neutral-800 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1f1f1f] [[data-theme=dark]_&]:text-[#f4f4f2]" aria-label={`${xp} XP`}>
            <GemIcon className="size-[14px] text-[#513dec]" />
            {xp}
          </span>
        </div>

        {/* Reference belongs where the work happens — this is the moment you
            actually need to look up syntax. */}
        <div className="relative justify-self-end">
          <button
            type="button"
            className={`grid size-10 place-items-center rounded-[10px] border-0 bg-[#f5f5f5] text-neutral-800 hover:bg-[#eeeeeb] [[data-theme=dark]_&]:bg-[#262626] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#303030] ${focusRing}`}
            onClick={() => setIsLessonMenuOpen((open) => !open)}
            aria-expanded={isLessonMenuOpen}
            aria-label="Lesson options"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          {isLessonMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-20 grid w-[240px] rounded-xl border border-[#eeeeeb] bg-white p-2 shadow-[0_12px_28px_rgba(20,20,20,.12)] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1f1f1f] [[data-theme=dark]_&]:shadow-[0_12px_28px_rgba(0,0,0,.32)]" role="menu">
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => setIsSaved((saved) => !saved)}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>{isSaved ? 'Saved' : 'Save this lesson'}</button>
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => { setIsNotesOpen(true); setIsLessonMenuOpen(false) }}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Notes</button>
              {lessonTopics.length > 0 && <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => { setIsCheatsheetOpen(true); setIsLessonMenuOpen(false) }}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Cheatsheet</button>}
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => setIsLessonMenuOpen(false)}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4M17 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Narrate this step</button>
              <div className="my-1 border-t border-[#eeeeeb] [[data-theme=dark]_&]:border-[#404040]" role="separator" />
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => setIsLessonMenuOpen(false)}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V4h12v11H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Report a problem</button>
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={onExit}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Exit lesson</button>
            </div>
          )}
        </div>
      </header>

      <main
        className={`min-w-0 min-h-0 overflow-auto p-0 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-[var(--devy-panel-width)] max-[720px]:ml-0 max-[720px]:mt-[min(42vh,340px)]' : 'ml-0'}`}
      >
        {!lesson && <UnavailableLesson lessonId={activeLessonId} />}
        {currentStep?.type === 'article' && <LessonArticle article={currentStep.content} lessonTitle={lesson?.title} conceptTitle={currentStep.concept?.title} step={session.stepIndex + 1} totalSteps={lessonFlow.length} isNarrating={isNarrating} onToggleNarration={() => setIsNarrating((narrating) => !narrating)} />}
        {isQuestion && (
          <div className="grid min-h-full w-[min(100%,760px)] place-items-center mx-auto px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
            <LessonQuestion
              key={currentStep.id}
              question={currentStep.question}
              headingLevel="h1"
              answer={answer}
              checked={isChecked}
              onAnswer={answerQuestion}
              onAskDevy={() => setIsDevyOpen(true)}
            />
          </div>
        )}
        {currentStep?.kind === 'transition' && <ConceptTransition {...currentStep.transition} />}
        {currentStep?.kind === 'complete' && <ConceptTransition {...currentStep.completion} mood="celebrating" />}
      </main>

      {!isMilestone && <aside
        className={`absolute z-[1] top-16 bottom-0 left-0 flex w-[var(--devy-panel-width)] max-[720px]:w-full max-[720px]:min-w-0 flex-col p-5 border-r max-[720px]:border-r-0 max-[720px]:border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white transition-transform duration-[180ms] ease-in-out max-[720px]:top-[60px] ${isDevyPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Devy chat"
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Devy chat"
          className="absolute top-0 right-0 hidden h-full w-2 translate-x-1/2 cursor-col-resize touch-none md:block before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-transparent hover:before:bg-[#6699ec] active:before:bg-[#6699ec]"
          onPointerDown={startDevyResize}
          onPointerMove={resizeDevy}
          onPointerUp={stopDevyResize}
          onPointerCancel={stopDevyResize}
        />
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
        className={`${isMilestone ? 'flex justify-center' : 'grid grid-cols-[auto_minmax(0,1fr)_auto]'} items-center gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] py-2 px-6 max-[720px]:px-3.5 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-[var(--devy-panel-width)] max-[720px]:ml-0' : 'ml-0'}`}
      >
        {!isMilestone && <button
          type="button"
          className={`relative grid size-[54px] max-[720px]:size-12 place-items-center border-0 bg-transparent p-0 ${focusRing}`}
          onClick={() => setIsDevyOpen(true)}
          aria-label="Open Devy chat"
          aria-expanded={isDevyOpen}
        >
          {/* Three right in a row already lights a ring here; letting Devy react
              too is what makes the streak feel noticed rather than counted. */}
          <DevyMood
            key={showStreak ? 'streaking' : 'idle'}
            mood={showStreak ? 'celebrating' : 'neutral'}
            className={showStreak ? 'w-full h-full' : 'devy-idle w-full h-full'}
          />
          {showStreak && <span className="absolute inset-0 rounded-full ring-2 ring-[#f0c964]" aria-hidden="true" />}
        </button>}

        {!isMilestone && (
          <p className="m-0 min-w-0 text-[13px] leading-[1.4] text-[#f0c964]" role="status" aria-live="polite">
            {showStreak ? `${session.streak} correct answers in a row!` : ''}
          </p>
        )}

        {footerAction && <ActionButton
          variant="primary"
          className={`${isMilestone ? 'w-[min(100%,640px)]' : 'min-w-[200px] max-[720px]:min-w-[140px]'} min-h-11 text-[15px] font-semibold`}
          onClick={footerAction.onClick}
          disabled={footerAction.disabled}
        >
          {footerAction.label}
        </ActionButton>}
      </footer>

      {isNotesOpen && (
        <NotesDrawer
          lessonTitle={lesson?.title}
          conceptTitle={currentStep?.concept?.title}
          storageKey={`devspace-lesson-notes:${activeLessonId}`}
          onClose={() => setIsNotesOpen(false)}
        />
      )}
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
