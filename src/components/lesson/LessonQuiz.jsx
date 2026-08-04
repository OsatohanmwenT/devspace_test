import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

// `onComplete` gates lesson progression and so fires only on a perfect score.
// `onChecked` reports the score on every check, which is what practice needs.
export function LessonQuiz({ quiz, initialState, onStateChange, onComplete, onChecked }) {
  const [answers, setAnswers] = useState(initialState?.answers ?? {})
  const [checked, setChecked] = useState(initialState?.checked ?? false)

  const updateState = (nextAnswers, nextChecked) => {
    setAnswers(nextAnswers)
    setChecked(nextChecked)
    onStateChange?.({ answers: nextAnswers, checked: nextChecked })
  }

  const selectOption = (questionId, optionIndex) => {
    updateState({ ...answers, [questionId]: optionIndex }, false)
  }

  const fillNextBlank = (question, optionIndex) => {
    const currentAnswers = answers[question.id] ?? Array(question.answers.length).fill(undefined)
    const nextBlankIndex = currentAnswers.findIndex((answer) => answer === undefined)

    if (nextBlankIndex === -1) return

    const nextAnswers = [...(answers[question.id] ?? Array(question.answers.length).fill(undefined))]
    nextAnswers[nextBlankIndex] = optionIndex
    updateState({ ...answers, [question.id]: nextAnswers }, false)
  }

  const clearBlank = (questionId, blankIndex) => {
    const nextAnswers = [...(answers[questionId] ?? [])]
    nextAnswers[blankIndex] = undefined
    updateState({ ...answers, [questionId]: nextAnswers }, false)
  }

  const isQuestionComplete = (question) => question.type === 'fill'
    ? (answers[question.id] ?? []).length === question.answers.length && (answers[question.id] ?? []).every((answer) => answer !== undefined)
    : answers[question.id] !== undefined

  const isQuestionCorrect = (question) => question.type === 'fill'
    ? question.answers.every((answer, index) => question.options[answers[question.id]?.[index]] === answer)
    : answers[question.id] === question.correctIndex

  const canCheck = quiz.questions.every(isQuestionComplete)
  const correctCount = quiz.questions.filter(isQuestionCorrect).length

  const checkAnswers = () => {
    updateState(answers, true)
    onChecked?.({ correctCount, total: quiz.questions.length })
    if (correctCount === quiz.questions.length) onComplete?.()
  }

  return (
    <article className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-labelledby="lesson-quiz-title">
      <div className="w-[min(100%,760px)] mx-auto pt-[clamp(24px,4vw,48px)] px-7 pb-10 max-[720px]:pt-6 max-[720px]:px-5 max-[720px]:pb-9">
        <h1
          id="lesson-quiz-title"
          className="max-w-[22ch] mt-0 mb-2.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] font-['Space_Grotesk',Arial,sans-serif] text-[clamp(26px,3vw,34px)] max-[720px]:text-[28px] font-semibold tracking-[-0.04em] leading-[1.15]"
        >
          {quiz.title}
        </h1>
        <p className="max-w-[58ch] m-0 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-[17px] max-[720px]:text-base leading-[1.55]">{quiz.intro}</p>

        {quiz.questions.map((question, questionIndex) => (
          <section className="max-w-[62ch] mt-7 max-[720px]:mt-6" key={question.id}>
            <h2 className="mt-0 mb-3 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] font-['Space_Grotesk',Arial,sans-serif] text-[19px] font-semibold tracking-[-0.02em]">{questionIndex + 1}. {question.prompt}</h2>

            {question.type === 'fill' ? (
              <div className="max-w-[62ch]" aria-label={question.prompt}>
                <p className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] text-[clamp(19px,2.2vw,24px)] max-[720px]:text-xl leading-[1.7]">
                  {question.segments.map((segment, blankIndex) => (
                    <span key={`${question.id}-${segment}`}>
                      {segment}
                      {blankIndex < question.answers.length && (() => {
                        const selectedOptionIndex = answers[question.id]?.[blankIndex]
                        const selectedOption = selectedOptionIndex === undefined ? undefined : question.options[selectedOptionIndex]
                        const isCorrect = selectedOption === question.answers[blankIndex]
                        const blankClassName = checked && isCorrect
                          ? 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] border border-solid rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] cursor-pointer border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]'
                          : checked && selectedOption && !isCorrect
                            ? 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] border border-solid rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] cursor-pointer border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]'
                            : selectedOption
                              ? 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] border border-solid rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] cursor-pointer border-[#6f66ec] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]'
                              : 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] border border-dashed rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] cursor-default opacity-100 border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]'

                        return (
                          <button
                            type="button"
                            className={`${blankClassName} focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6f66ec]`}
                            disabled={!selectedOption}
                            onClick={() => clearBlank(question.id, blankIndex)}
                            aria-label={selectedOption ? `Blank ${blankIndex + 1}: ${selectedOption}. Click to clear.` : `Blank ${blankIndex + 1}: empty`}
                          >
                            {selectedOption ?? ' '}
                          </button>
                        )
                      })()}
                    </span>
                  ))}
                </p>
                <p className="mt-[26px] mb-2.5 text-[#b2b2b6] [[data-theme=light]_&]:text-[#777] text-base font-semibold">Click an option to fill the blanks:</p>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label={`Options for: ${question.prompt}`}>
                  {question.options.map((option, optionIndex) => {
                    const isUsed = (answers[question.id] ?? []).includes(optionIndex)
                    return (
                      <button
                        type="button"
                        key={option}
                        className="min-h-11 border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] rounded-[10px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-4 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] font-[inherit] text-[15px] font-semibold transition-[border-color,background] duration-[120ms] ease-in-out enabled:hover:border-[#6f66ec] enabled:hover:bg-[#272634] [[data-theme=light]_&]:enabled:hover:bg-[#f1f0fd] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#6f66ec]"
                        disabled={isUsed}
                        onClick={() => fillNextBlank(question, optionIndex)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="grid gap-2.5" role="group" aria-label={question.prompt}>
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[question.id] === optionIndex
                  const isCorrectOption = optionIndex === question.correctIndex
                  const optionClassName = checked && isCorrectOption
                    ? 'border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed]'
                    : checked && isSelected && !isCorrectOption
                      ? 'border-[#ff676d] bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2]'
                      : isSelected
                        ? 'border-[#6f66ec] bg-[#2f2e3e] [[data-theme=light]_&]:bg-[#e5e4f4]'
                        : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] hover:border-[#6f66ec]'

                  return (
                    <button
                      type="button"
                      key={option}
                      className={`border rounded-xl px-4 py-3 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] text-[15px] leading-[1.5] text-left transition-[border-color,background] duration-[120ms] ease-in-out ${optionClassName}`}
                      aria-pressed={isSelected}
                      onClick={() => selectOption(question.id, optionIndex)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}

            {checked && (
              <p className={`mt-2.5 mb-0 text-sm leading-[1.5] ${isQuestionCorrect(question) ? 'text-[#04adc0]' : 'text-[#ff676d]'}`}>
                {question.explanation}
              </p>
            )}
          </section>
        ))}

        <div className="flex items-center gap-3.5 mt-8 max-[720px]:flex-wrap">
          <ActionButton
            variant="primary"
            className="min-w-[200px] min-h-[50px] text-[15px] font-semibold"
            disabled={!canCheck}
            onClick={checkAnswers}
            aria-describedby={!canCheck ? 'lesson-quiz-check-hint' : undefined}
          >
            Check answers
          </ActionButton>
          {!canCheck && <span className="text-[#89898e] [[data-theme=light]_&]:text-[#aaa] text-[13px]" id="lesson-quiz-check-hint">Answer every question to unlock</span>}
          {checked && canCheck && (
            <p className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818] text-sm font-semibold" role="status">
              {correctCount} of {quiz.questions.length} correct
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

