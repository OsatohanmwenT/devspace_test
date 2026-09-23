import { useState } from 'react'
import { isSimulatedPythonComplete } from './codeEditorState'

export function LessonCodeEditor({ content, completed, onComplete }) {
  const [code, setCode] = useState(content.starterCode)
  const [runResult, setRunResult] = useState()
  const hasYearlyTotal = isSimulatedPythonComplete(code)

  const runCode = () => {
    setRunResult(hasYearlyTotal ? content.output : 'Finish the calculation and print the yearly total to see the result.')
  }

  return (
    <section className="grid w-full max-w-[720px] gap-5">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[#6699ec]">Code lab</p>
        <h1 className="m-0 mt-2 font-rethink-sans text-[26px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{content.title}</h1>
        <p className="m-0 mt-2 text-[16px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{content.description}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#3a3a3a] bg-[#1e1e1e]">
        <div className="flex items-center gap-2 border-b border-[#404040] bg-[#252526] px-4 py-2.5">
          <span className="grid h-4 w-4 place-items-center rounded-sm bg-[#569cd6] text-[9px] font-bold text-neutral-800">PY</span>
          <span className="font-jetbrains-mono text-[13px] text-[#d4d4d4]">{content.filename}</span>
        </div>
        <textarea
          className="block min-h-[206px] w-full resize-y border-0 bg-transparent px-4 py-3.5 font-jetbrains-mono text-[14px] leading-[1.8] text-[#d4d4d4] outline-none placeholder:text-[#858585] disabled:cursor-default disabled:opacity-75"
          value={code}
          disabled={completed}
          spellCheck="false"
          aria-label="Python code editor"
          onChange={(event) => {
            setCode(event.target.value)
            setRunResult(undefined)
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="min-h-10 rounded-lg border border-[#5c5c60] bg-transparent px-4 text-sm font-semibold text-[#f4f4f2] hover:border-[#6699ec] hover:bg-[#303030] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f8ff]" onClick={runCode}>Run code</button>
        {!completed && <button type="button" className="min-h-10 rounded-lg bg-[#3c82f6] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#2f73e8]" disabled={!hasYearlyTotal} onClick={onComplete}>Check solution</button>}
        {completed && <span className="text-sm font-semibold text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">Solution complete</span>}
      </div>

      {runResult && <div className="rounded-xl border border-[#404040] bg-[#262626] px-4 py-3 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#f7f7f7]" aria-live="polite">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a9a9d]">Output</p>
        <pre className="m-0 mt-1.5 whitespace-pre-wrap font-jetbrains-mono text-[14px] leading-[1.5] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{runResult}</pre>
      </div>}
    </section>
  )
}
