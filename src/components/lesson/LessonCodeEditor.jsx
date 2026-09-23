import { useRef, useState } from 'react'
import { isSimulatedPythonComplete } from './codeEditorState'

function GuidedCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }) {
  const [runResult, setRunResult] = useState()
  const [isHintVisible, setIsHintVisible] = useState(false)
  const currentCode = code ?? content.starterCode
  const hasYearlyTotal = isSimulatedPythonComplete(currentCode)

  return (
    <section className="min-h-full overflow-auto bg-[#fafaf8] px-6 py-10 [[data-theme=dark]_&]:bg-[#171717] max-[720px]:px-4 max-[720px]:py-6">
      <div className="mx-auto grid w-full max-w-[720px] gap-6">
        <header className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6699ec]">Code lab</span>
          <h1 className="m-0 mt-2 font-rethink-sans text-[clamp(26px,3vw,34px)] font-semibold text-[#172b44] [[data-theme=dark]_&]:text-[#f4f4f2]">{content.title}</h1>
          <p className="mx-auto mt-3 mb-0 max-w-[52ch] text-[16px] leading-[1.55] text-[#516984] [[data-theme=dark]_&]:text-[#b2b2b6]">{content.description}</p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#28303c] bg-[#1e1e1e] shadow-[0_18px_40px_rgba(23,43,68,.18)]">
          <header className="flex min-h-12 items-center border-b border-white/10 px-4">
            <img src="https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg" alt="Python" className="size-5 object-contain" />
            <span className="ml-2 font-jetbrains-mono text-[13px] font-medium text-[#f1f1f1]">{content.filename}</span>
            <span className="ml-auto text-xs font-semibold text-[#a9b7ca]">Guided editor</span>
          </header>
          <div className="grid min-h-[280px] grid-cols-[46px_minmax(0,1fr)] max-[720px]:min-h-[230px]">
            <ol aria-hidden="true" className="m-0 border-r border-white/10 bg-[#1b1b1b] py-4 pr-3 text-right font-jetbrains-mono text-[14px] leading-[21px] text-[#77777b]">
              {currentCode.split('\n').map((_, index) => <li key={index}>{index + 1}</li>)}
            </ol>
            <label className="min-h-0">
              <span className="sr-only">Python code editor</span>
              <textarea
                className="block h-full w-full resize-none border-0 bg-[#1e1e1e] px-4 py-4 font-jetbrains-mono text-[14px] leading-[21px] text-[#d4d4d4] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6699ec] disabled:cursor-default disabled:opacity-75"
                value={currentCode}
                disabled={completed}
                spellCheck="false"
                onChange={(event) => {
                  onCodeChange(event.target.value)
                  setRunResult(undefined)
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#252526] px-4 py-3">
            <button type="button" className="min-h-9 rounded border border-[#67676d] bg-transparent px-4 text-sm font-semibold text-[#f4f4f2] transition-colors hover:bg-[#6699ec]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" onClick={() => setRunResult(hasYearlyTotal ? content.output : 'Finish the calculation and print the yearly total to see the result.')}>Run code</button>
            {!completed && <button type="button" className="ml-auto min-h-9 rounded bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] disabled:cursor-not-allowed disabled:bg-[#526b93]" disabled={!hasYearlyTotal} onClick={onComplete}>Check solution</button>}
            {completed && <button type="button" className="ml-auto min-h-9 rounded bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" onClick={onContinue}>{content.continueLabel ?? 'Continue lesson'}</button>}
          </div>
        </section>

        <section className="rounded-xl border border-[#e1e1e1] bg-white p-4 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#202020]" aria-live="polite">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#718198] [[data-theme=dark]_&]:text-[#9a9a9d]">Output</span>
          <pre className="m-0 mt-2 whitespace-pre-wrap font-jetbrains-mono text-[14px] leading-[1.6] text-[#1d3048] [[data-theme=dark]_&]:text-[#d4d4d4]">{runResult ?? 'Run your code to see the result here.'}</pre>
        </section>

        <section className="rounded-xl border border-[#dbe7fb] bg-[#f4f8ff] p-4 [[data-theme=dark]_&]:border-[#34465e] [[data-theme=dark]_&]:bg-[#202a37]">
          <h2 className="m-0 text-[15px] font-semibold text-[#1d3048] [[data-theme=dark]_&]:text-[#f4f4f2]">Your task</h2>
          <ol className="mt-3 mb-0 grid gap-2 pl-5 text-[14px] leading-[1.5] text-[#516984] marker:font-semibold marker:text-[#6699ec] [[data-theme=dark]_&]:text-[#b2b2b6]">
            {content.tasks.map((task) => <li key={task.title}><strong className="text-[#1d3048] [[data-theme=dark]_&]:text-[#f4f4f2]">{task.title}.</strong> {task.description}</li>)}
          </ol>
          <button type="button" className="mt-4 text-sm font-semibold text-[#3d77eb] underline decoration-[#6699ec]/40 underline-offset-4 hover:text-[#245fc5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] [[data-theme=dark]_&]:text-[#9cbdf5]" onClick={() => setIsHintVisible((visible) => !visible)}>{isHintVisible ? 'Hide hint' : 'Show hint'}</button>
          {isHintVisible && <pre className="m-0 mt-3 overflow-auto rounded-lg bg-white p-3 font-jetbrains-mono text-[13px] leading-[1.55] text-[#304b6c] [[data-theme=dark]_&]:bg-[#171717] [[data-theme=dark]_&]:text-[#d8e6ff]">{content.hint}</pre>}
        </section>
      </div>
    </section>
  )
}

function FullCodeEditor({ content, code, completed, onCodeChange, onComplete, onContinue }) {
  const [runResult, setRunResult] = useState()
  const [isHintVisible, setIsHintVisible] = useState(false)
  const [exerciseWidth, setExerciseWidth] = useState(40)
  const [editorHeight, setEditorHeight] = useState(75)
  const workspaceRef = useRef(null)
  const editorAreaRef = useRef(null)
  const currentCode = code ?? content.starterCode
  const hasYearlyTotal = isSimulatedPythonComplete(currentCode)

  const runCode = () => {
    setRunResult(hasYearlyTotal ? content.output : 'Finish the calculation and print the yearly total to see the result.')
  }

  return (
    <section ref={workspaceRef} style={{ '--exercise-width': `${exerciseWidth}%` }} className="grid h-full min-h-0 w-full gap-1.5 overflow-hidden bg-[#fafaf8] p-3 [[data-theme=dark]_&]:bg-[#171717] min-[900px]:grid-cols-[minmax(320px,var(--exercise-width))_6px_minmax(0,1fr)] min-[900px]:gap-0">
      <aside id="editor-exercise-pane" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-[#e1e1e1] bg-white [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#202020]">
        <header className="flex min-h-10 items-center border-b border-[#e1e1e1] bg-[#f5f5f4] px-4 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#292929]">
          <svg aria-hidden="true" className="mr-2 size-4 text-[#1d3048] [[data-theme=dark]_&]:text-[#d9e3f2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
          <span className="text-[15px] font-semibold text-[#1d3048] [[data-theme=dark]_&]:text-[#f4f4f2]">Exercise</span>
          <button type="button" aria-label="Collapse exercise" className="ml-auto grid size-7 place-items-center rounded text-[#455871] transition-colors hover:bg-[#dfe4ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6699ec] [[data-theme=dark]_&]:text-[#c4ccd8] [[data-theme=dark]_&]:hover:bg-[#383838]">
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        </header>

        <div className="min-h-0 overflow-auto">
          <div className="p-5">
            <h1 className="m-0 font-rethink-sans text-[23px] font-semibold leading-[1.2] text-[#172b44] [[data-theme=dark]_&]:text-[#f4f4f2]">{content.title}</h1>
            <p className="m-0 mt-3 text-[15px] leading-[1.58] text-[#3a506b] [[data-theme=dark]_&]:text-[#b2b2b6]">{content.description}</p>
            <pre className="m-0 mt-4 overflow-auto rounded-sm bg-[#f5f5f4] px-3 py-2 font-jetbrains-mono text-[13px] text-[#203753] [[data-theme=dark]_&]:bg-[#292929] [[data-theme=dark]_&]:text-[#e1e6ee]">{content.example}</pre>
          </div>

          <section aria-labelledby="code-task-title">
            <div className="flex items-center border-y border-[#e1e1e1] bg-[#f5f5f4] px-5 py-2 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#292929]">
              <svg aria-hidden="true" className="mr-2 size-4 text-[#6699ec]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>
              <h2 id="code-task-title" className="m-0 text-[15px] font-semibold text-[#1d3048] [[data-theme=dark]_&]:text-[#f4f4f2]">Instructions</h2>
              <span className="ml-auto rounded bg-[#6699ec]/15 px-1.5 py-0.5 text-xs font-bold text-[#3d77eb] [[data-theme=dark]_&]:text-[#9cbdf5]">25 XP</span>
            </div>
            <div className="p-5 pt-4">
              <ul className="m-0 grid gap-3 pl-5 text-[15px] leading-[1.5] text-[#1d3048] marker:text-[#6699ec] [[data-theme=dark]_&]:text-[#e6e8ec]">
                {content.tasks.map((task) => <li key={task.title}><strong>{task.title}.</strong> <span className="text-[#516984] [[data-theme=dark]_&]:text-[#b2b2b6]">{task.description}</span></li>)}
              </ul>
              <button type="button" className="mt-5 inline-flex min-h-7 items-center gap-1.5 rounded border border-[#bfd3f7] bg-[#eff4ff] px-2 text-[12px] font-semibold text-[#3d77eb] transition-colors hover:bg-[#dfeaff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] [[data-theme=dark]_&]:border-[#6699ec]/50 [[data-theme=dark]_&]:bg-[#6699ec]/10 [[data-theme=dark]_&]:text-[#9cbdf5] [[data-theme=dark]_&]:hover:bg-[#6699ec]/20" onClick={() => setIsHintVisible((visible) => !visible)}>
                <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 18h6M10 22h4M8.5 14.5C7.6 13.7 7 12.5 7 11a5 5 0 0 1 10 0c0 1.5-.6 2.7-1.5 3.5-.8.7-1.5 1.4-1.5 2.5h-4c0-1.1-.7-1.8-1.5-2.5Z" /></svg>
                {isHintVisible ? 'Hide hint' : 'Take hint (-5 XP)'}
              </button>
              {isHintVisible && <pre className="m-0 mt-3 whitespace-pre-wrap rounded-sm border border-[#e1e1e1] bg-[#fafaf8] p-3 font-jetbrains-mono text-[13px] leading-[1.55] text-[#304b6c] [[data-theme=dark]_&]:border-[#4a4a4d] [[data-theme=dark]_&]:bg-[#252525] [[data-theme=dark]_&]:text-[#d8e6ff]">{content.hint}</pre>}
            </div>
          </section>
        </div>
      </aside>

      <div
        role="separator"
        tabIndex="0"
        aria-label="Resize exercise pane"
        aria-controls="editor-exercise-pane"
        aria-orientation="vertical"
        aria-valuemin="28"
        aria-valuemax="55"
        aria-valuenow={exerciseWidth}
        className="relative hidden cursor-col-resize touch-none select-none outline-none before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec] min-[900px]:block"
        onPointerDown={(event) => {
          event.preventDefault()
          const bounds = workspaceRef.current?.getBoundingClientRect()
          if (!bounds) return
          const resize = (moveEvent) => setExerciseWidth(Math.round(Math.max(28, Math.min(55, ((moveEvent.clientX - bounds.left) / bounds.width) * 100))))
          const stop = () => {
            window.removeEventListener('pointermove', resize)
            window.removeEventListener('pointerup', stop)
          }
          window.addEventListener('pointermove', resize)
          window.addEventListener('pointerup', stop)
        }}
        onKeyDown={(event) => {
          const amount = event.shiftKey ? 5 : 2
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            setExerciseWidth((width) => Math.max(28, width - amount))
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            setExerciseWidth((width) => Math.min(55, width + amount))
          }
        }}
      />

      <div ref={editorAreaRef} style={{ '--editor-height': `${editorHeight}%` }} className="grid min-w-0 min-h-0 grid-rows-[minmax(0,var(--editor-height))_6px_minmax(150px,1fr)] gap-0">
        <section id="editor-code-pane" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-md border border-[#e1e1e1] bg-white [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1e1e1e]">
          <header className="flex min-h-10 items-stretch border-b border-[#e1e1e1] bg-[#f5f5f4] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#292929]">
            <div className="flex items-center gap-2 border-r border-[#e1e1e1] bg-white px-4 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1e1e1e]">
              <img src="https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg" alt="Python" className="size-5 object-contain" />
              <span className="font-jetbrains-mono text-[13px] font-medium text-[#1d3048] [[data-theme=dark]_&]:text-[#f1f1f1]">{content.filename}</span>
            </div>
            <span className="ml-auto flex items-center px-4 text-xs font-semibold text-[#516984] [[data-theme=dark]_&]:text-[#b2b2b6]">Python</span>
          </header>

          <div className="grid min-h-0 grid-cols-[46px_minmax(0,1fr)] overflow-hidden">
            <ol aria-hidden="true" className="m-0 overflow-hidden border-r border-[#e1e1e1] bg-[#fafaf8] py-4 pr-3 text-right font-jetbrains-mono text-[14px] leading-[21px] text-[#8390a1] [[data-theme=dark]_&]:border-[#343434] [[data-theme=dark]_&]:bg-[#1b1b1b] [[data-theme=dark]_&]:text-[#77777b]">
              {currentCode.split('\n').map((_, index) => <li key={index}>{index + 1}</li>)}
            </ol>
            <label className="min-h-0">
              <span className="sr-only">Python code editor</span>
              <textarea
                className="block h-full min-h-[260px] w-full resize-none border-0 bg-white px-4 py-4 font-jetbrains-mono text-[14px] leading-[21px] text-[#132b45] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6699ec] disabled:cursor-default disabled:opacity-75 [[data-theme=dark]_&]:bg-[#1e1e1e] [[data-theme=dark]_&]:text-[#d4d4d4]"
                value={currentCode}
                disabled={completed}
                spellCheck="false"
                onChange={(event) => {
                  onCodeChange(event.target.value)
                  setRunResult(undefined)
                }}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#e1e1e1] bg-white px-4 py-3 [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#252526]">
            <button type="button" aria-label="Reset code" title="Reset code" className="grid size-9 place-items-center rounded border border-[#aab5c5] bg-white text-[#1d3048] transition-colors hover:bg-[#eff4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] disabled:cursor-not-allowed disabled:opacity-50 [[data-theme=dark]_&]:border-[#67676d] [[data-theme=dark]_&]:bg-transparent [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#6699ec]/15" disabled={completed} onClick={() => {
              onCodeChange(content.starterCode)
              setRunResult(undefined)
            }}><svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></svg></button>
            <button type="button" className="min-h-9 rounded border border-[#8a9ab0] bg-white px-4 text-sm font-semibold text-[#1d3048] transition-colors hover:bg-[#eff4ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] [[data-theme=dark]_&]:border-[#67676d] [[data-theme=dark]_&]:bg-transparent [[data-theme=dark]_&]:text-[#f4f4f2] [[data-theme=dark]_&]:hover:bg-[#6699ec]/15" onClick={runCode}>Run code</button>
            <div className="ml-auto flex items-center gap-3">
              {!completed && !hasYearlyTotal && <span className="hidden text-xs text-[#718198] min-[1180px]:inline [[data-theme=dark]_&]:text-[#a9a9ad]">Write and print the total to check it.</span>}
              {!completed && <button type="button" className="min-h-9 rounded bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec] disabled:cursor-not-allowed disabled:bg-[#b7c9ee]" disabled={!hasYearlyTotal} onClick={onComplete}>Check solution</button>}
              {completed && <button type="button" className="min-h-10 rounded bg-[#6699ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f83db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6699ec]" onClick={onContinue}>Continue lesson</button>}
            </div>
          </div>
        </section>

        <div
          role="separator"
          tabIndex="0"
          aria-label="Resize output console"
          aria-controls="editor-code-pane editor-output-pane"
          aria-orientation="horizontal"
          aria-valuemin="55"
          aria-valuemax="85"
          aria-valuenow={editorHeight}
          className="relative cursor-row-resize touch-none select-none outline-none before:absolute before:inset-x-0 before:top-1/2 before:h-px before:-translate-y-1/2 before:bg-transparent hover:before:bg-[#6699ec] focus-visible:before:bg-[#6699ec]"
          onPointerDown={(event) => {
            event.preventDefault()
            const bounds = editorAreaRef.current?.getBoundingClientRect()
            if (!bounds) return
            const resize = (moveEvent) => setEditorHeight(Math.round(Math.max(55, Math.min(85, ((moveEvent.clientY - bounds.top) / bounds.height) * 100))))
            const stop = () => {
              window.removeEventListener('pointermove', resize)
              window.removeEventListener('pointerup', stop)
            }
            window.addEventListener('pointermove', resize)
            window.addEventListener('pointerup', stop)
          }}
          onKeyDown={(event) => {
            const amount = event.shiftKey ? 5 : 2
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setEditorHeight((height) => Math.max(55, height - amount))
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setEditorHeight((height) => Math.min(85, height + amount))
            }
          }}
        />

        <section id="editor-output-pane" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-[#e1e1e1] bg-white [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1e1e1e]" aria-live="polite" aria-atomic="true">
          <header className="flex min-h-10 items-center border-b border-[#e1e1e1] bg-[#f5f5f4] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#292929]">
            <span className="flex h-10 items-center border-r border-[#e1e1e1] bg-white px-4 text-sm font-semibold text-[#1d3048] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1e1e1e] [[data-theme=dark]_&]:text-[#f4f4f2]">Output</span>
            <span className="px-4 text-sm font-medium text-[#8793a4]">Console</span>
            <svg aria-hidden="true" className="ml-auto mr-4 size-4 text-[#52647c] [[data-theme=dark]_&]:text-[#c4ccd8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </header>
          <pre className="m-0 min-h-0 overflow-auto whitespace-pre-wrap bg-white px-4 py-3 font-jetbrains-mono text-[14px] leading-[1.6] text-[#1d3048] [[data-theme=dark]_&]:bg-[#1e1e1e] [[data-theme=dark]_&]:text-[#d4d4d4]">{runResult ?? 'Run your code to see the result here.'}</pre>
        </section>
      </div>
    </section>
  )
}

export function LessonCodeEditor(props) {
  if (props.content.layout === 'guided') return <GuidedCodeEditor {...props} />
  return <FullCodeEditor {...props} />
}
