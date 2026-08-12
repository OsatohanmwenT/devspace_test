import { RichText } from './RichText'
import { tokenizePython, TOKEN_CLASSES } from './pythonHighlight'
import { clearBlank, fillNextBlank, isFillType, isQuestionCorrect } from './questionState'

const BLANK_BASE = 'inline-flex min-w-[102px] max-[720px]:min-w-[86px] min-h-[38px] max-[720px]:min-h-9 items-center justify-center mx-[3px] rounded-lg px-2.5 max-[720px]:px-2 py-[3px] text-[15px] leading-[1.2] align-middle font-[inherit] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--brand-cta)]'

function blankClassName(checked, selected, correct) {
  if (checked && selected && correct) return `${BLANK_BASE} border border-solid cursor-pointer border-[var(--accent-data)] bg-[var(--surface-data-tint)] [[data-theme=light]_&]:bg-[var(--surface-data-tint)] text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]`
  if (checked && selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[var(--accent-error)] bg-[var(--surface-error-tint)] [[data-theme=light]_&]:bg-[var(--surface-error-tint)] text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]`
  if (selected) return `${BLANK_BASE} border border-solid cursor-pointer border-[var(--brand-cta)] bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-white text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]`
  return `${BLANK_BASE} cursor-default border border-dashed border-[var(--border-interactive)] bg-[var(--surface-raised)] text-[var(--text-primary)]`
}

function Blank({ question, answer, blankIndex, checked, onAnswer, onDropOption }) {
  const selectedIndex = answer?.[blankIndex]
  const selected = selectedIndex === undefined ? undefined : question.options[selectedIndex]
  const correct = selected === question.answers[blankIndex]

  return (
    <button
      type="button"
      className={blankClassName(checked, selected, correct)}
      disabled={checked}
      onClick={() => onAnswer(clearBlank(answer, blankIndex))}
      onDragOver={(event) => {
        if (!selected && !checked) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropOption(Number(event.dataTransfer.getData('text/plain')), blankIndex)
      }}
      aria-label={selected ? `Blank ${blankIndex + 1}: ${selected}. Activate to clear.` : `Blank ${blankIndex + 1}: empty`}
    >
      {selected ?? ' '}
    </button>
  )
}

function TokenBank({ question, answer, checked, onAnswer }) {
  const used = answer ?? []

  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="Answer options">
      {question.options.map((option, optionIndex) => (
        <button
          type="button"
          key={optionIndex}
          className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-raised)] px-4 font-[inherit] text-[15px] font-semibold text-[var(--text-primary)] transition-[border-color,background] duration-[var(--duration-fast)] enabled:hover:border-[var(--brand-cta)] enabled:hover:bg-[var(--surface-brand-tint)] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--brand-cta)]"
          disabled={used.includes(optionIndex) || checked}
          draggable={!used.includes(optionIndex) && !checked}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', String(optionIndex))
          }}
          onClick={() => onAnswer(fillNextBlank(question, answer, optionIndex))}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Code with blanks — a Parsons-style exercise. The static parts are syntax
// highlighted; the blanks are the same fill model as prose questions.
function CodeFill({ question, answer, checked, onAnswer, onDropOption }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-default)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--surface-subtle)] px-4 py-2.5">
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-[var(--accent-data)] text-[9px] font-bold text-[var(--surface-default)]">PY</span>
        <span className="font-['JetBrains_Mono',ui-monospace,monospace] text-xs text-[var(--border-default)]">{question.filename ?? 'script.py'}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-['JetBrains_Mono',ui-monospace,monospace] text-[14px] leading-[1.9] text-[var(--border-default)]">
        <code>
          {question.segments.map((segment, index) => (
            <span key={index}>
              {tokenizePython(segment).map((token, tokenIndex) => (
                <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>{token.value}</span>
              ))}
              {index < question.answers.length && (
                <Blank question={question} answer={answer} blankIndex={index} checked={checked} onAnswer={onAnswer} onDropOption={onDropOption} />
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

function ProseFill({ question, answer, checked, onAnswer, onDropOption }) {
  return (
    <p className="m-0 text-[clamp(19px,2.2vw,24px)] max-[720px]:text-xl leading-[1.7] text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
      {question.segments.map((segment, index) => (
        <span key={index}>
          {segment}
          {index < question.answers.length && (
            <Blank question={question} answer={answer} blankIndex={index} checked={checked} onAnswer={onAnswer} onDropOption={onDropOption} />
          )}
        </span>
      ))}
    </p>
  )
}

function MultipleChoice({ question, answer, checked, onAnswer }) {
  return (
    <div className="grid gap-2.5" role="group" aria-label={question.prompt}>
      {question.options.map((option, optionIndex) => {
        const isSelected = answer === optionIndex
        const isCorrectOption = optionIndex === question.correctIndex
        const optionClassName = checked && isCorrectOption
          ? 'border-[var(--accent-data)] bg-[var(--surface-data-tint)] [[data-theme=light]_&]:bg-[var(--surface-data-tint)]'
          : checked && isSelected
            ? 'border-[var(--accent-error)] bg-[var(--surface-error-tint)] [[data-theme=light]_&]:bg-[var(--surface-error-tint)]'
            : isSelected
              ? 'border-[var(--brand-cta)] bg-[var(--surface-brand-tint)]'
              : 'border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] bg-[var(--surface-raised)] [[data-theme=light]_&]:bg-[var(--surface-subtle)] hover:border-[var(--brand-cta)]'

        return (
          <button
            type="button"
            key={optionIndex}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[15px] leading-[1.5] text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)] transition-[border-color,background] duration-[120ms] ${optionClassName}`}
            aria-pressed={isSelected}
            disabled={checked}
            onClick={() => onAnswer(optionIndex)}
          >
            <RichText content={option} />
            <span className="grid h-6 w-6 flex-none place-items-center rounded-md border border-[var(--border-default)] [[data-theme=light]_&]:border-[var(--border-default)] text-[11px] text-[var(--text-muted)] [[data-theme=light]_&]:text-[var(--text-secondary)]" aria-hidden="true">
              {optionIndex + 1}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function LessonQuestion({ question, answer, checked, onAnswer, headingLevel: Heading = 'h2', prefix }) {
  const correct = checked && isQuestionCorrect(question, answer)
  const placeOption = (optionIndex, blankIndex) => {
    if (checked || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length || answer?.includes(optionIndex) || answer?.[blankIndex] !== undefined) return
    const nextAnswer = [...(answer ?? Array(question.answers.length).fill(undefined))]
    nextAnswer[blankIndex] = optionIndex
    onAnswer(nextAnswer)
  }

  return (
    <section className="grid gap-4">
      <Heading className="m-0 font-['Rethink_Sans',Arial,sans-serif] text-[19px] font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">
        {prefix}<RichText content={question.prompt} />
      </Heading>

      {isFillType(question)
        ? <div className="grid gap-5 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--surface-subtle)] p-5 max-[720px]:p-4">
          {question.type === 'code-fill'
            ? <CodeFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />
            : <ProseFill question={question} answer={answer} checked={checked} onAnswer={onAnswer} onDropOption={placeOption} />}
          <div className="grid gap-3">
            <p className="m-0 text-base font-semibold text-[var(--text-secondary)] [[data-theme=light]_&]:text-[#777]">Click or drag an option to fill the blanks:</p>
            <TokenBank question={question} answer={answer} checked={checked} onAnswer={onAnswer} />
          </div>
        </div>
        : <MultipleChoice question={question} answer={answer} checked={checked} onAnswer={onAnswer} />}

      {checked && (
        <p className={`m-0 text-sm leading-[1.5] ${correct ? 'text-[var(--accent-data)]' : 'text-[var(--accent-error)]'}`}>
          <RichText content={question.explanation} />
        </p>
      )}
    </section>
  )
}
