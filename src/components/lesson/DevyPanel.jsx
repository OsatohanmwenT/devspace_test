import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

export function DevyPanel({ question, options, onAnswered }) {
  const [selected, setSelected] = useState(null)

  const selectOption = (index) => {
    setSelected(index)
    onAnswered?.()
  }

  return (
    <aside className="devy-panel" aria-label="Devy assistant">
      <div className="devy-panel-header">
        <span className="devy-panel-avatar" aria-hidden="true">D</span>
        <strong>Devy</strong>
        <button type="button" className="devy-panel-collapse" aria-label="Collapse Devy panel">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="devy-panel-quiz">
        <p className="devy-panel-question">{question}</p>
        <div className="devy-panel-options">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={selected === index ? 'devy-panel-option is-selected' : 'devy-panel-option'}
              onClick={() => selectOption(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <form className="devy-panel-ask" onSubmit={(event) => event.preventDefault()}>
        <input type="text" placeholder="Ask Devy about this" aria-label="Ask Devy about this" />
        <ActionButton variant="primary" className="devy-panel-ask-button" type="submit">Ask</ActionButton>
      </form>
    </aside>
  )
}
