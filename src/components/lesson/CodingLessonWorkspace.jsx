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

// Literal colors for the highlighter tokens — the editor surface stays hardcoded dark in
// both app themes (see the workspace-level note below), so these never need a light variant.
const TOKEN_CLASSES = {
  comment: 'italic text-[#6a9955]',
  string: 'text-[#ce9178]',
  keyword: 'text-[#569cd6]',
  number: 'text-[#b5cea8]',
  function: 'text-[#dcdcaa]',
}

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
    <div className="grid grid-cols-[54px_minmax(0,1fr)] min-h-0 bg-[#121214]">
      <pre
        className="grid content-start m-0 border-r border-r-[#353a45] px-3.5 py-5 text-[#7d7d80] font-['JetBrains_Mono',ui-monospace,monospace] text-[13px] leading-[1.75] text-right select-none"
        aria-hidden="true"
      >
        {Array.from({ length: lines }, (_, index) => <span key={index}>{index + 1}</span>)}
      </pre>
      <div className="relative min-w-0 min-h-0 overflow-hidden">
        <pre
          className="absolute inset-0 m-0 overflow-auto px-6 py-5 border-0 whitespace-pre [word-wrap:normal] font-['JetBrains_Mono',ui-monospace,monospace] text-sm font-medium leading-[1.75] [tab-size:2] pointer-events-none text-[#f4f4f2]"
          aria-hidden="true"
          ref={highlightRef}
        >
          {tokenizePython(code).map((token, index) => (
            token.type === 'plain'
              ? token.value
              : <span key={index} className={TOKEN_CLASSES[token.type]}>{token.value}</span>
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
          className="absolute inset-0 w-full min-h-0 m-0 overflow-auto resize-none px-6 py-5 border-0 outline-0 whitespace-pre [word-wrap:normal] font-['JetBrains_Mono',ui-monospace,monospace] text-sm font-medium leading-[1.75] [tab-size:2] bg-transparent text-transparent caret-[#f4f4f2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
        />
      </div>
    </div>
  )
}

export function CodingLessonWorkspace({ initialState, onStateChange, onComplete }) {
  const workspaceRef = useRef(null)
  const [code, setCode] = useState(initialState?.code ?? lesson.starterCode)
  const [runResult, setRunResult] = useState(initialState?.runResult ?? null)
  const [submitted, setSubmitted] = useState(initialState?.submitted ?? false)
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
    onStateChange?.({ code: lesson.starterCode, runResult: null, submitted: false })
  }

  const runCode = () => {
    const nextResult = lesson.answerPattern.test(code)
      ? { type: 'output', text: '312' }
      : { type: 'error', text: 'File "warmup.py", line 5\n  yearly = hours ____\n                 ^^^^\nSyntaxError: invalid syntax' }

    setSubmitted(false)
    setRunResult(nextResult)
    onStateChange?.({ code, runResult: nextResult, submitted: false })
  }

  const updateCode = (nextCode) => {
    setCode(nextCode)
    setRunResult(null)
    setSubmitted(false)
    onStateChange?.({ code: nextCode, runResult: null, submitted: false })
  }

  const submitBuild = () => {
    setSubmitted(true)
    onStateChange?.({ code, runResult, submitted: true })
    onComplete?.()
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

  // Workspace grid: collapsed vs expanded are mutually exclusive column templates (never
  // stack an override on top of the other for the same grid-template-columns declaration).
  const workspaceGridClassName = instructionsCollapsed
    ? 'grid-cols-[44px_minmax(0,1fr)] max-[720px]:grid-cols-[1fr] max-[720px]:grid-rows-[auto_minmax(540px,1fr)] max-[720px]:overflow-auto'
    : 'grid-cols-[clamp(320px,var(--coding-instructions-width),50%)_4px_minmax(0,1fr)] max-[720px]:grid-cols-[1fr] max-[720px]:grid-rows-[auto_minmax(540px,1fr)] max-[720px]:overflow-auto'

  const instructionsHeaderClassName = instructionsCollapsed
    ? 'justify-center p-0'
    : 'justify-between px-5 max-[720px]:px-4'

  const editorAreaGridRows = consoleCollapsed
    ? 'grid-rows-[minmax(0,1fr)_auto_32px]'
    : 'grid-rows-[minmax(0,1fr)_auto_4px_clamp(140px,var(--coding-console-height),50%)] max-[720px]:grid-rows-[minmax(280px,1fr)_auto_4px_180px]'

  const consoleGridRows = consoleCollapsed ? 'grid-rows-[32px]' : 'grid-rows-[32px_minmax(0,1fr)]'

  const consoleStatusClassName = !runResult
    ? 'bg-[#454f63]'
    : runResult.type === 'error'
      ? 'bg-[#ff676d]'
      : 'bg-[#04adc0]'

  const consoleOutputColorClassName = !runResult
    ? 'italic text-[#7d7d80]'
    : runResult.type === 'error'
      ? 'text-[#ff676d]'
      : 'text-[#f4f4f2]'

  return (
    <div
      className={`grid w-full h-full min-h-0 bg-[#121214] [[data-theme=light]_&]:bg-[#fafaf8] ${workspaceGridClassName} ${resizing ? 'select-none' : ''}`}
      ref={workspaceRef}
      style={{
        '--coding-instructions-width': `${instructionWidth}px`,
        '--coding-console-height': `${consoleHeight}px`,
        cursor: resizing === 'instructions' ? 'col-resize' : resizing === 'console' ? 'row-resize' : undefined,
      }}
    >
      {/* Instructions chrome follows the app theme normally. */}
      <aside
        className="grid grid-rows-[32px_minmax(0,1fr)] min-w-0 overflow-hidden bg-[#1c1c21] text-[#f4f4f2] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#15243a]"
        aria-labelledby="coding-instructions-title"
      >
        <header
          className={`flex items-center min-h-8 border-b border-b-[#36363c] bg-[#202027] text-[13px] font-bold text-[#f4f4f2] [[data-theme=light]_&]:border-b-[#d3d6df] [[data-theme=light]_&]:bg-[#e3e4ea] [[data-theme=light]_&]:text-[#15243a] ${instructionsHeaderClassName}`}
        >
          {!instructionsCollapsed && <span>Exercise</span>}
          <button
            type="button"
            onClick={() => setInstructionsCollapsed((collapsed) => !collapsed)}
            aria-expanded={!instructionsCollapsed}
            aria-label={instructionsCollapsed ? 'Expand instructions' : 'Collapse instructions'}
            className="grid w-6 h-6 place-items-center border-0 rounded-md bg-transparent text-sm leading-none text-[#7d7d80] hover:bg-white/8 hover:text-[#f4f4f2] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:text-[#89898e] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
          >
            {instructionsCollapsed ? '›' : '‹'}
          </button>
        </header>
        {!instructionsCollapsed && (
          <div className="flex flex-col gap-3 overflow-auto pt-[18px] px-6 pb-6 max-[720px]:p-4">
            <span className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#888df2]">Warm-up exercise</span>
            <h1
              id="coding-instructions-title"
              className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-[28px] font-bold tracking-[-0.035em] leading-[1.2] text-[#f4f4f2] max-[720px]:text-[22px] [[data-theme=light]_&]:text-[#102037]"
            >
              Your first calculation
            </h1>
            <p className="m-0 text-[16px] leading-[1.65] text-[#9a9a9d] [[data-theme=light]_&]:text-[#203149]">
              Python evaluates math with familiar operators. In this warm-up you’ll compute how many hours a year your current pace adds up to.
            </p>
            <p className="m-0 text-[16px] leading-[1.65] text-[#9a9a9d] [[data-theme=light]_&]:text-[#203149]">
              The variable{' '}
              <code className="rounded-[4px] px-[5px] py-0.5 text-[14px] font-mono bg-[#262626] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#eef0f5] [[data-theme=light]_&]:text-[#1b2d46]">hours</code>{' '}
              is already defined for you.
            </p>
          </div>
        )}
      </aside>

      {!instructionsCollapsed && (
        <div
          className="z-1 relative outline-0 cursor-col-resize bg-[#22262f] [[data-theme=light]_&]:bg-[#d7dae2] before:absolute before:content-[''] before:z-1 before:pointer-events-none before:inset-y-0 before:-inset-x-1 after:absolute after:content-[''] after:opacity-0 after:transition-opacity after:duration-[120ms] after:bg-[#888df2] after:inset-y-0 after:inset-x-px hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:shadow-[inset_0_0_0_2px_#888df2] [[data-theme=light]_&]:focus-visible:shadow-[inset_0_0_0_2px_#070c72]"
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

      <section
        className={`grid min-w-0 min-h-0 gap-0 p-0 bg-[#121214] ${editorAreaGridRows}`}
        aria-label="Python workspace"
      >
        <div className="grid grid-rows-[36px_minmax(0,1fr)] min-h-0 bg-[#121214]">
          <header className="flex items-center justify-start border-b border-b-[#404040] bg-[#1f1f1f] text-[13px] text-[#f4f4f2]">
            <strong className="flex items-center gap-2 m-0 py-2 border-r border-r-[#404040] border-b-2 border-b-[#888df2] bg-[#1f1f1f] px-4 text-[#f4f4f2] font-['JetBrains_Mono',ui-monospace,monospace] text-[13px]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#888df2]" aria-hidden="true" /> {lesson.fileName}
            </strong>
          </header>
          <EditorSlot code={code} onChange={updateCode} />
        </div>

        <footer className="flex items-center justify-between border-0 border-t border-t-[#404040] border-b border-b-[#404040] bg-[#1f1f1f] py-[7px] px-3.5 max-[720px]:py-2 max-[720px]:px-3">
          <div className="flex items-center gap-2.5 max-[720px]:flex-1">
            <button
              type="button"
              className="flex items-center gap-[7px] min-h-[34px] px-3 rounded-lg border border-[#454c5a] bg-[#333844] text-[#f2f6fc] text-xs font-semibold transition-[background-color,transform] duration-[120ms] ease-linear hover:bg-[#3d4451] hover:-translate-y-px active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] max-[720px]:min-h-11 max-[720px]:flex-1"
              onClick={runCode}
            >
              <span aria-hidden="true">▶</span> Run code
            </button>
            <button
              type="button"
              className="grid place-items-center w-[34px] h-[34px] rounded-lg border border-[#454c5a] bg-[#333844] text-[#f2f6fc] text-[19px] font-semibold transition-[background-color,transform] duration-[120ms] ease-linear hover:bg-[#3d4451] hover:-translate-y-px active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72] max-[720px]:w-11 max-[720px]:h-11"
              onClick={resetLesson}
              aria-label="Reset lesson"
              title="Reset lesson"
            >
              ↻
            </button>
          </div>
          <div className="flex items-center gap-2 max-[720px]:gap-0">
            <ActionButton
              variant="primary"
              className="min-h-[34px] text-[13px] font-semibold max-[720px]:min-h-11 max-[720px]:flex-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:translate-y-0"
              disabled={!canSubmit || submitted}
              onClick={submitBuild}
              aria-describedby={!canSubmit ? 'coding-submit-hint' : undefined}
            >
              {submitted ? 'Build submitted' : 'Submit build'}
            </ActionButton>
            {!canSubmit && (
              <span className="text-[11px] whitespace-nowrap text-[#7d7d80] max-[720px]:hidden" id="coding-submit-hint">
                Run working code to unlock
              </span>
            )}
          </div>
        </footer>

        {!consoleCollapsed && (
          <div
            className="z-1 relative outline-0 min-h-1 cursor-row-resize bg-[#171c25] [[data-theme=light]_&]:bg-[#1a2330] before:absolute before:content-[''] before:z-1 before:pointer-events-none before:inset-x-0 before:-inset-y-1 after:absolute after:content-[''] after:opacity-0 after:transition-opacity after:duration-[120ms] after:bg-[#888df2] after:inset-x-0 after:inset-y-px hover:after:opacity-100 focus-visible:after:opacity-100 focus-visible:shadow-[inset_0_0_0_2px_#888df2] [[data-theme=light]_&]:focus-visible:shadow-[inset_0_0_0_2px_#070c72]"
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

        <section className={`grid ${consoleGridRows} m-0 border-t border-t-[#404040] bg-[#121214]`} aria-label="Console output">
          <header className="flex items-center justify-between gap-2 border-b border-b-[#404040] bg-[#1f1f1f] px-5 text-[#888df2] text-xs font-semibold tracking-[0.06em] uppercase">
            <span className="flex items-center gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${consoleStatusClassName}`} aria-hidden="true" />
              <span>Console output</span>
            </span>
            <button
              type="button"
              onClick={() => setConsoleCollapsed((collapsed) => !collapsed)}
              aria-expanded={!consoleCollapsed}
              aria-label={consoleCollapsed ? 'Expand console' : 'Collapse console'}
              className="grid w-8 h-8 place-items-center border-0 rounded-md bg-transparent text-[17px] text-[#c2c4d3] hover:bg-[#303041] hover:text-[#f2f6fc] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:focus-visible:outline-[#070c72]"
            >
              {consoleCollapsed ? '▴' : '▾'}
            </button>
          </header>
          {!consoleCollapsed && (
            <pre className={`min-h-0 m-0 overflow-auto px-9 py-[18px] font-['JetBrains_Mono',ui-monospace,monospace] text-sm leading-[1.65] bg-[#121214] ${consoleOutputColorClassName}`}>
              {runResult ? runResult.text : 'Run your code to see output here.'}
            </pre>
          )}
        </section>
        {submitted && (
          <p className="absolute right-[190px] bottom-3 m-0 text-[#9fe0b3] max-[720px]:static max-[720px]:m-0 max-[720px]:mt-2 max-[720px]:mx-3" role="status">
            Build submitted. Nice work!
          </p>
        )}
      </section>
    </div>
  )
}
