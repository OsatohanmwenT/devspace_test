import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from 'cuelume'
import { ActionButton } from '../ui/ActionButton'
import { LessonNavigationPill } from './LessonNavigationPill'
import { LessonProgressStrip } from './LessonProgressStrip'
import { ConceptTransition } from './ConceptTransition'
import { LessonArticle } from './LessonArticle'
import { NarrationControl } from './NarrationControl'
import { LessonQuestion } from './LessonQuestion'
import { LessonPractice } from './LessonPractice'
import { DevyAssistant } from './DevyAssistant'
import { DevySpeechBubble } from './DevySpeechBubble'
import { ChecklistIcon, GemIcon } from '../ui/icons'
import { DevyMood } from '../ui/DevyMood'
import { getLesson, writingProgramsLesson } from './lessonContent'
import { buildLessonFlow } from './lessonFlow'
import { clearIncorrectBlanks, isFillType, isQuestionComplete, isQuestionCorrect } from './questionState'
import { getDevyLine, getQuizIntro } from '../../lib/devy'
import { getPersistedRate, getPersistedVoice, speakText, useNarrationPersonality } from './useLessonNarration'
import { LESSON_XP } from '../../lib/lessonMeta'
import { NotesDrawer } from './NotesDrawer'
import { CheatsheetDrawer } from '../paths/CheatsheetDrawer'
import { getLessonTopics } from '../../data/learningResources'

const STREAK_THRESHOLD = 3
// A wrong answer gets one retry with coaching before the explanation reveals
// — enough to let a learner correct a slip without turning every miss into
// an open-ended guessing game.
const MAX_QUESTION_ATTEMPTS = 2

function loadLessonSession(storageKey, flowLength) {
  const empty = { stepIndex: 0, activityStates: {}, streak: 0, assistedByDevy: false }
  try {
    const savedSession = JSON.parse(localStorage.getItem(storageKey))
    if (!savedSession) return empty

    return {
      stepIndex: Math.min(Math.max(savedSession.stepIndex ?? 0, 0), flowLength - 1),
      activityStates: savedSession.activityStates ?? {},
      streak: savedSession.streak ?? 0,
      assistedByDevy: savedSession.assistedByDevy ?? false,
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
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  // Earn It First: opening Devy before a first attempt on any question here
  // forfeits this lesson's XP/coins, same lever a repeat completion already
  // uses (see getLessonCoinAward). Warned once per session — after that the
  // session's already marked assisted, so there's nothing more to lose.
  const [isEarnItFirstDialogOpen, setIsEarnItFirstDialogOpen] = useState(false)
  const earnItFirstStayRef = useRef(null)
  const [isSaved, setIsSaved] = useState(false)
  const [successPulse, setSuccessPulse] = useState(0)
  const [errorPulse, setErrorPulse] = useState(0)
  const [audioReadyForNext, setAudioReadyForNext] = useState(false)
  const [devyLine, setDevyLine] = useState(null)
  const [isDevyTalking, setIsDevyTalking] = useState(false)
  const devyLineTimerRef = useRef(null)
  const devyTalkTimerRef = useRef(null)
  const exitButtonRef = useRef(null)
  const stayButtonRef = useRef(null)
  const exitDialogRef = useRef(null)
  const lessonTopics = useMemo(() => getLessonTopics(activeLessonId), [activeLessonId])
  const { personality, changePersonality } = useNarrationPersonality()

  const currentStep = lessonFlow[session.stepIndex]
  const isMilestone = currentStep?.kind === 'transition' || currentStep?.kind === 'complete' || currentStep?.kind === 'skill-check'
  const isQuestion = currentStep?.type === 'question'
  const isPractice = currentStep?.type === 'practice'

  const questionState = isQuestion ? session.activityStates[currentStep.id] : undefined
  const answer = questionState?.answer
  // `checked` means resolved — correct, or the attempt cap was reached — not
  // merely "Check was pressed once." A session saved before retries existed
  // has no `attempts` field; defaulting it to 0 treats that as a fresh start.
  const isChecked = questionState?.checked ?? false
  const attempts = questionState?.attempts ?? 0
  const isRetrying = isQuestion && attempts > 0 && !isChecked
  const canCheck = isQuestion && isQuestionComplete(currentStep.question, answer)
  const isLastStep = session.stepIndex === lessonFlow.length - 1

  const practiceState = isPractice ? session.activityStates[currentStep.id] : undefined
  const practiceAnswer = practiceState?.answer
  const isPracticeComplete = Boolean(practiceState?.completed)
  // DevyAssistant only needs "is this step resolved" — question and practice
  // steps each define that differently; article/transition steps don't use it.
  const isStepResolved = isQuestion ? isChecked : isPractice ? isPracticeComplete : false

  useEffect(() => {
    setAudioReadyForNext(false)
  }, [currentStep?.id])

  // Devy's commentary speaks a quiz's framing line the moment its first
  // question (or its skill-check screen) appears — once per quiz, not once
  // per question, matching how the on-screen quiz intro only shows once too.
  useEffect(() => {
    if (!personality || !currentStep) return
    if (currentStep.kind === 'skill-check') {
      speakText(getQuizIntro(null), { rate: getPersistedRate(), voice: getPersistedVoice() })
      return
    }
    if (currentStep.type === 'question' && currentStep.questionIndex === 0) {
      const quizContent = currentStep.concept?.activities?.[currentStep.activityIndex]?.content
      speakText(getQuizIntro(quizContent), { rate: getPersistedRate(), voice: getPersistedVoice() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the step identity only, personality changing mid-step shouldn't replay the line
  }, [currentStep?.id])

  // Real tallies for the break-screen recap strip — never invented copy. Scoped
  // to one concept for a mid-lesson hand-off, to the whole flow for the finish.
  const questionRecap = (concept) => {
    // Transition/complete steps don't carry a conceptIndex the way activity
    // steps do (see buildLessonFlow) — match by the concept object itself.
    const questions = lessonFlow.filter((step) => step.type === 'question' && (concept === undefined || step.concept === concept))
    const correct = questions.filter((step) => {
      const state = session.activityStates[step.id]
      return state?.checked && isQuestionCorrect(step.question, state.answer)
    }).length
    return { correct, total: questions.length }
  }

  const recapStats = (concept) => {
    const { correct, total } = questionRecap(concept)
    const stats = []
    if (total > 0) stats.push({ value: `${correct}/${total}`, label: 'correct' })
    if (session.streak >= STREAK_THRESHOLD) stats.push({ value: `${session.streak}`, label: 'in a row' })
    return stats
  }

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
    setDevyLine(null)
  }

  const goPrevious = () => {
    setSession((current) => ({ ...current, stepIndex: Math.max(current.stepIndex - 1, 0) }))
    setIsDevyOpen(false)
    setSuccessPulse(0)
    setErrorPulse(0)
    setDevyLine(null)
  }

  const answerQuestion = (nextAnswer) => {
    setSession((current) => ({
      ...current,
      // Spread the existing entry so `attempts` survives a re-answer during a
      // retry instead of being wiped back to a fresh-question state.
      activityStates: { ...current.activityStates, [currentStep.id]: { ...current.activityStates[currentStep.id], answer: nextAnswer, checked: false } },
    }))
  }

  const answerPractice = (nextAnswer) => {
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { ...current.activityStates[currentStep.id], answer: nextAnswer } },
    }))
  }

  const completePractice = () => {
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { ...current.activityStates[currentStep.id], completed: true } },
    }))
  }

  // Devy "says" a line above the footer avatar for a few seconds, with a
  // matching bounce on the mascot itself — an ambient reaction, not the
  // full chat panel. Each call replaces whatever was showing before it.
  const sayDevyLine = (text) => {
    clearTimeout(devyLineTimerRef.current)
    clearTimeout(devyTalkTimerRef.current)
    setDevyLine({ id: Date.now(), text })
    setIsDevyTalking(true)
    devyTalkTimerRef.current = window.setTimeout(() => setIsDevyTalking(false), 1400)
    devyLineTimerRef.current = window.setTimeout(() => setDevyLine(null), 4200)
  }

  useEffect(() => () => {
    clearTimeout(devyLineTimerRef.current)
    clearTimeout(devyTalkTimerRef.current)
  }, [])

  const checkQuestion = () => {
    const correct = isQuestionCorrect(currentStep.question, answer)
    const nextAttempts = attempts + 1
    const resolved = correct || nextAttempts >= MAX_QUESTION_ATTEMPTS

    if (!resolved) {
      // A retry left: nudge, don't reveal — clear only the wrong blanks so a
      // fill question doesn't undo what was already right.
      setErrorPulse((current) => current + 1)
      play('error')
      const line = getDevyLine({ event: 'retry' })
      sayDevyLine(line)
      if (personality) speakText(line, { rate: getPersistedRate(), voice: getPersistedVoice() })
      const clearedAnswer = isFillType(currentStep.question) ? clearIncorrectBlanks(currentStep.question, answer) : undefined
      setSession((current) => ({
        ...current,
        activityStates: { ...current.activityStates, [currentStep.id]: { answer: clearedAnswer, checked: false, attempts: nextAttempts } },
      }))
      return
    }

    if (correct) {
      setSuccessPulse((current) => current + 1)
      play('success')
    } else {
      setErrorPulse((current) => current + 1)
      play('error')
    }
    // Only a clean first-try answer extends the in-a-row counter — a correct
    // guess on retry shouldn't read the same as getting it right the first time.
    const firstTryCorrect = correct && nextAttempts === 1
    const nextStreak = firstTryCorrect ? session.streak + 1 : 0
    const line = correct && nextStreak >= STREAK_THRESHOLD
      ? getDevyLine({ event: 'streak', streak: nextStreak })
      : getDevyLine({ event: correct ? 'correct' : 'incorrect' })
    sayDevyLine(line)
    // The ambient bubble and the spoken line are always the same words —
    // just two channels, one visual and one (when Devy's commentary is on)
    // audible.
    if (personality) speakText(line, { rate: getPersistedRate(), voice: getPersistedVoice() })
    setSession((current) => ({
      ...current,
      activityStates: { ...current.activityStates, [currentStep.id]: { answer, checked: true, attempts: nextAttempts, firstTryCorrect } },
      streak: nextStreak,
    }))
  }

  // Gate, don't block: an unanswered question is the one place asking Devy
  // has a real cost, and only the first time this session — once assisted,
  // the reward's already gone, so later questions open Devy freely.
  const openDevy = () => {
    if (isQuestion && !isChecked && !session.assistedByDevy) {
      setIsEarnItFirstDialogOpen(true)
      return
    }
    setIsDevyOpen(true)
  }

  const keepTrying = () => {
    setIsEarnItFirstDialogOpen(false)
    window.setTimeout(() => exitButtonRef.current?.focus())
  }

  const askDevyAnyway = () => {
    setIsEarnItFirstDialogOpen(false)
    setSession((current) => ({ ...current, assistedByDevy: true }))
    setIsDevyOpen(true)
  }

  const finishLesson = () => {
    localStorage.removeItem(storageKey)
    onComplete?.(activeLessonId, { assisted: session.assistedByDevy })
    onExit()
  }

  const requestExit = () => {
    setIsLessonMenuOpen(false)
    setIsExitDialogOpen(true)
  }

  const stayInLesson = () => {
    setIsExitDialogOpen(false)
    window.setTimeout(() => exitButtonRef.current?.focus())
  }

  const leaveLesson = () => {
    localStorage.removeItem(storageKey)
    onExit()
  }

  useEffect(() => {
    if (!isExitDialogOpen) return undefined

    stayButtonRef.current?.focus()
    const handleDialogKeys = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        stayInLesson()
        return
      }
      if (event.key !== 'Tab') return

      const buttons = exitDialogRef.current?.querySelectorAll('button')
      if (!buttons?.length) return
      const firstButton = buttons[0]
      const lastButton = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault()
        lastButton.focus()
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault()
        firstButton.focus()
      }
    }

    document.addEventListener('keydown', handleDialogKeys)
    return () => document.removeEventListener('keydown', handleDialogKeys)
  }, [isExitDialogOpen])

  useEffect(() => {
    if (isEarnItFirstDialogOpen) earnItFirstStayRef.current?.focus()
  }, [isEarnItFirstDialogOpen])

  const footerAction = !currentStep
    ? null
    : currentStep.kind === 'transition'
      ? { label: `Continue to ${currentStep.nextConcept.title}`, onClick: goNext }
      : currentStep.kind === 'complete'
        ? { label: 'Return to path', onClick: finishLesson }
        : currentStep.kind === 'skill-check'
          ? { label: 'Start skill check', onClick: goNext }
          : currentStep.type === 'article'
          ? {
              label: audioReadyForNext
                ? (lessonFlow[session.stepIndex + 1]?.type === 'question' ? 'Start quick check' : 'Continue lesson')
                : 'Continue',
              onClick: goNext,
            }
          : isQuestion
            ? (isChecked
              ? { label: 'Continue', onClick: goNext }
              : { label: attempts > 0 ? 'Try again' : 'Check', onClick: checkQuestion, disabled: !canCheck })
            : isPractice
              ? { label: 'Continue', onClick: goNext, disabled: !isPracticeComplete }
              : { label: 'Continue', onClick: goNext }

  // Ctrl/Cmd+Enter drives the primary action; number keys pick an option.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isExitDialogOpen) return
      // The drawer owns the keyboard while it's open.
      if (isNotesOpen || isCheatsheetOpen) return
      if (isEarnItFirstDialogOpen) {
        if (event.key === 'Escape') {
          event.preventDefault()
          keepTrying()
        }
        return
      }
      if (event.key === 'Escape') {
        requestExit()
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
      <header className="relative grid grid-cols-[44px_minmax(0,1fr)_auto] max-[720px]:grid-cols-[minmax(0,1fr)_auto] items-center gap-3 max-[720px]:gap-2 border-b border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-[#fdfcf9] px-5 max-[720px]:px-3.5">
        <button
          ref={exitButtonRef}
          type="button"
          className={`grid w-11 h-11 place-items-center border-0 rounded-lg bg-transparent shadow-none text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] hover:bg-[#262626] [[data-theme=light]_&]:hover:bg-[#f5f5f5] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-700 max-[720px]:hidden ${focusRing}`}
          onClick={requestExit}
          aria-label="Exit lesson"
        >
          <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="w-full min-w-0 justify-self-center">
          {navigationStyle === 'pill' ? <LessonNavigationPill /> : (
            <LessonProgressStrip
              currentStep={session.stepIndex + 1}
              totalSteps={Math.max(lessonFlow.length, 1)}
              onPrevious={session.stepIndex > 0 ? goPrevious : undefined}
              onNext={!isLastStep && (!isQuestion || isChecked) && (!isPractice || isPracticeComplete) ? goNext : undefined}
              streaking={showStreak}
            />
          )}
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <span className="flex h-9 items-center gap-1.5 rounded-full border border-[#e1e1e1] bg-white px-2.5 text-sm font-medium text-neutral-800 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1f1f1f] [[data-theme=dark]_&]:text-[#f4f4f2] max-[720px]:hidden" aria-label={`${xp} XP`}>
            <GemIcon className="size-[14px] text-[#513dec]" />
            {xp}
          </span>

          {currentStep?.type === 'article' && (
            <NarrationControl
              article={currentStep.content}
              onNarrationStart={() => setAudioReadyForNext(false)}
              onNarrationEnd={() => setAudioReadyForNext(true)}
              personality={personality}
              onChangePersonality={changePersonality}
            />
          )}

          {/* Reference belongs where the work happens — this is the moment you
              actually need to look up syntax. */}
          <div className="relative">
          <button
            type="button"
            className={`grid size-10 place-items-center rounded-[10px] border-0 bg-[#f5f5f5] text-neutral-800 hover:bg-[#eeeeeb] [[data-theme=dark]_&]:bg-[#262626] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#303030] ${isLessonMenuOpen ? '' : 'lesson-options-nudge'} ${focusRing}`}
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
              <div className="my-1 border-t border-[#eeeeeb] [[data-theme=dark]_&]:border-[#404040]" role="separator" />
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={() => setIsLessonMenuOpen(false)}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 21V4h12v11H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Report a problem</button>
              <button type="button" className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 hover:bg-[#f5f5f5] [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#262626]" role="menuitem" onClick={requestExit}><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>Exit lesson</button>
            </div>
          )}
          </div>
        </div>
      </header>

      <main
        className={`min-w-0 min-h-0 overflow-auto p-0 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-[var(--devy-panel-width)] max-[720px]:ml-0 max-[720px]:mt-[min(42vh,340px)]' : 'ml-0'}`}
      >
        {!lesson && <UnavailableLesson lessonId={activeLessonId} />}
        {currentStep?.type === 'article' && <LessonArticle
          article={currentStep.content}
          lessonTitle={lesson?.title}
        />}
        {isPractice && (
          <LessonPractice
            key={currentStep.id}
            content={currentStep.content}
            answer={practiceAnswer}
            onAnswerChange={answerPractice}
            onComplete={completePractice}
            completed={isPracticeComplete}
          />
        )}
        {isQuestion && (
          <div className="grid min-h-full w-[min(100%,760px)] place-items-center mx-auto px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
            <LessonQuestion
              key={currentStep.id}
              question={currentStep.question}
              headingLevel="h1"
              answer={answer}
              checked={isChecked}
              retrying={isRetrying}
              onAnswer={answerQuestion}
              onAskDevy={openDevy}
            />
          </div>
        )}
        {currentStep?.kind === 'transition' && <ConceptTransition {...currentStep.transition} stats={recapStats(currentStep.concept)} />}
        {currentStep?.kind === 'skill-check' && (
          <ConceptTransition
            eyebrow="Skill check"
            title={currentStep.quizTitle ?? 'Let’s check what you’ve learned'}
            body={currentStep.quizIntro ?? 'A few quick questions to make sure it’s sticking.'}
            badge={<ChecklistIcon className="size-5" />}
          />
        )}
        {currentStep?.kind === 'complete' && (
          <ConceptTransition
            {...currentStep.completion}
            mood="celebrating"
            stats={[{ value: `+${LESSON_XP}`, label: 'XP' }, ...recapStats()]}
          />
        )}
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
          checked={isStepResolved}
          profile={lesson?.role ? { ...profile, role: lesson.role } : profile}
          onClose={() => setIsDevyOpen(false)}
          focusRing={focusRing}
        />
      </aside>}

      <footer
        className={`${isMilestone ? 'flex justify-center' : 'grid grid-cols-[auto_minmax(0,1fr)_auto]'} items-center gap-3 border-t border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] py-2 px-6 max-[720px]:px-3.5 transition-[margin-left] duration-[180ms] ease-in-out ${isDevyPanelOpen ? 'ml-[var(--devy-panel-width)] max-[720px]:ml-0' : 'ml-0'}`}
      >
        {!isMilestone && (
          <div className="relative">
            <button
              type="button"
              className={`relative grid size-[54px] max-[720px]:size-12 place-items-center border-0 bg-transparent p-0 ${focusRing}`}
              onClick={openDevy}
              aria-label="Open Devy chat"
              aria-expanded={isDevyOpen}
            >
              {/* Three right in a row already lights a ring here; letting Devy react
                  too is what makes the streak feel noticed rather than counted. */}
              <DevyMood
                key={showStreak ? 'streaking' : 'idle'}
                mood={showStreak ? 'celebrating' : 'neutral'}
                className={showStreak ? 'w-full h-full' : `w-full h-full ${isDevyTalking ? 'devy-talking-avatar' : 'devy-idle'}`}
              />
              {showStreak && <span className="absolute inset-0 rounded-full ring-2 ring-[#f0c964]" aria-hidden="true" />}
            </button>
            <DevySpeechBubble key={devyLine?.id} text={devyLine?.text} />
          </div>
        )}

        {!isMilestone && (
          <div className="min-w-0" aria-live="polite">
            {audioReadyForNext && currentStep?.type === 'article' && (
              <p className="m-0 text-[13px] font-medium text-[#72d69a] [[data-theme=light]_&]:text-[#18794e]">Audio complete</p>
            )}
          </div>
        )}

        {footerAction && <ActionButton
          variant="primary"
          className={`${isMilestone ? 'min-w-[240px] max-[720px]:w-full px-10' : 'min-w-[200px] max-[720px]:min-w-[140px]'} min-h-11 text-[15px] font-semibold`}
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
      {isExitDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5">
          <div
            ref={exitDialogRef}
            className="grid w-full max-w-[440px] justify-items-center rounded-3xl bg-[#14252c] px-7 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,.45)] [[data-theme=light]_&]:bg-white max-[520px]:px-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-lesson-title"
          >
            <DevyMood mood="annoyed" className="mb-4 h-[102px] w-[90px] object-contain" />
            <h2 id="exit-lesson-title" className="m-0 max-w-[18ch] font-rethink-sans text-[24px] font-semibold leading-[1.35] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Wait, don’t go! You’ll lose your progress and XP if you leave now.</h2>
            <div className="mt-7 grid w-full gap-3">
              <button ref={stayButtonRef} type="button" className={`min-h-14 rounded-2xl bg-[#2563eb] px-5 text-[15px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_5px_0_#1d4ed8] hover:bg-[#3b82f6] active:translate-y-1 active:shadow-none ${focusRing}`} onClick={stayInLesson}>Keep learning</button>
              <button type="button" className={`min-h-11 px-5 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#ff6262] hover:text-[#ff8585] [[data-theme=light]_&]:text-[#d92d2d] ${focusRing}`} onClick={leaveLesson}>Leave lesson</button>
            </div>
          </div>
        </div>
      )}
      {isEarnItFirstDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5">
          <div
            className="grid w-full max-w-[440px] justify-items-center rounded-3xl bg-[#14252c] px-7 py-7 text-center shadow-[0_18px_48px_rgba(0,0,0,.45)] [[data-theme=light]_&]:bg-white max-[520px]:px-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="earn-it-first-title"
          >
            <DevyMood mood="neutral" className="mb-4 h-[102px] w-[90px] object-contain" />
            <span className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#88bdf2]">Earn It First</span>
            <h2 id="earn-it-first-title" className="m-0 max-w-[22ch] font-rethink-sans text-[22px] font-semibold leading-[1.35] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
              Try it yourself first.
            </h2>
            <p className="m-0 mt-2.5 max-w-[34ch] text-[14px] leading-[1.5] text-[#b2b2b6] [[data-theme=light]_&]:text-[#8a8a8e]">
              Asking Devy now costs this lesson its XP and coins. Devy can still rule out a wrong option, just not hand you the answer.
            </p>
            <div className="mt-6 grid w-full gap-3">
              <button ref={earnItFirstStayRef} type="button" className={`min-h-14 rounded-2xl bg-[#2563eb] px-5 text-[15px] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_5px_0_#1d4ed8] hover:bg-[#3b82f6] active:translate-y-1 active:shadow-none ${focusRing}`} onClick={keepTrying}>Keep trying</button>
              <button type="button" className={`min-h-11 px-5 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#9a9a9d] hover:text-[#c4c4c7] [[data-theme=light]_&]:text-[#8a8a8e] ${focusRing}`} onClick={askDevyAnyway}>Ask Devy anyway</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
