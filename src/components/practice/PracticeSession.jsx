import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { questsAdvanced } from '../../lib/dailyQuests'
import { practiceSessions } from '../../data/practice'
import { ActionButton } from '../ui/ActionButton'
import { DevyLottie } from '../ui/DevyLottie'
import { LessonProgressStrip } from '../lesson/LessonProgressStrip'
import { LessonQuestion } from '../lesson/LessonQuestion'
import { isQuestionComplete, isQuestionCorrect } from '../lesson/questionState'
import { PracticeIntro } from './PracticeIntro'
import { PracticeResult } from './PracticeResult'
import { WarmUpIntro } from './WarmUpIntro'

const CHEERS = ['Nailed it!', 'That’s the one.', 'Spot on.', 'You’ve got this.']
const NUDGES = ['Tricky one — check the explanation.', 'Not quite. The explanation has it.', 'Close! Give the explanation a read.']

// Devy rides along through every round and reacts to each answer: listening
// while the learner thinks, celebrating a right answer, thinking it over with
// them after a wrong one — the blame stays on the question, never the learner.
// Keyed by question and outcome so each reaction plays from its first frame.
function PracticeDevy({ questionIndex, checked, correct }) {
  const clip = !checked ? 'listening' : correct ? 'lesson-complete' : 'thinking'
  const line = !checked ? null : correct ? CHEERS[questionIndex % CHEERS.length] : NUDGES[questionIndex % NUDGES.length]
  return (
    <span className="mr-auto flex min-w-0 items-end gap-3 self-end" role="status" aria-live="polite">
      {/* Taller than the footer on purpose: Devy stands on the footer's floor
          and peeks up over its top edge, so it reads as a character in the
          room rather than an icon in a toolbar. */}
      <DevyLottie
        key={`${questionIndex}-${clip}`}
        clip={clip}
        loop={clip !== 'lesson-complete'}
        className="-mt-16 -mb-6 -ml-3 size-[124px] flex-none max-[720px]:-mt-9 max-[720px]:size-[84px]"
      />
      {line && (
        <span className={`mb-4 -ml-4 min-w-0 text-sm font-semibold leading-snug ${correct ? 'text-[#04adc0]' : 'text-[#ff676d]'}`}>
          {line}
        </span>
      )}
    </span>
  )
}

// `session` lets a caller pass a round built on the fly (the warm-up, a unit's
// practice set) instead of one from the practice catalogue.
//
// variant="warm-up" is the pre-lesson round: Devy's rope intro instead of the
// stats screen, and no results screen at the end — finishing records the round
// and calls `onFinish`, which carries straight on into the lesson.
export function PracticeSession({ sessionId, session: sessionOverride, variant = 'practice', completion, xpAward = 0, quests = null, onExit, onComplete, onFinish }) {
  const isWarmUp = variant === 'warm-up'
  const session = sessionOverride ?? practiceSessions.find((item) => item.id === sessionId)
  const [phase, setPhase] = useState('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState({})
  // Captured when the round ends rather than read from the prop at render time:
  // completing the session is what makes the next replay worth less, so the
  // prop has already moved on by the time this screen paints.
  const [result, setResult] = useState(null)
  // Today's quests as they stood when the round opened; the live `quests`
  // prop has moved on by the results screen, which shows the difference.
  const [questsBefore] = useState(quests)

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

  // Ends the round on a results screen instead of closing outright. The record
  // is still written here, so nothing depends on the learner reading it.
  const finishPractice = () => {
    const correctCount = session.questions.filter((question) => isQuestionCorrect(question, questionStates[question.id]?.answer)).length
    onComplete?.(session.id, correctCount, session.questions.length)
    if (isWarmUp) {
      onFinish?.()
      return
    }
    setResult({ correctCount, total: session.questions.length, xpAward, isReplay: Boolean(completion) })
    setPhase('result')
  }

  const retryPractice = () => {
    setQuestionStates({})
    setQuestionIndex(0)
    setResult(null)
    setPhase('quiz')
  }

  const continueQuestion = () => {
    if (isLastQuestion) finishPractice()
    else setQuestionIndex((current) => current + 1)
  }

  const footerAction = checked
    ? { label: isLastQuestion ? (isWarmUp ? 'Start the lesson' : 'Finish practice') : 'Continue', onClick: continueQuestion }
    : { label: 'Check answer', onClick: checkQuestion, disabled: !canCheck }

  // Only the quiz has a footer. Reserving its 84px on the intro and results
  // screens too left a dead band under the content and pushed both of them
  // visibly above centre.
  return (
    <section className={`fixed inset-0 z-20 grid ${phase === 'quiz' ? 'grid-rows-[56px_minmax(0,1fr)_84px]' : 'grid-rows-[56px_minmax(0,1fr)]'} overflow-hidden bg-[#121212] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`} aria-label="Practice session">
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_44px] items-center border-b border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fafaf8] px-5 max-[720px]:px-3.5">
        <button
          type="button"
          className="grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
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
        {(phase === 'intro' || phase === 'result') && <span className="ml-3 text-sm font-semibold">{session.title}</span>}
      </header>

      {phase === 'intro' && isWarmUp ? (
        <WarmUpIntro session={session} onDone={() => setPhase('quiz')} />
      ) : phase === 'intro' ? (
        <PracticeIntro session={session} completion={completion} onStart={() => setPhase('quiz')} />
      ) : phase === 'result' && result ? (
        <PracticeResult
          session={session}
          correctCount={result.correctCount}
          total={result.total}
          xpAward={result.xpAward}
          isReplay={result.isReplay}
          quests={quests && questsBefore && questsAdvanced(questsBefore, quests) ? { before: questsBefore, after: quests } : null}
          onRetry={retryPractice}
          onDone={onExit}
        />
      ) : (
        <>
          <motion.main
            className="min-w-0 min-h-0 overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid min-h-full w-[min(100%,760px)] place-items-center mx-auto px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
              <LessonQuestion
                question={currentQuestion}
                headingLevel="h1"
                answer={answer}
                checked={checked}
                onAnswer={answerQuestion}
              />
            </div>
          </motion.main>

          <footer className="flex items-center justify-end gap-4 border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] px-6 py-3 max-[720px]:px-3.5">
            <PracticeDevy questionIndex={questionIndex} checked={checked} correct={checked && isQuestionCorrect(currentQuestion, answer)} />
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
