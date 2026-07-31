import { useEffect, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { CodingLessonWorkspace } from './CodingLessonWorkspace'
import { LessonArticle } from './LessonArticle'
import { LessonQuiz } from './LessonQuiz'
import { writingProgramsArticle, writingProgramsQuiz } from './lessonContent'

const STEP_INDEX = { article: 1, quiz: 2, coding: 3 }
const PREVIOUS_STEP = { article: undefined, quiz: 'article', coding: 'quiz' }
const NEXT_STEP = { article: 'quiz', quiz: 'coding' }
const CONTINUE_LABEL = { article: 'Continue to quiz', quiz: 'Continue to coding' }

export default function LessonView({ mode = 'article', navigationStyle = 'segments', onExit }) {
  const [step, setStep] = useState(mode)
  const [isDevyOpen, setIsDevyOpen] = useState(false)
  const isCoding = step === 'coding'
  const previousStep = PREVIOUS_STEP[step]

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onExit()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onExit])

  return (
    <section className={`lesson-shell${isCoding ? ' lesson-shell-coding' : ''}${isDevyOpen && !isCoding ? ' is-devy-open' : ''}`} aria-label="Lesson">
      <header className="lesson-shell-topbar">
        <button type="button" className="lesson-shell-exit" onClick={onExit} aria-label="Exit lesson">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
          <LessonProgressStrip
            currentStep={STEP_INDEX[step]}
            totalSteps={3}
            onPrevious={previousStep ? () => setStep(previousStep) : undefined}
          />
        )}
      </header>

      <main className="lesson-shell-main">
        {step === 'article' && <LessonArticle article={writingProgramsArticle} />}
        {step === 'quiz' && <LessonQuiz quiz={writingProgramsQuiz} />}
        {step === 'coding' && <CodingLessonWorkspace />}
      </main>

      {!isCoding && <aside className="lesson-devy-sidebar" aria-label="Devy chat">
        <div className="lesson-devy-sidebar-header">
          <strong>Devy</strong>
          <button type="button" onClick={() => setIsDevyOpen(false)} aria-label="Close Devy chat">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="lesson-devy-sidebar-messages">
          <p>Hi, I’m Devy. Ask me about programs, variables, or the example on this page.</p>
        </div>
        <form className="lesson-devy-sidebar-input" onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="Ask Devy" aria-label="Ask Devy a question" />
        </form>
      </aside>}

      {!isCoding && <footer className="lesson-shell-footer">
        <button type="button" className="lesson-devy-launcher" onClick={() => setIsDevyOpen(true)} aria-label="Open Devy chat" aria-expanded={isDevyOpen}>
          <img src="/assets/devy.svg" alt="" />
        </button>
        <ActionButton variant="primary" className="lesson-shell-check" onClick={() => { setIsDevyOpen(false); setStep(NEXT_STEP[step]) }}>{CONTINUE_LABEL[step]}</ActionButton>
      </footer>}
    </section>
  )
}
