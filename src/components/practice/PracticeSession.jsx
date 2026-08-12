import { useEffect, useState } from 'react'
import { practiceSessions } from '../../data/practice'
import { ActionButton } from '../ui/ActionButton'
import { LessonProgressStrip } from '../lesson/LessonProgressStrip'
import { LessonQuestion } from '../lesson/LessonQuestion'
import { isQuestionComplete, isQuestionCorrect } from '../lesson/questionState'
import { PracticeIntro } from './PracticeIntro'

export function PracticeSession({ sessionId, completion, onExit, onComplete }) {
  const session = practiceSessions.find((item) => item.id === sessionId)
  const [phase, setPhase] = useState('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState({})

  const currentQuestion = session?.questions[questionIndex]
  const currentState = currentQuestion ? questionStates[currentQuestion.id] : undefined
  const answer = currentState?.answer
  const checked = currentState?.checked ?? false
  const canCheck = currentQuestion && isQuestionComplete(currentQuestion, answer)
  const isLastQuestion = questionIndex === (session?.questions.length ?? 1) - 1

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onExit()
      const isExitButton = event.target.closest?.('[aria-label="Exit practice session"]')
      if (phase === 'intro' && event.key === 'Enter' && !event.repeat && !isExitButton) {
        event.preventDefault()
        setPhase('quiz')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onExit, phase])

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

  if (!session || !currentQuestion) return null

  const answerQuestion = (nextAnswer) => {
    setQuestionStates((current) => ({
      ...current,
      [currentQuestion.id]: { answer: nextAnswer, checked: false },
    }))
  }

  const checkQuestion = () => {
    setQuestionStates((current) => ({
      ...current,
      [currentQuestion.id]: { answer, checked: true },
    }))
  }

  const finishPractice = () => {
    const correctCount = session.questions.filter((question) => isQuestionCorrect(question, questionStates[question.id]?.answer)).length
    onComplete?.(session.id, correctCount, session.questions.length)
    onExit()
  }

  const continueQuestion = () => {
    if (isLastQuestion) finishPractice()
    else setQuestionIndex((current) => current + 1)
  }

  const footerAction = checked
    ? { label: isLastQuestion ? 'Finish practice' : 'Continue', onClick: continueQuestion }
    : { label: 'Check answer', onClick: checkQuestion, disabled: !canCheck }

  return (
    <section className="fixed inset-0 z-20 grid grid-rows-[56px_minmax(0,1fr)_84px] overflow-hidden bg-[var(--surface-canvas)] [[data-theme=light]_&]:bg-white text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]" aria-label="Practice session">
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] bg-[var(--surface-default)] [[data-theme=light]_&]:bg-[var(--surface-canvas)] px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className="grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777] hover:bg-[var(--surface-raised)] [[data-theme=light]_&]:hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] [[data-theme=light]_&]:hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-cta)]"
          onClick={onExit}
          aria-label="Exit practice session"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {phase === 'quiz' && (
          <LessonProgressStrip
            currentStep={questionIndex + 1}
            totalSteps={session.questions.length}
            onPrevious={questionIndex > 0 ? () => setQuestionIndex((current) => current - 1) : undefined}
            onNext={!isLastQuestion && checked ? continueQuestion : undefined}
          />
        )}
        {phase === 'intro' && <span className="ml-3 text-sm font-semibold">{session.title}</span>}
      </header>

      {phase === 'intro' ? (
        <PracticeIntro session={session} completion={completion} onStart={() => setPhase('quiz')} />
      ) : (
        <>
          <main className="min-w-0 min-h-0 overflow-auto bg-[var(--surface-default)] [[data-theme=light]_&]:bg-white">
            <div className="grid min-h-full w-[min(100%,760px)] place-items-center mx-auto px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
              <LessonQuestion
                question={currentQuestion}
                headingLevel="h1"
                answer={answer}
                checked={checked}
                onAnswer={answerQuestion}
              />
            </div>
          </main>

          <footer className="flex items-center justify-end gap-4 border-t border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] px-6 py-3 max-[720px]:px-3.5">
            {checked && <span className={`mr-auto text-sm font-semibold ${isQuestionCorrect(currentQuestion, answer) ? 'text-[var(--accent-data)]' : 'text-[var(--accent-error)]'}`} role="status">
              {isQuestionCorrect(currentQuestion, answer) ? 'Correct' : 'Review the explanation'}
            </span>}
            <ActionButton
              variant="primary"
              className="min-h-[50px] min-w-[200px] text-[15px] font-semibold max-[720px]:min-w-[164px]"
              onClick={footerAction.onClick}
              disabled={footerAction.disabled}
            >
              {footerAction.label}
            </ActionButton>
          </footer>
        </>
      )}
    </section>
  )
}
