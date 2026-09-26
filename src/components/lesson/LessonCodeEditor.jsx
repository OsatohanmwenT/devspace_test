import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { formatPythonError } from '../../lib/miniPython'
import { DevyLottie } from '../ui/DevyLottie'
import { evaluateExercise } from './codeExercise'
import { TOKEN_CLASSES, tokenizePython } from './pythonHighlight'

const PYTHON_LOGO = 'https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg'
const INDENT = '    '
const LINE_HEIGHT = 21
const IDLE_NUDGE_MS = 40000
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const RUN_SHORTCUT = isMac ? '⌘ Enter' : 'Ctrl Enter'

// `inline code` in Devy's lines and task text, without pulling in markdown.
function InlineCode({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={index} className="rounded bg-black/[0.07] px-1 py-px font-jetbrains-mono text-[0.9em] [[data-theme=dark]_&]:bg-white/10">{part.slice(1, -1)}</code>
      : <Fragment key={index}>{part}</Fragment>,
  )
}

// ---------------------------------------------------------------------------
// The exercise's state: what's been run, what Devy is saying, how many hints
// have been given. Shared by both layouts so they behave identically.
// ---------------------------------------------------------------------------
function useCodeExercise({ content, code, completed, onCodeChange, onComplete }) {
  const hints = content.hints ?? (content.hint ? [content.hint] : [])
  const [result, setResult] = useState(null)
  const [hintsShown, setHintsShown] = useState(0)
  const [devy, setDevy] = useState(() => ({
    mood: completed ? 'success' : 'greet',
    text: completed ? 'You’ve already cracked this one — run it again any time, or carry on.' : content.devyIntro ?? `I’m right here. ${content.description}`,
  }))
  const idleTimer = useRef(null)
  const idleNudged = useRef(false)

  // Devy only offers help once per exercise, after a real stretch of nothing
  // happening — never the moment someone pauses to think.
  const armIdleNudge = () => {
    window.clearTimeout(idleTimer.current)
    if (completed || idleNudged.current || hints.length === 0) return
    idleTimer.current = window.setTimeout(() => {
      idleNudged.current = true
      setDevy({ mood: 'idle', text: 'Stuck? That’s normal. Ask me for a hint and I’ll point you the right way — without giving it all away.' })
    }, IDLE_NUDGE_MS)
  }

  useEffect(() => {
    armIdleNudge()
    return () => window.clearTimeout(idleTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed])

  const run = () => {
    const next = evaluateExercise(content, code)
    setResult(next)
    setDevy(next.coach)
    if (next.passed && !completed) onComplete()
    armIdleNudge()
    return next
  }

  const edit = (nextCode) => {
    onCodeChange(nextCode)
    armIdleNudge()
  }

  const reset = () => {
    onCodeChange(content.starterCode)
    setResult(null)
    setDevy({ mood: 'greet', text: 'Fresh start. Take it one line at a time.' })
    armIdleNudge()
  }

  const nextHint = () => {
    if (hintsShown >= hints.length) return
    const index = hintsShown
    setHintsShown(index + 1)
    const isAnswer = index === hints.length - 1 && hints.length > 1
    setDevy({ mood: 'hint', text: isAnswer ? 'Here’s one way to write it — type it in yourself so it sticks:' : hints[index], code: isAnswer ? hints[index] : null })
    armIdleNudge()
  }

  const hintLabel = hintsShown === 0 ? 'Give me a hint' : hintsShown === hints.length - 1 && hints.length > 1 ? 'Show me the answer' : 'Another hint'

  return { result, devy, run, edit, reset, nextHint, hintLabel, hasMoreHints: hintsShown < hints.length }
}

// ---------------------------------------------------------------------------
// The code surface: a transparent textarea over a syntax-highlighted copy, a
// gutter that scrolls with it, and the keys an editor should handle.
// ---------------------------------------------------------------------------
function CodeSurface({ code, onChange, onRun, disabled, errorLine, label = 'Python code editor', minHeight = 260 }) {
  const textareaRef = useRef(null)
  const layerRef = useRef(null)
  const gutterRef = useRef(null)
  const pendingSelection = useRef(null)
  const tabEscapes = useRef(false)
  const lines = useMemo(() => code.split('\n'), [code])

  useLayoutEffect(() => {
    if (!pendingSelection.current || !textareaRef.current) return
    const [start, end] = pendingSelection.current
    textareaRef.current.setSelectionRange(start, end)
    pendingSelection.current = null
  })

  const syncScroll = () => {
    const area = textareaRef.current
    if (!area) return
    if (layerRef.current) layerRef.current.style.transform = `translate(${-area.scrollLeft}px, ${-area.scrollTop}px)`
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-area.scrollTop}px)`
  }

  const replace = (start, end, text, selectionStart, selectionEnd = selectionStart) => {
    onChange(code.slice(0, start) + text + code.slice(end))
    pendingSelection.current = [selectionStart, selectionEnd]
  }

  const onKeyDown = (event) => {
    const area = event.currentTarget
    const { selectionStart: start, selectionEnd: end } = area

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      onRun()
      return
    }
    // Escape, then Tab, leaves the editor — Tab alone indents.
    if (event.key === 'Escape') {
      tabEscapes.current = true
      return
    }
    if (event.key === 'Tab') {
      if (tabEscapes.current) {
        tabEscapes.current = false
        return
      }
      event.preventDefault()
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      if (event.shiftKey || start !== end) {
        // indent / dedent every line the selection touches
        const blockEnd = end > start && code[end - 1] === '\n' ? end - 1 : end
        const block = code.slice(lineStart, blockEnd)
        const changed = block.split('\n').map((line) => (event.shiftKey ? line.replace(/^ {1,4}/, '') : INDENT + line)).join('\n')
        const firstLineDelta = event.shiftKey ? -(block.match(/^ {1,4}/)?.[0].length ?? 0) : INDENT.length
        replace(lineStart, blockEnd, changed, Math.max(lineStart, start + firstLineDelta), end + (changed.length - block.length))
      } else {
        replace(start, end, INDENT, start + INDENT.length)
      }
      return
    }
    tabEscapes.current = false
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const current = code.slice(lineStart, start)
      const indent = current.match(/^\s*/)[0] + (/:\s*$/.test(current) ? INDENT : '')
      replace(start, end, `\n${indent}`, start + 1 + indent.length)
      return
    }
    if (event.key === 'Backspace' && start === end && start > 0) {
      // delete a whole indent step at once when the cursor sits in leading spaces
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const before = code.slice(lineStart, start)
      if (before.length > 0 && /^ +$/.test(before)) {
        event.preventDefault()
        const remove = before.length % INDENT.length || INDENT.length
        replace(start - remove, start, '', start - remove)
      }
    }
  }

  const textStyle = 'font-jetbrains-mono text-[14px] leading-[21px] whitespace-pre [tab-size:4]'

  return (
    <div className="grid min-h-0 grid-cols-[48px_minmax(0,1fr)] overflow-hidden bg-[#1e1e1e]" style={{ minHeight }}>
      <div className="relative overflow-hidden border-r border-white/[0.07] bg-[#1b1b1b]" aria-hidden="true">
        <ol ref={gutterRef} className={`m-0 list-none py-4 pr-3 text-right text-[#6e6e73] ${textStyle}`}>
          {lines.map((_, index) => (
            <li key={index} className={index + 1 === errorLine ? 'font-semibold text-[#ff7b7b]' : ''}>{index + 1}</li>
          ))}
        </ol>
      </div>
      <div className="relative min-h-0 overflow-hidden">
        {/* highlighted copy under the textarea */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div ref={layerRef} className={`px-4 py-4 ${textStyle}`}>
            {lines.map((line, index) => (
              <div key={index} className={`-mx-4 px-4 ${index + 1 === errorLine ? 'bg-[#ff5c5c]/[0.12] shadow-[inset_2px_0_0_#ff6b6b]' : ''}`}>
                {line
                  ? tokenizePython(line).map((token, tokenIndex) => <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>{token.value}</span>)
                  : '​'}
              </div>
            ))}
          </div>
        </div>
        <label className="absolute inset-0">
          <span className="sr-only">{label}</span>
          <textarea
            ref={textareaRef}
            className={`block h-full w-full resize-none overflow-auto border-0 bg-transparent px-4 py-4 text-transparent caret-[#f4f4f2] outline-none selection:bg-[#6699ec]/35 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6699ec]/70 disabled:cursor-default ${textStyle}`}
            value={code}
            disabled={disabled}
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-describedby="code-editor-keys"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onScroll={syncScroll}
          />
        </label>
        <span id="code-editor-keys" className="sr-only">Tab indents. Press Escape then Tab to leave the editor. {RUN_SHORTCUT} runs the code.</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Devy, docked in the editor: reacts to every run and hands out hints.
// ---------------------------------------------------------------------------
const DEVY_CLIP = { greet: 'wave', idle: 'listening', hint: 'thinking', nudge: 'listening', error: 'thinking', success: 'lesson-complete' }

function DevyCoach({ devy, onHint, hintLabel, hasMoreHints, completed, compact = false }) {
  const clip = DEVY_CLIP[devy.mood] ?? 'listening'
  const tone = devy.mood === 'error'
    ? 'border-[#ff8a8a]/40 bg-[#fff5f5] [[data-theme=dark]_&]:border-[#ff6b6b]/35 [[data-theme=dark]_&]:bg-[#2a1d1f]'
    : devy.mood === 'success'
      ? 'border-[#22c55e]/40 bg-[#f0fdf4] [[data-theme=dark]_&]:border-[#22c55e]/35 [[data-theme=dark]_&]:bg-[#16261c]'
      : 'border-[#dbe7fb] bg-[#f4f8ff] [[data-theme=dark]_&]:border-[#34465e] [[data-theme=dark]_&]:bg-[#1d2531]'
  return (
    <section className={`flex items-end gap-2 ${compact ? '' : 'p-4 pt-3'}`} aria-label="Devy" aria-live="polite">
      {/* Devy stands in the bottom-left corner; the bubble floats up beside
          his head so the tail points at him rather than at his feet. */}
      <DevyLottie key={clip} clip={clip} loop={clip !== 'lesson-complete'} className={`${compact ? 'size-[112px] max-[720px]:size-[88px]' : 'size-[120px]'} -mb-2 -ml-2 flex-none`} />
      <div className={`relative mb-12 min-w-0 flex-1 rounded-2xl rounded-bl-md border px-3.5 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,.45)] max-[720px]:mb-8 ${tone}`}>
        <p className="m-0 text-[14px] leading-[1.5] text-[#1d3048] [[data-theme=dark]_&]:text-[#e6e8ec]">
          <InlineCode text={devy.text} />
        </p>
        {devy.code && (
          <pre className="m-0 mt-2.5 overflow-auto rounded-lg bg-[#1e1e1e] px-3 py-2.5 font-jetbrains-mono text-[13px] leading-[1.55]">
            {devy.code.split('\n').map((line, index) => (
              <div key={index}>{line ? tokenizePython(line).map((token, tokenIndex) => <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>{token.value}</span>) : '​'}</div>
            ))}
          </pre>
        )}
        {!completed && hasMoreHints && (
          <button
            type="button"
            onClick={onHint}
            className="mt-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#bfd3f7] bg-white px-3 text-[12.5px] font-semibold text-[#2f6ad8] transition-colors hover:bg-[#eaf1ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] [[data-theme=dark]_&]:border-[#6699ec]/45 [[data-theme=dark]_&]:bg-[#6699ec]/10 [[data-theme=dark]_&]:text-[#a9c5f7] [[data-theme=dark]_&]:hover:bg-[#6699ec]/20"
          >
            <svg aria-hidden="true" className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M8.5 14.5C7.6 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.6 2.7-1.5 3.5-.8.7-1.5 1.4-1.5 2.5h-4c0-1.1-.7-1.8-1.5-2.5Z" /></svg>
            {hintLabel}
          </button>
        )}
      </div>
    </section>
  )
}

// The task list, ticked off by the last run.
function TaskList({ tasks, result }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {tasks.map((task, index) => {
        const done = Boolean(result?.tasks[index]?.done)
        return (
          <li key={task.title} className="flex gap-3">
            <span
              className={`mt-0.5 grid size-5 flex-none place-items-center rounded-full border-2 transition-colors ${done ? 'border-[#22c55e] bg-[#22c55e] text-white' : 'border-[#c5cfdd] [[data-theme=dark]_&]:border-[#4a4a4f]'}`}
              aria-hidden="true"
            >
              {done && <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
            </span>
            <span className="text-[14.5px] leading-[1.5] text-[#1d3048] [[data-theme=dark]_&]:text-[#e6e8ec]">
              <strong className={done ? 'text-[#15803d] [[data-theme=dark]_&]:text-[#6ee7a8]' : ''}>{task.title}.</strong>{' '}
              <span className="text-[#516984] [[data-theme=dark]_&]:text-[#a9a9ad]"><InlineCode text={task.description} /></span>
              <span className="sr-only">{done ? ' (done)' : ' (not done yet)'}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function ConsoleOutput({ result }) {
  if (!result) return <span className="text-[#8a8f9c]">Run your code to see what it prints. ({RUN_SHORTCUT})</span>
  return (
    <>
      {result.output && <span>{result.output}</span>}
      {!result.output && !result.error && <span className="text-[#8a8f9c]">(Your program ran but didn’t print anything.)</span>}
      {result.error && <span className="text-[#d84848] [[data-theme=dark]_&]:text-[#ff8a8a]">{result.output && !result.output.endsWith('\n') ? '\n' : ''}{formatPythonError(result.error)}</span>}
    </>
  )
}

function RunButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Run (${RUN_SHORTCUT})`}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-semibold text-[#052e14] transition-colors hover:bg-[#34d46c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22c55e]"
    >
      <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
      Run
      <kbd className="hidden rounded bg-black/15 px-1.5 py-px font-sans text-[11px] font-semibold min-[900px]:inline">{RUN_SHORTCUT}</kbd>
    </button>
  )
}

function ResetButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label="Reset code"
      title="Reset code"
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg border border-white/15 bg-transparent text-[#d4d4d4] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg aria-hidden="true" className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></svg>
    </button>
  )
}

function ContinueButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus
      className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]"
    >
      {label}
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </button>
  )
}

function FileTab({ filename }) {
  return (
    <div className="flex items-center gap-2 border-r border-white/[0.07] bg-[#1e1e1e] px-4">
      <img src={PYTHON_LOGO} alt="" className="size-4 object-contain" />
      <span className="font-jetbrains-mono text-[13px] font-medium text-[#e8e8e8]">{filename}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Guided layout: one focused column — the task, the editor, the output, Devy.
// ---------------------------------------------------------------------------
function GuidedCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }) {
  const currentCode = code ?? content.starterCode
  const exercise = useCodeExercise({ content, code: currentCode, completed, onCodeChange, onComplete })

  return (
    <section className="min-h-full overflow-auto bg-[#fafaf8] px-6 py-10 [[data-theme=dark]_&]:bg-[#171717] max-[720px]:px-4 max-[720px]:py-6">
      <div className="mx-auto grid w-full max-w-[720px] gap-5">
        <header className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6699ec]">Code lab</span>
          <h1 className="m-0 mt-2 font-rethink-sans text-[clamp(26px,3vw,34px)] font-semibold text-[#172b44] [[data-theme=dark]_&]:text-[#f4f4f2]">{content.title}</h1>
          <p className="mx-auto mt-3 mb-0 max-w-[52ch] text-[16px] leading-[1.55] text-[#516984] [[data-theme=dark]_&]:text-[#b2b2b6]">{content.description}</p>
        </header>

        <div className="rounded-2xl border border-[#e1e1e1] bg-white px-5 py-4 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#202020]">
          <TaskList tasks={content.tasks} result={exercise.result} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#28303c] bg-[#1e1e1e] shadow-[0_18px_40px_rgba(23,43,68,.18)]">
          <header className="flex min-h-11 items-stretch border-b border-white/[0.07] bg-[#252526]">
            <FileTab filename={content.filename} />
          </header>
          <CodeSurface code={currentCode} onChange={exercise.edit} onRun={exercise.run} disabled={completed} errorLine={exercise.result?.error?.line} minHeight={240} />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] bg-[#252526] px-4 py-3">
            <ResetButton onClick={exercise.reset} disabled={completed} />
            <RunButton onClick={exercise.run} />
            {completed && <span className="ml-auto"><ContinueButton onClick={onContinue} label={content.continueLabel ?? 'Continue lesson'} /></span>}
          </div>
          <pre className="m-0 max-h-[180px] min-h-[64px] overflow-auto whitespace-pre-wrap border-t border-white/[0.07] bg-[#181818] px-4 py-3 font-jetbrains-mono text-[13.5px] leading-[1.6] text-[#d4d4d4]" aria-live="polite">
            <ConsoleOutput result={exercise.result} />
          </pre>
        </section>

        <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} compact />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Full layout: exercise pane (collapsible, resizable) | editor over console.
// On narrow screens the panes stack and the page scrolls.
// ---------------------------------------------------------------------------
function FullCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }) {
  const currentCode = code ?? content.starterCode
  const exercise = useCodeExercise({ content, code: currentCode, completed, onCodeChange, onComplete })
  const [exerciseWidth, setExerciseWidth] = useState(38)
  const [editorHeight, setEditorHeight] = useState(68)
  const [collapsed, setCollapsed] = useState(false)
  const workspaceRef = useRef(null)
  const editorAreaRef = useRef(null)

  const dragResize = (event, axis) => {
    event.preventDefault()
    const target = axis === 'x' ? workspaceRef.current : editorAreaRef.current
    const bounds = target?.getBoundingClientRect()
    if (!bounds) return
    const resize = (moveEvent) => {
      if (axis === 'x') setExerciseWidth(Math.round(Math.max(26, Math.min(55, ((moveEvent.clientX - bounds.left) / bounds.width) * 100))))
      else setEditorHeight(Math.round(Math.max(40, Math.min(85, ((moveEvent.clientY - bounds.top) / bounds.height) * 100))))
    }
    const stop = () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stop)
  }

  const keyResize = (event, axis) => {
    const amount = event.shiftKey ? 5 : 2
    const less = axis === 'x' ? 'ArrowLeft' : 'ArrowUp'
    const more = axis === 'x' ? 'ArrowRight' : 'ArrowDown'
    if (event.key !== less && event.key !== more) return
    event.preventDefault()
    const delta = event.key === less ? -amount : amount
    if (axis === 'x') setExerciseWidth((width) => Math.max(26, Math.min(55, width + delta)))
    else setEditorHeight((height) => Math.max(40, Math.min(85, height + delta)))
  }

  const paneChrome = 'border border-[#e1e1e1] bg-white [[data-theme=dark]_&]:border-[#353535] [[data-theme=dark]_&]:bg-[#202020]'
  const paneHeader = 'flex min-h-10 items-center border-b border-[#e1e1e1] bg-[#f5f5f4] px-4 [[data-theme=dark]_&]:border-[#353535] [[data-theme=dark]_&]:bg-[#262626]'

  return (
    <section
      ref={workspaceRef}
      style={{ '--exercise-width': `${exerciseWidth}%`, '--editor-height': `${editorHeight}%` }}
      className={`grid h-full min-h-0 w-full gap-2 overflow-auto bg-[#f3f3f1] p-3 [[data-theme=dark]_&]:bg-[#141414] min-[900px]:gap-0 min-[900px]:overflow-hidden ${collapsed ? 'min-[900px]:grid-cols-[44px_8px_minmax(0,1fr)]' : 'min-[900px]:grid-cols-[minmax(300px,var(--exercise-width))_8px_minmax(0,1fr)]'}`}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Show exercise"
          aria-expanded="false"
          aria-controls="editor-exercise-pane"
          className={`hidden flex-col items-center gap-3 rounded-lg py-3 text-[#455871] transition-colors hover:bg-[#eaeef5] min-[900px]:flex [[data-theme=dark]_&]:text-[#c4ccd8] [[data-theme=dark]_&]:hover:bg-[#262626] ${paneChrome}`}
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          <span className="text-[12px] font-semibold [writing-mode:vertical-rl]">Exercise</span>
        </button>
      ) : (
        <aside id="editor-exercise-pane" className={`grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg ${paneChrome}`}>
          <header className={paneHeader}>
            <svg aria-hidden="true" className="mr-2 size-4 text-[#1d3048] [[data-theme=dark]_&]:text-[#d9e3f2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
            <span className="text-[14px] font-semibold text-[#1d3048] [[data-theme=dark]_&]:text-[#f4f4f2]">Exercise</span>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Hide exercise"
              aria-expanded="true"
              aria-controls="editor-exercise-pane"
              className="ml-auto hidden size-7 place-items-center rounded text-[#455871] transition-colors hover:bg-[#dfe4ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6699ec] min-[900px]:grid [[data-theme=dark]_&]:text-[#c4ccd8] [[data-theme=dark]_&]:hover:bg-[#383838]"
            >
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          </header>

          <div className="min-h-0 overflow-auto">
            <div className="p-5 pb-4">
              <h1 className="m-0 font-rethink-sans text-[22px] font-semibold leading-[1.2] text-[#172b44] [[data-theme=dark]_&]:text-[#f4f4f2]">{content.title}</h1>
              <p className="m-0 mt-2.5 text-[15px] leading-[1.58] text-[#3a506b] [[data-theme=dark]_&]:text-[#b2b2b6]">{content.description}</p>
              {content.example && (
                <pre className="m-0 mt-4 overflow-auto rounded-md bg-[#1e1e1e] px-3 py-2 font-jetbrains-mono text-[13px] leading-[1.55]">
                  {tokenizePython(content.example).map((token, index) => <span key={index} className={TOKEN_CLASSES[token.type]}>{token.value}</span>)}
                </pre>
              )}
            </div>
            <section aria-labelledby="code-task-title" className="border-t border-[#e1e1e1] px-5 py-4 [[data-theme=dark]_&]:border-[#353535]">
              <h2 id="code-task-title" className="m-0 mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-[#718198] [[data-theme=dark]_&]:text-[#9a9a9d]">Your tasks</h2>
              <TaskList tasks={content.tasks} result={exercise.result} />
            </section>
          </div>

          {/* Devy lives at the foot of the exercise pane — beside the task,
              reacting to each run, with hints a tap away. */}
          <div className="border-t border-[#e1e1e1] bg-[#fafaf8] [[data-theme=dark]_&]:border-[#353535] [[data-theme=dark]_&]:bg-[#1c1c1c]">
            <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} />
          </div>
        </aside>
      )}

      <div
        role="separator"
        tabIndex={collapsed ? -1 : 0}
        aria-label="Resize exercise pane"
        aria-controls="editor-exercise-pane"
        aria-orientation="vertical"
        aria-valuemin="26"
        aria-valuemax="55"
        aria-valuenow={exerciseWidth}
        className={`relative hidden touch-none select-none outline-none before:absolute before:inset-y-2 before:left-1/2 before:w-[3px] before:-translate-x-1/2 before:rounded-full before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec] min-[900px]:block ${collapsed ? 'pointer-events-none' : 'cursor-col-resize'}`}
        onPointerDown={(event) => !collapsed && dragResize(event, 'x')}
        onKeyDown={(event) => keyResize(event, 'x')}
      />

      <div ref={editorAreaRef} className="grid min-h-0 min-w-0 grid-rows-[minmax(360px,auto)_auto] gap-2 min-[900px]:grid-rows-[minmax(0,var(--editor-height))_8px_minmax(120px,1fr)] min-[900px]:gap-0">
        <section id="editor-code-pane" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#1e1e1e]">
          <header className="flex min-h-10 items-stretch border-b border-white/[0.07] bg-[#252526]">
            <FileTab filename={content.filename} />
            <span className="ml-auto flex items-center px-4 text-xs font-semibold text-[#9a9aa0]">Python</span>
          </header>
          <CodeSurface code={currentCode} onChange={exercise.edit} onRun={exercise.run} disabled={completed} errorLine={exercise.result?.error?.line} />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] bg-[#252526] px-4 py-2.5">
            <ResetButton onClick={exercise.reset} disabled={completed} />
            <RunButton onClick={exercise.run} />
            <div className="ml-auto flex items-center gap-3">
              {exercise.result && !completed && (
                <span className="text-xs font-semibold text-[#a9a9ad]">
                  {exercise.result.tasks.filter((task) => task.done).length}/{exercise.result.tasks.length} tasks
                </span>
              )}
              {completed && <ContinueButton onClick={onContinue} label={content.continueLabel ?? 'Continue lesson'} />}
            </div>
          </div>
        </section>

        <div
          role="separator"
          tabIndex="0"
          aria-label="Resize output console"
          aria-controls="editor-code-pane editor-output-pane"
          aria-orientation="horizontal"
          aria-valuemin="40"
          aria-valuemax="85"
          aria-valuenow={editorHeight}
          className="relative hidden cursor-row-resize touch-none select-none outline-none before:absolute before:inset-x-2 before:top-1/2 before:h-[3px] before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec] min-[900px]:block"
          onPointerDown={(event) => dragResize(event, 'y')}
          onKeyDown={(event) => keyResize(event, 'y')}
        />

        <section id="editor-output-pane" className={`grid min-h-[140px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#181818] ${collapsed ? 'min-[900px]:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]' : ''}`}>
          <header className="flex min-h-10 items-center border-b border-white/[0.07] bg-[#252526] px-4 min-[900px]:col-start-1">
            <span className="text-[13px] font-semibold text-[#e8e8e8]">Output</span>
            {exercise.result?.error && <span className="ml-3 rounded bg-[#ff5c5c]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#ff8a8a]">{exercise.result.error.type === 'NotSupported' ? 'Not supported' : exercise.result.error.type}</span>}
            {exercise.result?.passed && <span className="ml-3 rounded bg-[#22c55e]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#6ee7a8]">All tasks passed</span>}
          </header>
          <pre className="m-0 min-h-0 overflow-auto whitespace-pre-wrap px-4 py-3 font-jetbrains-mono text-[13.5px] leading-[1.6] text-[#d4d4d4] min-[900px]:col-start-1" aria-live="polite" aria-atomic="true">
            <ConsoleOutput result={exercise.result} />
          </pre>
          {/* With the exercise pane tucked away, Devy moves in beside the
              console so he's still right there after every run. */}
          {collapsed && (
            <div className="hidden min-h-0 overflow-auto border-l border-white/[0.07] p-3 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:block [[data-theme=light]_&]:bg-[#fafaf8]">
              <DevyCoach devy={exercise.devy} onHint={exercise.nextHint} hintLabel={exercise.hintLabel} hasMoreHints={exercise.hasMoreHints} completed={completed} compact />
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export function LessonCodeEditor(props) {
  if (props.content.layout === 'guided') return <GuidedCodeEditor {...props} />
  return <FullCodeEditor {...props} />
}
