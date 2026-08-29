import { useState } from 'react'
import { RichText } from './RichText'
import { LessonDataTable } from './LessonDataTable'
import {
  isTableTaskComplete, isTableTasksComplete, isSortComplete, isIssueSpotterComplete, isReorderCorrect, isFieldSelectionValid,
} from '../../lib/practiceCheck'

const PANEL = 'rounded-2xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#262626] [[data-theme=light]_&]:bg-[#f5f5f5] p-4'
const CHIP_BASE = 'min-h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors'
const CHIP_IDLE = 'border-[#4a4a4a] [[data-theme=light]_&]:border-[#d5d5d5] bg-transparent text-[#c4c4c7] [[data-theme=light]_&]:text-[#525252] hover:border-[#6699ec]'
const CHIP_ACTIVE = 'border-[#04adc0] bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const CHIP_WRONG = 'border-[#ff676d] bg-[#442f30] text-[#f4f4f2]'

function SuccessBanner({ body }) {
  return (
    <div className="rounded-2xl border border-[#2b5540] bg-[#16281f] px-5 py-3.5 [[data-theme=light]_&]:border-[#b6e3ca] [[data-theme=light]_&]:bg-[#e7f6ee]">
      <strong className="block text-sm text-[#6ee7a8] [[data-theme=light]_&]:text-[#197a4b]">Nice work</strong>
      <p className="m-0 mt-1 text-[14px] leading-[1.5] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{body}</p>
    </div>
  )
}

function TableTasksPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const answeredTaskIds = answer?.answeredTaskIds ?? []
  const [missTaskId, setMissTaskId] = useState(null)
  const activeTask = content.tasks.find((task) => !answeredTaskIds.includes(task.id))

  const handleSelect = (clicked) => {
    if (!activeTask) return
    if (isTableTaskComplete(activeTask, clicked)) {
      const nextIds = [...answeredTaskIds, activeTask.id]
      onAnswerChange({ answeredTaskIds: nextIds })
      setMissTaskId(null)
      if (isTableTasksComplete(content.tasks, nextIds)) onComplete()
    } else {
      setMissTaskId(activeTask.id)
      window.setTimeout(() => setMissTaskId((current) => (current === activeTask.id ? null : current)), 500)
    }
  }

  return (
    <div className="grid gap-4">
      <LessonDataTable
        columns={content.dataset.columns}
        rows={content.dataset.rows}
        rowKey={content.dataset.rowKey}
        variant="select"
        onSelectRow={activeTask?.target.type === 'row' ? (rowId) => handleSelect({ type: 'row', rowId }) : undefined}
        onSelectColumn={activeTask?.target.type === 'column' ? (columnKey) => handleSelect({ type: 'column', columnKey }) : undefined}
        onSelectCell={activeTask?.target.type === 'cell' ? (rowId, columnKey) => handleSelect({ type: 'cell', rowId, columnKey }) : undefined}
      />
      <ol className="m-0 grid list-none gap-2 p-0">
        {content.tasks.map((task, index) => {
          const done = answeredTaskIds.includes(task.id)
          const isActive = activeTask?.id === task.id
          return (
            <li key={task.id} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] ${done ? 'bg-[#16281f] text-[#6ee7a8] [[data-theme=light]_&]:bg-[#e7f6ee] [[data-theme=light]_&]:text-[#197a4b]' : isActive && missTaskId === task.id ? 'bg-[#2a1817]' : 'bg-[#1f1f1f] text-[#c4c4c7] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#525252]'}`}>
                <span className={`grid size-6 flex-none place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-[#2b5540] text-white' : 'bg-[#404040] text-[#d7d7da] [[data-theme=light]_&]:bg-[#e1e1e1] [[data-theme=light]_&]:text-[#525252]'}`}>{done ? '✓' : index + 1}</span>
                {task.prompt}
              </li>
            )
          })}
      </ol>
      {completed && <SuccessBanner body={content.successBody} />}
    </div>
  )
}

function SortCardsPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const assignments = answer?.assignments ?? {}
  const [wrongFlash, setWrongFlash] = useState(null)

  const assign = (itemId, zoneId, itemZone) => {
    if (zoneId !== itemZone) {
      setWrongFlash(`${itemId}:${zoneId}`)
      window.setTimeout(() => setWrongFlash((current) => (current === `${itemId}:${zoneId}` ? null : current)), 450)
      return
    }
    const nextAssignments = { ...assignments, [itemId]: zoneId }
    onAnswerChange({ assignments: nextAssignments })
    if (isSortComplete(content.items, nextAssignments)) onComplete()
  }

  return (
    <div className="grid gap-3">
      {content.items.map((item) => {
        const assignedZone = assignments[item.id]
        return (
          <div key={item.id} className={`${PANEL} flex flex-wrap items-center justify-between gap-3 p-3.5`}>
            <span className="font-jetbrains-mono text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{item.label}</span>
            <div className="flex gap-2">
              {content.zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  disabled={Boolean(assignedZone)}
                  onClick={() => assign(item.id, zone.id, item.zone)}
                  className={`${CHIP_BASE} ${assignedZone === zone.id ? CHIP_ACTIVE : wrongFlash === `${item.id}:${zone.id}` ? CHIP_WRONG : CHIP_IDLE} disabled:cursor-default disabled:opacity-60`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {completed && <SuccessBanner body={content.successBody} />}
    </div>
  )
}

function IssueSpotterPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const foundIssueIds = answer?.foundIssueIds ?? []
  const [nudge, setNudge] = useState(false)
  const markers = Object.fromEntries(
    content.issues.filter((issue) => foundIssueIds.includes(issue.id)).map((issue) => [`${issue.rowId}:${issue.columnKey}`, 'found']),
  )

  const handleCell = (rowId, columnKey) => {
    const issue = content.issues.find((candidate) => candidate.rowId === rowId && candidate.columnKey === columnKey)
    if (!issue) {
      setNudge(true)
      window.setTimeout(() => setNudge(false), 3200)
      return
    }
    if (foundIssueIds.includes(issue.id)) return
    setNudge(false)
    const nextIds = [...foundIssueIds, issue.id]
    onAnswerChange({ foundIssueIds: nextIds })
    if (isIssueSpotterComplete(content.issues, nextIds)) onComplete()
  }

  return (
    <div className="grid gap-4">
      <LessonDataTable
        columns={content.dataset.columns}
        rows={content.dataset.rows}
        rowKey={content.dataset.rowKey}
        variant="select"
        markers={markers}
        onSelectCell={handleCell}
      />
      <div className="flex flex-wrap gap-2" aria-live="polite">
        {content.issues.map((issue) => (
          <span key={issue.id} className={`${CHIP_BASE} ${foundIssueIds.includes(issue.id) ? CHIP_ACTIVE : 'border-dashed border-[#4a4a4a] [[data-theme=light]_&]:border-[#d5d5d5] text-[#68686c] [[data-theme=light]_&]:text-[#a0a0a0]'} inline-flex items-center`}>
            {issue.label}
          </span>
        ))}
      </div>
      {nudge && (
        <p className="m-0 text-[13px] leading-[1.4] text-[#f0c964]" role="status">{content.nonIssueNudge}</p>
      )}
      {completed && <SuccessBanner body={content.successBody} />}
    </div>
  )
}

function ReorderPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const order = answer?.order ?? content.items.map((item) => item.id)
  const scenarioAnswer = answer?.scenarioAnswer ?? null
  const orderCorrect = isReorderCorrect(order, content.correctOrder)
  const scenarioCorrect = scenarioAnswer === content.scenario.correctIndex

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[index], next[target]] = [next[target], next[index]]
    onAnswerChange({ ...answer, order: next })
  }

  const answerScenario = (index) => {
    onAnswerChange({ ...answer, order, scenarioAnswer: index })
    if (orderCorrect && index === content.scenario.correctIndex) onComplete()
  }

  return (
    <div className="grid gap-4">
      <ol className="m-0 grid list-none gap-2 p-0">
        {order.map((id, index) => {
          const item = content.items.find((candidate) => candidate.id === id)
          const inPlace = orderCorrect
          return (
            <li key={id} className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 ${inPlace ? 'bg-[#16281f] text-[#6ee7a8] [[data-theme=light]_&]:bg-[#e7f6ee] [[data-theme=light]_&]:text-[#197a4b]' : 'bg-[#1f1f1f] text-[#f4f4f2] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'}`}>
              <span className="grid size-6 flex-none place-items-center rounded-full bg-[#404040] text-[11px] font-bold text-[#d7d7da] [[data-theme=light]_&]:bg-[#e1e1e1] [[data-theme=light]_&]:text-[#525252]">{index + 1}</span>
              <span className="flex-1 text-[14px] font-medium">{item.label}</span>
              {!inPlace && (
                <span className="flex gap-1">
                  <button type="button" aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => move(index, -1)} className="grid size-7 place-items-center rounded-md border border-[#4a4a4a] [[data-theme=light]_&]:border-[#d5d5d5] text-[#c4c4c7] disabled:opacity-30">↑</button>
                  <button type="button" aria-label={`Move ${item.label} down`} disabled={index === order.length - 1} onClick={() => move(index, 1)} className="grid size-7 place-items-center rounded-md border border-[#4a4a4a] [[data-theme=light]_&]:border-[#d5d5d5] text-[#c4c4c7] disabled:opacity-30">↓</button>
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {orderCorrect && (
        <div className={`${PANEL}`}>
          <p className="m-0 mb-3 text-[14px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"><RichText content={content.scenario.prompt} /></p>
          <div className="grid gap-2">
            {content.scenario.options.map((option, index) => {
              const isSelected = scenarioAnswer === index
              const showWrong = isSelected && scenarioAnswer !== null && index !== content.scenario.correctIndex
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => answerScenario(index)}
                  className={`rounded-xl border px-4 py-2.5 text-left text-[14px] ${scenarioCorrect && isSelected ? 'border-[#2b5540] bg-[#16281f] text-[#6ee7a8] [[data-theme=light]_&]:border-[#b6e3ca] [[data-theme=light]_&]:bg-[#e7f6ee]' : showWrong ? 'border-[#ff676d] bg-[#442f30] text-[#f4f4f2]' : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] text-[#f4f4f2] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 hover:border-[#6699ec]'}`}
                >
                  <RichText content={option} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {completed && <SuccessBanner body={content.successBody} />}
    </div>
  )
}

function FieldSelectPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const selectedKeys = answer?.selectedKeys ?? []
  const [invalidNote, setInvalidNote] = useState(null)

  const toggle = (key) => {
    if (completed) return
    const next = selectedKeys.includes(key) ? selectedKeys.filter((candidate) => candidate !== key) : [...selectedKeys, key]
    onAnswerChange({ selectedKeys: next })
    setInvalidNote(null)
  }

  const prepare = () => {
    if (isFieldSelectionValid(selectedKeys, content.required, content.optional ?? [])) {
      onAnswerChange({ selectedKeys, prepared: true })
      onComplete()
    } else {
      const missing = content.required.some((key) => !selectedKeys.includes(key))
      setInvalidNote(missing ? 'This analysis needs a couple more fields than you’ve picked.' : 'That still includes more than this question needs.')
    }
  }

  return (
    <div className="grid gap-4">
      <div className={`${PANEL} grid gap-2`}>
        {content.columns.map((column) => {
          const checked = selectedKeys.includes(column.key)
          const fading = completed && !checked
          return (
            <label key={column.key} className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-[14px] transition-opacity duration-500 ${fading ? 'opacity-20' : ''} ${completed ? 'cursor-default' : 'cursor-pointer hover:bg-[#1f1f1f] [[data-theme=light]_&]:hover:bg-white'}`}>
              <input type="checkbox" checked={checked} disabled={completed} onChange={() => toggle(column.key)} className="size-4 accent-[#6699ec]" />
              <span className="font-jetbrains-mono text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{column.label}</span>
            </label>
          )
        })}
      </div>
      {!completed && (
        <button type="button" onClick={prepare} className="justify-self-start rounded-xl border-0 bg-[#2563eb] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_3px_0_#1d4ed8] hover:bg-[#3b82f6]">
          {content.prepareLabel ?? 'Prepare dataset'}
        </button>
      )}
      {invalidNote && <p className="m-0 text-[13px] text-[#ffa8a2] [[data-theme=light]_&]:text-[#b3261e]">{invalidNote}</p>}
      {completed && <SuccessBanner body={content.successBody} />}
    </div>
  )
}

const MODES = {
  'table-tasks': TableTasksPractice,
  'sort-cards': SortCardsPractice,
  'issue-spotter': IssueSpotterPractice,
  reorder: ReorderPractice,
  'field-select': FieldSelectPractice,
}

export function LessonPractice({ content, answer, onAnswerChange, onComplete, completed }) {
  const Mode = MODES[content.mode]
  if (!Mode) return null

  return (
    <div className="h-full overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fafaf8]">
      <div className="max-w-[72ch] mx-auto pt-[clamp(24px,4vw,48px)] px-7 pb-10 max-[720px]:pt-6 max-[720px]:px-5 max-[720px]:pb-9">
        {content.eyebrow && <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb]">{content.eyebrow}</p>}
        <h1 className="m-0 mb-3 font-rethink-sans text-[27px] max-[720px]:text-[25px] font-semibold leading-[1.16] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{content.title}</h1>
        <p className="m-0 mb-5 max-w-[72ch] text-[16px] leading-[1.55] text-[#b2b2b6] [[data-theme=light]_&]:text-[#777]">{content.instruction}</p>
        <Mode content={content} answer={answer} onAnswerChange={onAnswerChange} onComplete={onComplete} completed={completed} />
      </div>
    </div>
  )
}
