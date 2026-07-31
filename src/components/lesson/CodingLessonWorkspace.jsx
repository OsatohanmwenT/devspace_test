import { useEffect, useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

const lesson = {
  fileName: 'warmup.py',
  starterCode: '# Weekly learning hours\nhours = 6\n\n# Multiply hours by 52 to get yearly hours\nyearly = hours ____\n\n# Print the result\nprint(____)',
  answerPattern: /yearly\s*=\s*hours\s*\*\s*52[\s\S]*print\(\s*yearly\s*\)/,
}

// Quick-and-dirty Python highlighter for the plain <textarea> below — not a real editor,
// just enough tokenizing to stop the exercise from reading as unstyled plaintext.
const PY_KEYWORDS = ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'class', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'print', 'lambda', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'yield', 'global', 'assert', 'del', 'raise']
const PY_TOKEN_PATTERN = new RegExp(
  `(#[^\\n]*)|('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*")|\\b(${PY_KEYWORDS.join('|')})\\b|\\b(\\d+\\.?\\d*)\\b|([A-Za-z_]\\w*)(?=\\()`,
  'g',
)

function tokenizePython(code) {
  const tokens = []
  let lastIndex = 0
  let match

  PY_TOKEN_PATTERN.lastIndex = 0
  while ((match = PY_TOKEN_PATTERN.exec(code))) {
    if (match.index > lastIndex) tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) })
    const [full, comment, string, keyword, number, fn] = match
    if (comment) tokens.push({ type: 'comment', value: comment })
    else if (string) tokens.push({ type: 'string', value: string })
    else if (keyword) tokens.push({ type: 'keyword', value: keyword })
    else if (number) tokens.push({ type: 'number', value: number })
    else if (fn) tokens.push({ type: 'function', value: fn })
    lastIndex = match.index + full.length
  }
  if (lastIndex < code.length) tokens.push({ type: 'plain', value: code.slice(lastIndex) })
  return tokens
}

function EditorSlot({ code, onChange }) {
  const lines = Math.max(code.split('\n').length, 12)
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)

  const syncScroll = () => {
    if (!textareaRef.current || !highlightRef.current) return
    highlightRef.current.scrollTop = textareaRef.current.scrollTop
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
  }

  return (
    <div className="coding-editor-body">
      <pre className="coding-line-numbers" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => <span key={index}>{index + 1}</span>)}
      </pre>
      <div className="coding-code-surface">
        <pre className="coding-highlight-layer" aria-hidden="true" ref={highlightRef}>
          {tokenizePython(code).map((token, index) => (
            token.type === 'plain'
              ? token.value
              : <span key={index} className={`token-${token.type}`}>{token.value}</span>
          ))}
          {'\n'}
        </pre>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          spellCheck="false"
          aria-label="Python code"
        />
      </div>
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
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false)
  const [consoleCollapsed, setConsoleCollapsed] = useState(false)

  useEffect(() => {
    if (!resizing) return undefined

    const resize = (event) => {
      const bounds = workspaceRef.current?.getBoundingClientRect()
      if (!bounds) return

      if (resizing === 'instructions') {
        setInstructionWidth(Math.min(bounds.width * .5, Math.max(320, event.clientX - bounds.left)))
      } else {
        setConsoleHeight(Math.min(bounds.height * .5, Math.max(140, bounds.bottom - event.clientY)))
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
    const bounds = workspaceRef.current?.getBoundingClientRect()
    if (separator === 'instructions') {
      const maxWidth = Math.max(320, (bounds?.width ?? 900) * .5)
      setInstructionWidth((width) => Math.min(maxWidth, Math.max(320, width + delta)))
      return
    }
    const maxHeight = Math.max(140, (bounds?.height ?? 930) * .5)
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

  const workspaceClassName = [
    'coding-workspace',
    resizing && `is-resizing is-resizing-${resizing}`,
    instructionsCollapsed && 'is-instructions-collapsed',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={workspaceClassName}
      ref={workspaceRef}
      style={{ '--coding-instructions-width': `${instructionWidth}px`, '--coding-console-height': `${consoleHeight}px` }}
    >
      <aside className="coding-instructions" aria-labelledby="coding-instructions-title">
        <header className="coding-instructions-header">
          <span>Exercise</span>
          <button
            type="button"
            onClick={() => setInstructionsCollapsed((collapsed) => !collapsed)}
            aria-expanded={!instructionsCollapsed}
            aria-label={instructionsCollapsed ? 'Expand instructions' : 'Collapse instructions'}
          >
            {instructionsCollapsed ? '›' : '‹'}
          </button>
        </header>
        <div className="coding-instructions-content">
          <span className="coding-kicker">Warm-up exercise</span>
          <h1 id="coding-instructions-title">Your first calculation</h1>
          <p>Python evaluates math with familiar operators. In this warm-up you’ll compute how many hours a year your current pace adds up to.</p>
          <p>The variable <code>hours</code> is already defined for you.</p>
        </div>
      </aside>

      {!instructionsCollapsed && (
        <div
          className="coding-resizer coding-vertical-resizer"
          role="separator"
          aria-label="Resize lesson instructions"
          aria-orientation="vertical"
          aria-valuemin="320"
          aria-valuemax={Math.round(Math.max(320, (workspaceRef.current?.getBoundingClientRect().width ?? 900) * .5))}
          aria-valuenow={instructionWidth}
          tabIndex="0"
          onPointerDown={() => setResizing('instructions')}
          onKeyDown={(event) => handleSeparatorKeyDown('instructions', event)}
        />
      )}

      <section className={consoleCollapsed ? 'coding-editor-area is-console-collapsed' : 'coding-editor-area'} aria-label="Python workspace">
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

        {!consoleCollapsed && (
          <div
            className="coding-resizer coding-horizontal-resizer"
            role="separator"
            aria-label="Resize console output"
            aria-orientation="horizontal"
            aria-valuemin="140"
            aria-valuemax={Math.round(Math.max(140, (workspaceRef.current?.getBoundingClientRect().height ?? 930) * .5))}
            aria-valuenow={Math.round(consoleHeight)}
            tabIndex="0"
            onPointerDown={() => setResizing('console')}
            onKeyDown={(event) => handleSeparatorKeyDown('console', event)}
          />
        )}

        <section className="coding-console" aria-label="Console output">
          <header className="coding-console-header">
            <span className="coding-console-header-label">
              <span
                className={runResult ? `coding-console-status is-${runResult.type}` : 'coding-console-status'}
                aria-hidden="true"
              />
              <span>Console output</span>
            </span>
            <button
              type="button"
              onClick={() => setConsoleCollapsed((collapsed) => !collapsed)}
              aria-expanded={!consoleCollapsed}
              aria-label={consoleCollapsed ? 'Expand console' : 'Collapse console'}
            >
              {consoleCollapsed ? '▴' : '▾'}
            </button>
          </header>
          <pre className={`coding-console-output${runResult ? (runResult.type === 'error' ? ' is-error' : '') : ' is-idle'}`}>{runResult ? runResult.text : 'Run your code to see output here.'}</pre>
        </section>
        {submitted && <p className="coding-submit-status" role="status">Build submitted. Nice work!</p>}
      </section>
    </div>
  )
}
