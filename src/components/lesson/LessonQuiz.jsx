import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

export function LessonQuiz({ quiz }) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  const selectOption = (questionId, optionIndex) => {
    setChecked(false)
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }))
  }

  const canCheck = quiz.questions.every((question) => answers[question.id] !== undefined)
  const correctCount = quiz.questions.filter((question) => answers[question.id] === question.correctIndex).length

  return (
    <article className="lesson-quiz" aria-labelledby="lesson-quiz-title">
      <div className="lesson-quiz-content">
        <h1 id="lesson-quiz-title">{quiz.title}</h1>
        <p className="lesson-quiz-intro">{quiz.intro}</p>

        {quiz.questions.map((question, questionIndex) => (
          <section className="lesson-quiz-question" key={question.id}>
            <h2>{questionIndex + 1}. {question.prompt}</h2>
            <div className="lesson-quiz-options" role="group" aria-label={question.prompt}>
              {question.options.map((option, optionIndex) => {
                const isSelected = answers[question.id] === optionIndex
                const isCorrectOption = optionIndex === question.correctIndex
                const optionClassName = [
                  'lesson-quiz-option',
                  isSelected && 'is-selected',
                  checked && isCorrectOption && 'is-correct',
                  checked && isSelected && !isCorrectOption && 'is-incorrect',
                ].filter(Boolean).join(' ')

                return (
                  <button
                    type="button"
                    key={option}
                    className={optionClassName}
                    aria-pressed={isSelected}
                    onClick={() => selectOption(question.id, optionIndex)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            {checked && (
              <p className={`lesson-quiz-feedback ${answers[question.id] === question.correctIndex ? 'is-correct' : 'is-incorrect'}`}>
                {question.explanation}
              </p>
            )}
          </section>
        ))}

        <div className="lesson-quiz-submit-group">
          <ActionButton
            variant="primary"
            className="lesson-quiz-check-button"
            disabled={!canCheck}
            onClick={() => setChecked(true)}
            aria-describedby={!canCheck ? 'lesson-quiz-check-hint' : undefined}
          >
            Check answers
          </ActionButton>
          {!canCheck && <span className="lesson-quiz-check-hint" id="lesson-quiz-check-hint">Answer every question to unlock</span>}
          {checked && canCheck && (
            <p className="lesson-quiz-result" role="status">
              {correctCount} of {quiz.questions.length} correct
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
