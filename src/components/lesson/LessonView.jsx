import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { CodingLessonWorkspace } from './CodingLessonWorkspace'
import { ConceptTransition } from './ConceptTransition'
import { LessonArticle } from './LessonArticle'
import { LessonQuiz } from './LessonQuiz'
import { writingProgramsLesson } from './lessonContent'
import { buildLessonFlow } from './lessonFlow'

const lessonFlow = buildLessonFlow(writingProgramsLesson)

function loadLessonSession(storageKey) {
  try {
    const savedSession = JSON.parse(localStorage.getItem(storageKey))
    if (!savedSession) return { stepIndex: 0, activityStates: {} }

    return {
      stepIndex: Math.min(Math.max(savedSession.stepIndex ?? 0, 0), lessonFlow.length - 1),
      activityStates: savedSession.activityStates ?? {},
    }
  } catch {
    return { stepIndex: 0, activityStates: {} }
  }
}

export default function LessonView({ navigationStyle = 'segments', lessonId = writingProgramsLesson.id, onExit }) {
  const activeLessonId = typeof lessonId === 'string' ? lessonId : writingProgramsLesson.id
  const storageKey = `devspace-lesson-session:${activeLessonId}`
  const [session, setSession] = useState(() => loadLessonSession(storageKey))
  const [isDevyOpen, setIsDevyOpen] = useState(false)
  const currentStep = lessonFlow[session.stepIndex]
  const isCoding = currentStep.kind === 'activity' && currentStep.type === 'coding'
  const isMilestone = currentStep.kind === 'transition' || currentStep.kind === 'complete'
  const isQuiz = currentStep.kind === 'activity' && currentStep.type === 'quiz'

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(session))
  }, [session, storageKey])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onExit()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onExit])

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
    setSession((current) => ({
      ...current,
      stepIndex: Math.min(current.stepIndex + 1, lessonFlow.length - 1),
    }))
    setIsDevyOpen(false)
  }

  const goPrevious = () => {
    setSession((current) => ({ ...current, stepIndex: Math.max(current.stepIndex - 1, 0) }))
    setIsDevyOpen(false)
  }

  const saveActivityState = (activityId, activityState) => {
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [activityId]: activityState },
    }))
  }

  const returnToPath = () => {
    localStorage.removeItem(storageKey)
    onExit()
  }

  const isDevyPanelOpen = isDevyOpen && !isCoding && !isMilestone
  const focusRing = 'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]'
  const footerAction = currentStep.kind === 'transition'
    ? { label: `Continue to ${currentStep.nextConcept.title}`, onClick: goNext }
    : currentStep.kind === 'complete'
      ? { label: 'Return to path', onClick: returnToPath }
      : currentStep.type === 'article'
        ? { label: 'Continue to check', onClick: goNext }
        : null

  return (
    <section
      className={`fixed inset-0 z-20 grid overflow-hidden bg-[#121212] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] ${isCoding ? 'grid-rows-[52px_minmax(0,1fr)]' : 'grid-rows-[56px_minmax(0,1fr)_92px] max-[720px]:grid-rows-[56px_minmax(0,1fr)_84px]'}`}
      aria-label="Lesson"
    >
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fafaf8] px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className={`grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#181818] ${focusRing}`}
          onClick={onExit}
          aria-label="Exit lesson"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
          <LessonProgressStrip
            currentStep={session.stepIndex + 1}
            totalSteps={lessonFlow.length}
            onPrevious={session.stepIndex > 0 ? goPrevious : undefined}
          />
        )}
      </header>

      <main
        className={`min-w-0 min-h-0 p-0 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0 max-[720px]:mt-[min(42vh,340px)]' : 'ml-0'}`}
      >
        {currentStep.kind === 'activity' && currentStep.type === 'article' && (
          <LessonArticle article={currentStep.content} />
        )}
        {currentStep.kind === 'activity' && currentStep.type === 'quiz' && (
          <LessonQuiz
            key={currentStep.id}
            quiz={currentStep.content}
            initialState={session.activityStates[currentStep.id]}
            onStateChange={(activityState) => saveActivityState(currentStep.id, activityState)}
            onComplete={goNext}
          />
        )}
        {currentStep.kind === 'activity' && currentStep.type === 'coding' && (
          <CodingLessonWorkspace
            key={currentStep.id}
            initialState={session.activityStates[currentStep.id]}
            onStateChange={(activityState) => saveActivityState(currentStep.id, activityState)}
            onComplete={goNext}
          />
        )}
        {currentStep.kind === 'transition' && <ConceptTransition {...currentStep.transition} />}
        {currentStep.kind === 'complete' && <ConceptTransition {...currentStep.completion} />}
      </main>

      {!isCoding && !isMilestone && <aside
        className={`absolute z-[1] top-16 bottom-0 left-0 flex w-80 max-[720px]:w-full flex-col p-5 border-r max-[720px]:border-r-0 max-[720px]:border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white transition-transform duration-[180ms] ease-in-out max-[720px]:top-[60px] ${isDevyPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Devy chat"
      >
        <div className="flex items-center justify-between text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">
          <strong className="text-base">Devy</strong>
          <button
            type="button"
            className={`grid w-9 h-9 place-items-center border-0 rounded-lg bg-transparent text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] ${focusRing}`}
            onClick={() => setIsDevyOpen(false)}
            aria-label="Close Devy chat"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1">
          <p className="mt-6 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-sm leading-[1.55]">Hi, I’m Devy. Ask me about programs, variables, or the example on this page.</p>
        </div>
        <form
          className="mb-5 max-[720px]:mb-4 border rounded-full border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5]"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="text"
            className="w-full h-12 border-0 rounded-[inherit] bg-transparent px-4 text-[#89898e] [[data-theme=light]_&]:text-[#aaa] font-[inherit]"
            placeholder="Ask Devy"
            aria-label="Ask Devy a question"
          />
        </form>
      </aside>}

      {!isCoding && <footer
        className={`${isMilestone ? 'flex justify-center' : 'grid grid-cols-[1fr_auto]'} items-center border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] pt-2.5 px-6 pb-4 max-[720px]:pt-2 max-[720px]:px-3.5 max-[720px]:pb-3 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-80 max-[720px]:ml-0' : 'ml-0'}`}
      >
        {!isMilestone && <button
          type="button"
          className={`grid w-[70px] h-[70px] max-[720px]:w-[58px] max-[720px]:h-[58px] place-items-center border-0 bg-transparent p-0 ${focusRing}`}
          onClick={() => setIsDevyOpen(true)}
          aria-label="Open Devy chat"
          aria-expanded={isDevyOpen}
        >
          <img className="w-full h-full object-contain" src="/assets/devy.svg" alt="" />
        </button>}
        {footerAction && <ActionButton
          variant="primary"
          className={`${isMilestone ? 'w-[min(100%,640px)]' : 'min-w-[200px] max-[720px]:min-w-[164px]'} min-h-[50px] text-[15px] font-semibold`}
          onClick={footerAction.onClick}
        >
          {footerAction.label}
        </ActionButton>}
        {isQuiz && <span className="sr-only" aria-live="polite">Complete the exercise to continue.</span>}
      </footer>}
    </section>
  )
}
