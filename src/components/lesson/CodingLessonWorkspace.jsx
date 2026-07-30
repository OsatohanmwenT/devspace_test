import { useEffect, useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

const lesson = {
  fileName: 'warmup.py',
  starterCode: '# Weekly learning hours\nhours = 6\n\n# Multiply hours by 52 to get yearly hours\nyearly = hours ____\n\n# Print the result\nprint(____)',
  answerPattern: /yearly\s*=\s*hours\s*\*\s*52[\s\S]*print\(\s*yearly\s*\)/,
}

function EditorSlot({ code, onChange }) {
  const lines = Math.max(code.split('\n').length, 12)

  return (
    <div className="coding-editor-body">
      <pre className="coding-line-numbers" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => <span key={index}>{index + 1}</span>)}
      </pre>
      <textarea value={code} onChange={(event) => onChange(event.target.value)} spellCheck="false" aria-label="Python code" />
    </div>
  )
}

export function CodingLessonWorkspace() {
  const workspaceRef = useRef(null)
  const [code, setCode] = useState(lesson.starterCode)
  const [runResult, setRunResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [instructionWidth, setInstructionWidth] = useState(450)
  const [consoleHeight, setConsoleHeight] = useState(260)
  const [resizing, setResizing] = useState(null)

  useEffect(() => {
    if (!resizing) return undefined

    const resize = (event) => {
      const bounds = workspaceRef.current?.getBoundingClientRect()
      if (!bounds) return

      if (resizing === 'instructions') {
        setInstructionWidth(Math.min(520, Math.max(320, event.clientX - bounds.left)))
      } else {
        setConsoleHeight(Math.min(bounds.height * .45, Math.max(140, bounds.bottom - event.clientY)))
      }
    }
    const stop = () => setResizing(null)

    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stop)
    return () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stop)
    }
  }, [resizing])

  const resetLesson = () => {
    setCode(lesson.starterCode)
    setRunResult(null)
    setSubmitted(false)
  }

  const runCode = () => {
    setSubmitted(false)
    setRunResult(lesson.answerPattern.test(code)
      ? { type: 'output', text: '312' }
      : { type: 'error', text: 'File "warmup.py", line 5\n  yearly = hours ____\n                 ^^^^\nSyntaxError: invalid syntax' })
  }

  const adjustSeparator = (separator, delta) => {
    if (separator === 'instructions') {
      setInstructionWidth((width) => Math.min(520, Math.max(320, width + delta)))
      return
    }
    const maxHeight = Math.max(140, (workspaceRef.current?.getBoundingClientRect().height ?? 930) * .45)
    setConsoleHeight((height) => Math.min(maxHeight, Math.max(140, height - delta)))
  }

  const handleSeparatorKeyDown = (separator, event) => {
    const arrows = separator === 'instructions'
      ? { ArrowLeft: -20, ArrowRight: 20 }
      : { ArrowUp: 20, ArrowDown: -20 }
    if (arrows[event.key] === undefined) return
    event.preventDefault()
    adjustSeparator(separator, arrows[event.key])
  }

  const canSubmit = runResult?.type === 'output'

  return (
    <div
      className={resizing ? `coding-workspace is-resizing is-resizing-${resizing}` : 'coding-workspace'}
      ref={workspaceRef}
      style={{ '--coding-instructions-width': `${instructionWidth}px`, '--coding-console-height': `${consoleHeight}px` }}
    >
      <aside className="coding-instructions" aria-labelledby="coding-instructions-title">
        <header className="coding-instructions-header">Exercise</header>
        <div className="coding-instructions-content">
          <span className="coding-kicker">Warm-up exercise</span>
          <h1 id="coding-instructions-title">Your first calculation</h1>
          <p>Python evaluates math with familiar operators. In this warm-up you’ll compute how many hours a year your current pace adds up to.</p>
          <p>The variable <code>hours</code> is already defined for you.</p>
        </div>
      </aside>

      <div
        className="coding-resizer coding-vertical-resizer"
        role="separator"
        aria-label="Resize lesson instructions"
        aria-orientation="vertical"
        aria-valuemin="320"
        aria-valuemax="520"
        aria-valuenow={instructionWidth}
        tabIndex="0"
        onPointerDown={() => setResizing('instructions')}
        onKeyDown={(event) => handleSeparatorKeyDown('instructions', event)}
      />

      <section className="coding-editor-area" aria-label="Python workspace">
        <div className="coding-editor">
          <header className="coding-editor-header"><strong><span className="coding-file-dot" aria-hidden="true" /> {lesson.fileName}</strong></header>
          <EditorSlot code={code} onChange={setCode} />
        </div>

        <footer className="coding-editor-actions">
          <div>
            <button type="button" className="coding-secondary-action" onClick={runCode}><span aria-hidden="true">▶</span> Run code</button>
            <button type="button" className="coding-reset-action" onClick={resetLesson} aria-label="Reset lesson" title="Reset lesson">↻</button>
          </div>
          <div className="coding-submit-group">
            <ActionButton variant="primary" className="coding-submit-button" disabled={!canSubmit || submitted} onClick={() => setSubmitted(true)} aria-describedby={!canSubmit ? 'coding-submit-hint' : undefined}>
              {submitted ? 'Build submitted' : 'Submit build'}
            </ActionButton>
            {!canSubmit && <span className="coding-submit-hint" id="coding-submit-hint">Run working code to unlock</span>}
          </div>
        </footer>

        <div
          className="coding-resizer coding-horizontal-resizer"
          role="separator"
          aria-label="Resize console output"
          aria-orientation="horizontal"
          aria-valuemin="140"
          aria-valuemax={Math.round(Math.max(140, (workspaceRef.current?.getBoundingClientRect().height ?? 930) * .45))}
          aria-valuenow={Math.round(consoleHeight)}
          tabIndex="0"
          onPointerDown={() => setResizing('console')}
          onKeyDown={(event) => handleSeparatorKeyDown('console', event)}
        />

        <section className="coding-console" aria-label="Console output">
          <header className="coding-console-header">
            <span
              className={runResult ? `coding-console-status is-${runResult.type}` : 'coding-console-status'}
              aria-hidden="true"
            />
            <span>Console output</span>
          </header>
          <pre className={`coding-console-output${runResult ? (runResult.type === 'error' ? ' is-error' : '') : ' is-idle'}`}>{runResult ? runResult.text : 'Run your code to see output here.'}</pre>
        </section>
        {submitted && <p className="coding-submit-status" role="status">Build submitted. Nice work!</p>}
      </section>
    </div>
  )
}
