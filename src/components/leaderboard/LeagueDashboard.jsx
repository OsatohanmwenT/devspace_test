import { useEffect, useMemo, useRef, useState } from 'react'
import { buildInsightsCsv, buildReminder } from '../../lib/leagueInsights'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { CoinIcon } from '../ui/GameIcon'

const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FAINT = 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
const STRONG = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const PANEL = 'rounded-3xl bg-[#1a1a1c] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_1px_3px_rgba(20,20,20,0.06)]'
const EYEBROW = `text-[11px] font-semibold uppercase tracking-[.08em] ${FAINT}`
const BAR = '#4169e1'

const STATUS_PILL = {
  hot: 'bg-[#04adc0]/15 text-[#04adc0] [[data-theme=light]_&]:bg-[#e3f6f8] [[data-theme=light]_&]:text-[#065f6b]',
  active: 'bg-[#2a2a2e] text-[#c7c7ca] [[data-theme=light]_&]:bg-[#eeeeeb] [[data-theme=light]_&]:text-[#525252]',
  inactive: 'bg-[#ffb454]/15 text-[#ffb454] [[data-theme=light]_&]:bg-[#fff3e0] [[data-theme=light]_&]:text-[#8a5300]',
}
const STATUS_ICON = { hot: '▲', active: '●', inactive: '!' }

const shortDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
const lastActiveLabel = (days) => (days === null ? 'Never' : days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`)

function niceCeil(value) {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value)
  return step * magnitude
}

function Kpi({ label, value, detail }) {
  return (
    <div className={`grid content-start gap-1 px-5 py-4 ${PANEL}`}>
      <span className={EYEBROW}>{label}</span>
      <strong className={`text-[26px] font-semibold leading-tight tabular-nums ${STRONG}`}>{value}</strong>
      {detail && <span className={`text-[12px] ${MUTED}`}>{detail}</span>}
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_PILL[status.id]}`}>
      <span aria-hidden="true" className="text-[9px]">{STATUS_ICON[status.id]}</span>
      {status.label}
    </span>
  )
}

// Coins the whole league earned each day of the season. One series, so the
// heading names it and there's no legend; the participant table below is
// the table view. Future days are drawn as empty slots so the season's
// length — how much competition is left — reads at a glance.
function DailyActivityChart({ days, participantCount }) {
  const [hovered, setHovered] = useState(null)
  const max = niceCeil(Math.max(...days.map((day) => day.coins), 1))
  const ticks = [max, max / 2, 0]
  const focus = hovered === null ? null : days[hovered]

  return (
    <div className={`grid gap-4 p-5 ${PANEL}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`m-0 text-[15px] font-semibold ${STRONG}`}>Coins earned per day</h3>
        <span className={`text-[12px] ${MUTED}`}>Whole league · this season</span>
      </div>

      <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
        <div className={`relative h-40 w-7 text-right text-[10px] tabular-nums ${FAINT}`} aria-hidden="true">
          {ticks.map((tick, index) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(index / 2) * 100}%` }}>{Math.round(tick)}</span>
          ))}
        </div>

        <div className="relative h-40">
          {ticks.map((tick, index) => (
            <span key={tick} aria-hidden="true" className="absolute inset-x-0 h-px bg-[#2e2e30] [[data-theme=light]_&]:bg-[#ebe9e4]" style={{ top: `${(index / 2) * 100}%` }} />
          ))}
          <ol className="absolute inset-0 m-0 grid list-none grid-cols-[repeat(28,minmax(0,1fr))] gap-[2px] p-0" onMouseLeave={() => setHovered(null)}>
            {days.map((day) => {
              const height = day.isFuture ? 0 : (day.coins / max) * 100
              return (
                <li
                  key={day.day}
                  tabIndex={day.isFuture ? -1 : 0}
                  onMouseEnter={() => setHovered(day.day)}
                  onFocus={() => setHovered(day.day)}
                  onBlur={() => setHovered(null)}
                  aria-label={day.isFuture ? `${shortDate(day.date)}, still to come` : `${shortDate(day.date)}: ${day.coins} coins, ${day.active} of ${participantCount} active`}
                  className="relative flex h-full items-end outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#88bdf2]"
                >
                  {day.isFuture ? (
                    <span className="block h-1 w-full rounded-full bg-[#2e2e30] [[data-theme=light]_&]:bg-[#ebe9e4]" />
                  ) : (
                    <span
                      className="block w-full rounded-t-[4px] transition-opacity"
                      style={{ height: `${Math.max(height, day.coins > 0 ? 3 : 0)}%`, background: BAR, opacity: hovered === null || hovered === day.day ? 1 : 0.45 }}
                    />
                  )}
                </li>
              )
            })}
          </ol>

          {focus && !focus.isFuture && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 grid gap-0.5 whitespace-nowrap rounded-xl border border-[#404040] bg-[#262626] px-3 py-2 text-[12px] shadow-lg [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white"
              style={{ left: `${((focus.day + 0.5) / days.length) * 100}%`, transform: `translate(${focus.day > 20 ? '-100%' : focus.day < 7 ? '0' : '-50%'}, -100%)` }}
            >
              <span className={`font-semibold ${STRONG}`}>{focus.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className={MUTED}>{focus.coins} coins · {focus.active} of {participantCount} active</span>
            </div>
          )}
        </div>

        <span />
        <div className={`mt-1.5 grid grid-cols-4 text-[10px] ${FAINT}`} aria-hidden="true">
          {[0, 7, 14, 21].map((day) => <span key={day}>{shortDate(days[day].date)}</span>)}
        </div>
      </div>
    </div>
  )
}

function PersonList({ title, empty, people, renderDetail, onSelect }) {
  return (
    <div className={`grid content-start gap-3 p-5 ${PANEL}`}>
      <h3 className={`m-0 text-[15px] font-semibold ${STRONG}`}>{title}</h3>
      {people.length === 0 ? (
        <p className={`m-0 text-[13px] ${MUTED}`}>{empty}</p>
      ) : (
        <ul className="m-0 grid list-none gap-1 p-0">
          {people.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                disabled={person.isCurrentUser}
                onClick={() => onSelect(person)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors enabled:hover:bg-[#262626] [[data-theme=light]_&]:enabled:hover:bg-[#f3f1ec]"
              >
                <Avatar name={person.name} avatarSeed={person.id} size="sm" />
                <span className={`min-w-0 flex-1 truncate text-[13px] font-medium ${STRONG}`}>{person.name}</span>
                <span className={`flex-none text-[12px] tabular-nums ${MUTED}`}>{renderDetail(person)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Delta({ value, suffix = '', label }) {
  if (value === null || value === undefined || value === 0) return null
  const up = value > 0
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${up ? 'text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]' : 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]'}`}>
      <span aria-hidden="true">{up ? '▲' : '▼'}{Math.abs(value)}{suffix}</span>
      {label && <span className="sr-only">{label}: {up ? 'up' : 'down'} {Math.abs(value)}</span>}
    </span>
  )
}

// Narrower screens shed the columns the status pill already summarizes.
const HIDE_BELOW_900 = 'max-[900px]:hidden'
const HIDE_ON_PHONE = 'max-[680px]:hidden'

// Two alignments only: names and status read left, every figure sits
// centered in its column so a header and its values share one axis.
const COLUMNS = [
  { key: 'rank', label: 'Rank', short: '#', align: 'center', defaultDir: 'asc' },
  { key: 'name', label: 'Participant', short: 'Name', align: 'left', defaultDir: 'asc' },
  { key: 'score', label: 'Coins', align: 'center', defaultDir: 'desc' },
  { key: 'last7', label: 'This week', short: '7d', align: 'center', defaultDir: 'desc' },
  { key: 'activeDays', label: 'Active days', align: 'center', defaultDir: 'desc', hide: HIDE_BELOW_900 },
  { key: 'streak', label: 'Streak', align: 'center', defaultDir: 'desc', hide: HIDE_ON_PHONE },
  { key: 'lastActive', label: 'Last active', align: 'center', defaultDir: 'asc', hide: HIDE_BELOW_900 },
  // On phones status moves under the name, so the name keeps its room.
  { key: 'status', label: 'Status', align: 'left', defaultDir: 'asc', hide: HIDE_ON_PHONE },
]
const CELL = 'px-2.5 py-3 align-middle max-[680px]:px-1.5'
const CENTER = `${CELL} text-center`
const LEFT = `${CELL} text-left`

const STATUS_ORDER = { inactive: 0, active: 1, hot: 2 }
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'inactive', label: 'Needs a nudge' },
  { id: 'active', label: 'Active' },
  { id: 'hot', label: 'On a roll' },
]

function sortValue(participant, key) {
  if (key === 'status') return STATUS_ORDER[participant.status.id]
  if (key === 'lastActive') return participant.lastActive ?? Infinity
  if (key === 'name') return participant.isCurrentUser ? '' : participant.name.toLowerCase()
  return participant[key]
}

const SMALL_BUTTON = 'inline-flex min-h-8 items-center rounded-lg border px-3 text-[12px] font-medium transition-colors'
const SMALL_NEUTRAL = `${SMALL_BUTTON} border-[#404040] text-[#f4f4f2] hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:border-[#c9c9c9]`
const SMALL_DANGER = `${SMALL_BUTTON} border-[#ff676d] text-[#ff676d] hover:bg-[#ff676d]/10 [[data-theme=light]_&]:border-[#b3272d] [[data-theme=light]_&]:text-[#b3272d]`

function RowMenu({ participant, onView, onMessage, onCopy, onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'mousedown' && ref.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const item = 'block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#2e2e30] [[data-theme=light]_&]:hover:bg-[#f3f1ec]'
  const act = (fn) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div ref={ref} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Actions for ${participant.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`grid size-8 place-items-center rounded-lg text-[16px] leading-none hover:bg-[#2e2e30] [[data-theme=light]_&]:hover:bg-[#f0eee9] ${MUTED}`}
      >
        ⋯
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 grid w-44 gap-0.5 rounded-xl border border-[#404040] bg-[#262626] p-1 shadow-lg [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white">
          <button type="button" role="menuitem" className={`${item} ${STRONG}`} onClick={act(onView)}>View details</button>
          {onMessage && <button type="button" role="menuitem" className={`${item} ${STRONG}`} onClick={act(onMessage)}>Send a message</button>}
          <button type="button" role="menuitem" className={`${item} ${STRONG}`} onClick={act(onCopy)}>Copy reminder</button>
          {onRemove && <button type="button" role="menuitem" className={`${item} text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]`} onClick={act(onRemove)}>Remove from league</button>}
        </div>
      )}
    </div>
  )
}

function ParticipantTable({ league, insights, onSelect, onRemove, onMessage, user }) {
  const { participants } = insights
  const activeDays = insights.today + 1
  const [sort, setSort] = useState({ key: 'rank', dir: 'asc' })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(() => new Set())
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [notice, setNotice] = useState('')
  // Shown when the clipboard is unavailable (permissions, an unfocused
  // window) so the reminder text is never lost — select it and copy by hand.
  const [manualCopy, setManualCopy] = useState('')

  const counts = useMemo(() => {
    const byStatus = { all: participants.length, inactive: 0, active: 0, hot: 0 }
    for (const participant of participants) byStatus[participant.status.id] += 1
    return byStatus
  }, [participants])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = participants.filter((participant) => {
      if (filter !== 'all' && participant.status.id !== filter) return false
      return !term || `${participant.name} ${participant.role ?? ''}`.toLowerCase().includes(term)
    })
    const direction = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = sortValue(a, sort.key)
      const right = sortValue(b, sort.key)
      if (left === right) return a.rank - b.rank
      return (left > right ? 1 : -1) * direction
    })
  }, [participants, query, filter, sort])

  // Selection only ever holds people still in the league and on screen —
  // removing someone or filtering them out drops them from it.
  const selectable = rows.filter((participant) => !participant.isCurrentUser)
  const selectedRows = selectable.filter((participant) => selected.has(participant.id))
  const allSelected = selectable.length > 0 && selectedRows.length === selectable.length

  const flash = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const toggleSort = (column) => {
    setSort((current) => (current.key === column.key ? { key: column.key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key: column.key, dir: column.defaultDir }))
  }

  const toggleOne = (id) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectable.map((participant) => participant.id)))

  const copyReminders = async (people) => {
    const text = people.map((participant) => buildReminder(league, participant, insights)).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      flash(people.length === 1 ? `Reminder for ${people[0].name.split(' ')[0]} copied — paste it into email or chat.` : `${people.length} reminders copied — paste them into email or chat.`)
    } catch {
      setManualCopy(text)
    }
  }

  const removePeople = (people) => {
    for (const participant of people) onRemove(participant.id)
    setSelected(new Set())
    setConfirmRemove(null)
    flash(people.length === 1 ? `${people[0].name} removed — their spot is open.` : `${people.length} participants removed — their spots are open.`)
  }

  return (
    <div className={`grid gap-4 p-5 max-[680px]:px-3 ${PANEL}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={`m-0 text-[15px] font-semibold ${STRONG}`}>Participants</h3>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or path"
          aria-label="Search participants"
          className="h-9 w-[240px] rounded-xl border border-[#404040] bg-[#1f1f1f] px-3 text-[13px] text-[#f4f4f2] outline-none placeholder:text-[#7d7d80] focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 max-[680px]:w-full"
        />
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
        {FILTERS.map((option) => {
          const isActive = filter === option.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(option.id)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors ${
                isActive
                  ? 'border-[#88bdf2] bg-[#1f2a3d] text-[#f4f4f2] [[data-theme=light]_&]:border-[#3d77eb] [[data-theme=light]_&]:bg-[#eaf1ff] [[data-theme=light]_&]:text-neutral-800'
                  : `border-[#404040] hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#e1e1e1] ${MUTED}`
              }`}
            >
              {option.label}
              <span className="tabular-nums opacity-70">{counts[option.id]}</span>
            </button>
          )
        })}
      </div>

      {(selectedRows.length > 0 || confirmRemove) && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#404040] bg-[#1f1f1f] px-4 py-2.5 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#faf9f6]" role="region" aria-label="Actions for selected participants">
          {confirmRemove ? (
            <>
              <span className={`mr-auto text-[13px] ${STRONG}`}>
                Remove {confirmRemove.length === 1 ? confirmRemove[0].name : `${confirmRemove.length} participants`}? Their {confirmRemove.length === 1 ? 'spot opens' : 'spots open'} for someone with the code.
              </span>
              <button type="button" className={SMALL_DANGER} onClick={() => removePeople(confirmRemove)}>Yes, remove</button>
              <button type="button" className={SMALL_NEUTRAL} onClick={() => setConfirmRemove(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span className={`mr-auto text-[13px] font-medium ${STRONG}`}>{selectedRows.length} selected</span>
              <button type="button" className={SMALL_NEUTRAL} onClick={() => copyReminders(selectedRows)}>Copy {selectedRows.length === 1 ? 'reminder' : 'reminders'}</button>
              {onRemove && <button type="button" className={SMALL_DANGER} onClick={() => setConfirmRemove(selectedRows)}>Remove</button>}
              <button type="button" className={`text-[12px] font-medium hover:underline ${MUTED}`} onClick={() => setSelected(new Set())}>Clear</button>
            </>
          )}
        </div>
      )}

      {manualCopy && (
        <div className="grid gap-2 rounded-2xl border border-[#404040] bg-[#1f1f1f] p-3 [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-[#faf9f6]">
          <div className="flex items-center justify-between gap-3">
            <span className={`text-[13px] ${STRONG}`}>Your browser blocked copying — select the text below and copy it.</span>
            <button type="button" className={`text-[12px] font-medium hover:underline ${MUTED}`} onClick={() => setManualCopy('')}>Done</button>
          </div>
          <textarea
            readOnly
            value={manualCopy}
            rows={Math.min(8, manualCopy.split('\n').length + 1)}
            onFocus={(event) => event.target.select()}
            autoFocus
            aria-label="Reminder text"
            className="w-full resize-y rounded-xl border border-[#404040] bg-[#1a1a1c] p-3 text-[13px] leading-[1.5] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800"
          />
        </div>
      )}

      {notice && <p role="status" className="m-0 text-[13px] text-[#04adc0] [[data-theme=light]_&]:text-[#065f6b]">{notice}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <caption className="sr-only">Participant stats for this season, {activeDays} days in. Sortable by column.</caption>
          <thead>
            <tr className="border-b border-[#2e2e30] [[data-theme=light]_&]:border-[#ebe9e4]">
              <th scope="col" className="w-10 pb-2.5 pl-2 text-left align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = selectedRows.length > 0 && !allSelected
                  }}
                  onChange={toggleAll}
                  disabled={selectable.length === 0}
                  aria-label="Select all shown participants"
                  className="size-4 accent-[#4169e1]"
                />
              </th>
              {COLUMNS.map((column) => {
                const isSorted = sort.key === column.key
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={isSorted ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`px-2.5 pb-2.5 font-normal max-[680px]:px-1.5 ${column.align === 'center' ? 'text-center' : 'text-left'} ${column.hide ?? ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column)}
                      className={`relative inline-flex items-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-[.06em] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-neutral-800 ${isSorted ? STRONG : FAINT}`}
                    >
                      <span className="max-[680px]:sr-only">{column.label}</span>
                      <span className="min-[681px]:hidden" aria-hidden="true">{column.short ?? column.label}</span>
                      {isSorted && <span aria-hidden="true" className="absolute left-full ml-1">{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                )
              })}
              <th scope="col" className="w-12 pb-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((participant) => {
              const isSelected = selected.has(participant.id)
              const consistency = activeDays ? participant.activeDays / activeDays : 0
              return (
                <tr
                  key={participant.id}
                  onClick={participant.isCurrentUser ? undefined : () => onSelect(participant)}
                  className={`border-b border-[#2e2e30] last:border-b-0 [[data-theme=light]_&]:border-[#f0eee9] ${
                    participant.isCurrentUser
                      ? 'bg-[#2a293c] [[data-theme=light]_&]:bg-[#e9f2ff]'
                      : isSelected
                        ? 'cursor-pointer bg-[#1f2a3d] [[data-theme=light]_&]:bg-[#f2f6ff]'
                        : 'cursor-pointer hover:bg-[#222224] [[data-theme=light]_&]:hover:bg-[#faf9f6]'
                  }`}
                >
                  <td className="py-3 pl-2 align-middle" onClick={(event) => event.stopPropagation()}>
                    {!participant.isCurrentUser && (
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(participant.id)} aria-label={`Select ${participant.name}`} className="size-4 accent-[#4169e1]" />
                    )}
                  </td>
                  <td className={CENTER}>
                    <span className="inline-grid justify-items-center leading-tight">
                      <span className={`font-semibold tabular-nums ${STRONG}`}>{participant.rank}</span>
                      <Delta value={participant.rankChange} label="Places moved this week" />
                    </span>
                  </td>
                  <td className={LEFT}>
                    <span className="flex items-center gap-3 min-[681px]:min-w-[160px]">
                      <Avatar name={participant.name} photo={participant.isCurrentUser ? user?.photo : undefined} avatarStyle={participant.isCurrentUser ? user?.avatarStyle : undefined} avatarSeed={participant.id} size="sm" />
                      <span className="grid min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className={`truncate font-semibold ${STRONG}`}>{participant.isCurrentUser ? 'You' : participant.name}</span>
                          {participant.stars?.map((kind) => <span key={kind} className={`flex-none ${HIDE_ON_PHONE}`}><StarBadge kind={kind} /></span>)}
                        </span>
                        <span className={`truncate text-[11px] ${FAINT} ${HIDE_ON_PHONE}`}>{participant.role}</span>
                        <span className="min-[681px]:hidden"><StatusPill status={participant.status} /></span>
                      </span>
                    </span>
                  </td>
                  <td className={CENTER}>
                    <span className="inline-grid justify-items-center leading-tight">
                      <span className={`font-semibold tabular-nums ${STRONG}`}>{participant.score}</span>
                      {participant.gapAbove !== null && (
                        <span className={`whitespace-nowrap text-[11px] ${FAINT} ${HIDE_ON_PHONE}`}>
                          {participant.gapAbove === 0 ? 'tied' : `${participant.gapAbove} to #${participant.rank - 1}`}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={CENTER}>
                    <span className="inline-grid justify-items-center leading-tight">
                      <span className={`tabular-nums ${STRONG}`}>{participant.last7}</span>
                      {activeDays > 7 && <span className={HIDE_ON_PHONE}><Delta value={participant.weekDelta} label="Change vs last week" /></span>}
                    </span>
                  </td>
                  <td className={`${CENTER} ${HIDE_BELOW_900}`}>
                    <span className="inline-grid justify-items-center gap-1.5">
                      <span className={`tabular-nums ${MUTED}`}>{participant.activeDays}/{activeDays}</span>
                      <span className="block h-1 w-12 overflow-hidden rounded-full bg-[#333336] [[data-theme=light]_&]:bg-[#ececea]" aria-hidden="true">
                        <span className="block h-full rounded-full" style={{ width: `${Math.round(consistency * 100)}%`, background: BAR }} />
                      </span>
                    </span>
                  </td>
                  <td className={`${CENTER} tabular-nums ${HIDE_ON_PHONE} ${MUTED}`}>{participant.streak > 0 ? `${participant.streak}d` : '—'}</td>
                  <td className={`${CENTER} whitespace-nowrap ${HIDE_BELOW_900} ${MUTED}`}>{lastActiveLabel(participant.lastActive)}</td>
                  <td className={`${LEFT} ${HIDE_ON_PHONE}`}><StatusPill status={participant.status} /></td>
                  <td className="py-3 pr-2 text-right align-middle">
                    {!participant.isCurrentUser && (
                      <span className="inline-flex"><RowMenu
                        participant={participant}
                        onView={() => onSelect(participant)}
                        onMessage={onMessage ? () => onMessage(participant) : undefined}
                        onCopy={() => copyReminders([participant])}
                        onRemove={onRemove ? () => setConfirmRemove([participant]) : undefined}
                      /></span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className={`m-0 py-6 text-center text-[13px] ${MUTED}`}>
            {query ? `No one matches “${query}”.` : filter === 'inactive' ? 'Everyone has earned a coin in the last few days.' : 'No one in this group right now.'}
          </p>
        )}
      </div>

      <p className={`m-0 text-[12px] ${FAINT}`}>
        Showing {rows.length} of {participants.length}
        {counts.inactive > 0 && filter !== 'inactive' && <> · <button type="button" className="font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]" onClick={() => setFilter('inactive')}>{counts.inactive} need a nudge</button></>}
      </p>
    </div>
  )
}

const STAR_META = {
  rising: { label: 'Rising star', short: 'Rising', icon: '↗', blurb: 'Biggest jump on last week', pill: 'bg-[#ffb454]/15 text-[#ffb454] [[data-theme=light]_&]:bg-[#fff3e0] [[data-theme=light]_&]:text-[#8a5300]' },
  consistent: { label: 'Consistent star', short: 'Consistent', icon: '◆', blurb: 'Shows up day after day', pill: 'bg-[#4169e1]/15 text-[#84a5ff] [[data-theme=light]_&]:bg-[#eaf1ff] [[data-theme=light]_&]:text-[#2f55c4]' },
}

export function StarBadge({ kind }) {
  const meta = STAR_META[kind]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-[.04em] ${meta.pill}`}>
      <span aria-hidden="true">{meta.icon}</span>
      {meta.short}
    </span>
  )
}

function starDetail(kind, participant, daysSoFar) {
  if (kind === 'rising') return `${participant.last7} this week · +${participant.weekDelta} on last week`
  return `Active ${participant.activeDays} of ${daysSoFar} days${participant.streak > 1 ? ` · ${participant.streak}-day streak` : ''}`
}

function StarCard({ kind, entries, daysSoFar, emptyText, onSelect, user }) {
  const meta = STAR_META[kind]
  const [winner, ...runnersUp] = entries
  return (
    <div className={`grid content-start gap-3 p-5 ${PANEL}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.06em] ${meta.pill}`}>
          <span aria-hidden="true">{meta.icon}</span>{meta.label}
        </span>
        <span className={`text-[12px] ${FAINT}`}>{meta.blurb}</span>
      </div>
      {winner ? (
        <>
          <button
            type="button"
            disabled={winner.isCurrentUser}
            onClick={() => onSelect(winner)}
            className="flex items-center gap-3 rounded-2xl text-left enabled:hover:opacity-90"
          >
            <Avatar name={winner.name} photo={winner.isCurrentUser ? user?.photo : undefined} avatarStyle={winner.isCurrentUser ? user?.avatarStyle : undefined} avatarSeed={winner.id} size="md" />
            <span className="grid min-w-0">
              <strong className={`truncate text-[16px] font-semibold ${STRONG}`}>{winner.isCurrentUser ? 'You' : winner.name}</strong>
              <span className={`text-[13px] ${MUTED}`}>{starDetail(kind, winner, daysSoFar)}</span>
            </span>
          </button>
          {runnersUp.length > 0 && (
            <p className={`m-0 text-[12px] ${FAINT}`}>
              Close behind: {runnersUp.map((entry) => (entry.isCurrentUser ? 'You' : entry.name)).join(', ')}
            </p>
          )}
        </>
      ) : (
        <p className={`m-0 text-[13px] ${MUTED}`}>{emptyText}</p>
      )}
    </div>
  )
}

// One cell per day. Darker = more coins, on a single-hue scale capped at the
// busiest day in the week so a quiet class still shows its shape. The number
// is printed in the cell, so colour is never the only signal.
function DayCell({ day, weekMax, label }) {
  if (day === null) {
    return <span aria-label={`${label}: not yet`} className="grid h-8 place-items-center rounded-lg border border-dashed border-[#333336] [[data-theme=light]_&]:border-[#e4e2dc]" />
  }
  if (day.coins === 0) {
    return (
      <span aria-label={`${label}: ${day.active ? 'active, no coins' : 'no activity'}`} className={`grid h-8 place-items-center rounded-lg bg-[#262628] text-[11px] [[data-theme=light]_&]:bg-[#f1efea] ${FAINT}`}>
        {day.active ? '•' : ''}
      </span>
    )
  }
  const strength = 0.25 + 0.75 * Math.min(1, day.coins / weekMax)
  return (
    <span
      aria-label={`${label}: ${day.coins} coins`}
      className={`grid h-8 place-items-center rounded-lg text-[12px] font-semibold tabular-nums ${strength > 0.55 ? 'text-white' : STRONG}`}
      style={{ background: `color-mix(in srgb, ${BAR} ${Math.round(strength * 100)}%, transparent)` }}
    >
      {day.coins}
    </span>
  )
}

function WeeklyProgress({ insights, onSelect, user }) {
  const { participants, currentWeek, weekDates } = insights
  const [week, setWeek] = useState(currentWeek)
  const [order, setOrder] = useState('rank')
  const weekMax = Math.max(1, ...participants.flatMap((participant) => participant.weeks[week].days.map((day) => day?.coins ?? 0)))
  const dayNames = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekDates[week].getTime() + offset * 24 * 60 * 60 * 1000)
    return { short: date.toLocaleDateString(undefined, { weekday: 'narrow' }), long: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) }
  })
  const rows = [...participants].sort((a, b) => (order === 'week' ? b.weeks[week].coins - a.weeks[week].coins || a.rank - b.rank : a.rank - b.rank))
  const weekTotal = participants.reduce((total, participant) => total + participant.weeks[week].coins, 0)
  const daysElapsed = week === currentWeek ? insights.today - currentWeek * 7 + 1 : 7
  const showedUp = participants.filter((participant) => participant.weeks[week].activeDays > 0).length

  return (
    <div className={`grid gap-4 p-5 max-[680px]:px-3 ${PANEL}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <h3 className={`m-0 text-[15px] font-semibold ${STRONG}`}>Weekly progress</h3>
          <span className={`text-[12px] ${MUTED}`}>{weekTotal} coins · {showedUp} of {participants.length} showed up</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full bg-[#1e1e1e] p-1 [[data-theme=light]_&]:bg-[#f1efe9]" role="group" aria-label="Season week">
            {weekDates.map((date, index) => {
              const isFuture = index > currentWeek
              const isActive = index === week
              return (
                <button
                  key={index}
                  type="button"
                  disabled={isFuture}
                  aria-pressed={isActive}
                  title={`Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                  onClick={() => setWeek(index)}
                  className={`min-h-7 rounded-full px-3 text-[12px] font-medium transition-colors disabled:opacity-35 ${isActive ? 'bg-[#262626] text-[#f4f4f2] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800' : `${MUTED} enabled:hover:text-[#f4f4f2] [[data-theme=light]_&]:enabled:hover:text-neutral-800`}`}
                >
                  Week {index + 1}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setOrder((current) => (current === 'rank' ? 'week' : 'rank'))}
            className={`min-h-8 rounded-full border border-[#404040] px-3 text-[12px] font-medium hover:border-[#5a5a60] [[data-theme=light]_&]:border-[#e1e1e1] ${MUTED}`}
          >
            {order === 'rank' ? 'Order: season rank' : 'Order: this week'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">Coins each participant earned per day in week {week + 1}.</caption>
          <thead>
            <tr>
              <th scope="col" className={`pb-2 pr-3 text-left text-[11px] font-semibold uppercase tracking-[.06em] ${FAINT}`}>Participant</th>
              {dayNames.map((day) => (
                <th key={day.long} scope="col" className={`w-10 px-0.5 pb-2 text-center text-[11px] font-semibold ${FAINT}`} title={day.long}>
                  <span aria-hidden="true">{day.short}</span>
                  <span className="sr-only">{day.long}</span>
                </th>
              ))}
              <th scope="col" className={`w-16 pb-2 pl-3 text-center text-[11px] font-semibold uppercase tracking-[.06em] ${FAINT}`}>Week</th>
              <th scope="col" className={`w-20 pb-2 text-center text-[11px] font-semibold uppercase tracking-[.06em] ${FAINT} max-[680px]:hidden`} title={daysElapsed < 7 ? `Compared with the first ${daysElapsed} days of the week before` : 'Compared with the week before'}>vs prev</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((participant) => {
              const current = participant.weeks[week]
              // A week in progress is compared with the same days of the week
              // before — two days against a full week would read as a slump.
              const previous = week > 0
                ? participant.weeks[week - 1].days.slice(0, daysElapsed).reduce((total, day) => total + (day?.coins ?? 0), 0)
                : null
              return (
                <tr key={participant.id} className={participant.isCurrentUser ? 'bg-[#2a293c] [[data-theme=light]_&]:bg-[#e9f2ff]' : ''}>
                  <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                    <button
                      type="button"
                      disabled={participant.isCurrentUser}
                      onClick={() => onSelect(participant)}
                      className="flex min-w-[140px] items-center gap-2.5 text-left enabled:hover:underline max-[680px]:min-w-[96px]"
                    >
                      <Avatar name={participant.name} photo={participant.isCurrentUser ? user?.photo : undefined} avatarStyle={participant.isCurrentUser ? user?.avatarStyle : undefined} avatarSeed={participant.id} size="sm" />
                      <span className={`truncate font-medium ${STRONG}`}>{participant.isCurrentUser ? 'You' : participant.name}</span>
                    </button>
                  </th>
                  {current.days.map((day, index) => (
                    <td key={index} className="px-0.5 py-1.5">
                      <DayCell day={day} weekMax={weekMax} label={dayNames[index].long} />
                    </td>
                  ))}
                  <td className={`py-1.5 pl-3 text-center font-semibold tabular-nums ${STRONG}`}>{current.coins}</td>
                  <td className="py-1.5 text-center max-[680px]:hidden">
                    {previous === null ? <span className={FAINT}>–</span> : <Delta value={current.coins - previous} label="Change vs the week before" />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className={`m-0 text-[12px] ${FAINT}`}>{daysElapsed < 7 && `“vs prev” compares these ${daysElapsed} days with the same days last week. `}Darker squares mean more coins. A dot means they practised but didn’t earn coins that day; dashed squares haven’t happened yet.</p>
    </div>
  )
}

export const DASHBOARD_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'weekly', label: 'Weekly progress' },
  { id: 'activity', label: 'Daily activity' },
  { id: 'participants', label: 'Participants' },
]

const PAGE = 'bg-[#121214] [[data-theme=light]_&]:bg-[#f6f5f1]'
const TOPBAR = 'bg-[#18181a] [[data-theme=light]_&]:bg-white'
const BAR_LINE = 'border-[#2b2b2f] [[data-theme=light]_&]:border-[#e4e2dc]'

function Section({ id, title, hint, children }) {
  return (
    <section id={`dash-${id}`} aria-label={DASHBOARD_SECTIONS.find((entry) => entry.id === id)?.label} className="grid scroll-mt-6 gap-3">
      {title && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className={`m-0 text-[18px] font-semibold ${STRONG}`}>{title}</h2>
          {hint && <span className={`text-[13px] ${MUTED}`}>{hint}</span>}
        </div>
      )}
      {children}
    </section>
  )
}

// The dashboard's content. It fills whatever width it's given — the page
// wrapper below decides how wide that is — and stacks into one column on
// phones. Five sections, each anchored so the page nav can jump to it.
export function LeagueDashboard({ league, insights, user, onSelectParticipant, onRemoveParticipant, onMessageParticipant }) {
  const { kpis, dailyTotals, needsAttention, topMovers, today } = insights
  const weekDelta = kpis.weekCoins - kpis.prevWeekCoins
  const daysIn = today + 1

  return (
    <div className="grid gap-10">
      <Section id="overview" title="Overview" hint={league.organizerOnly ? 'You’re organizing — you’re not on the board.' : `Day ${daysIn} of ${insights.seasonDays}`}>
        <div className="grid grid-cols-4 gap-3 max-[860px]:grid-cols-2">
          <Kpi label="Participants" value={kpis.participants} detail={league.organizerOnly ? 'Not counting you' : 'Including you'} />
          <Kpi label="Active this week" value={`${Math.round(kpis.activeShare * 100)}%`} detail={`${kpis.activeThisWeek} of ${kpis.participants} earned a coin`} />
          <Kpi
            label="Coins this week"
            value={<span className="inline-flex items-center gap-1.5">{kpis.weekCoins}<CoinIcon className="text-[16px]" /></span>}
            detail={daysIn <= 7 ? 'First week of the season' : weekDelta === 0 ? 'Same as last week' : `${weekDelta > 0 ? '▲' : '▼'} ${Math.abs(weekDelta)} vs last week`}
          />
          <Kpi label="Median season coins" value={kpis.medianCoins} detail={`${kpis.totalCoins} across the league`} />
        </div>
      </Section>

      <Section id="recognition" title="Recognition" hint="Who to call out, and who to check in on">
        <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[680px]:grid-cols-1">
          <StarCard
            kind="rising"
            entries={insights.stars.rising}
            daysSoFar={daysIn}
            emptyText={daysIn <= 7 ? 'Picked from week two, once there’s a last week to improve on.' : 'No one has jumped on last week yet — a strong day could change that.'}
            onSelect={onSelectParticipant}
            user={user}
          />
          <StarCard
            kind="consistent"
            entries={insights.stars.consistent}
            daysSoFar={daysIn}
            emptyText={daysIn < 5 ? 'Picked once the season is a few days old.' : 'No one has been active on 80% of days yet.'}
            onSelect={onSelectParticipant}
            user={user}
          />
          <PersonList
            title="Needs a nudge"
            empty="Everyone has earned a coin in the last few days."
            people={needsAttention.slice(0, 5)}
            renderDetail={(person) => (person.lastActive === null ? 'Not started' : `Quiet ${person.lastActive}d`)}
            onSelect={onSelectParticipant}
          />
          <PersonList
            title="Top this week"
            empty="No one has earned a coin this week yet."
            people={topMovers}
            renderDetail={(person) => `${person.last7} this week`}
            onSelect={onSelectParticipant}
          />
        </div>
      </Section>

      <Section id="weekly">
        <WeeklyProgress insights={insights} onSelect={onSelectParticipant} user={user} />
      </Section>

      <Section id="activity">
        <DailyActivityChart days={dailyTotals} participantCount={kpis.participants} />
      </Section>

      <Section id="participants">
        <ParticipantTable league={league} insights={insights} onSelect={onSelectParticipant} onRemove={onRemoveParticipant} onMessage={onMessageParticipant} user={user} />
      </Section>
    </div>
  )
}

function SectionNav({ active, onJump, orientation }) {
  const isRow = orientation === 'row'
  return (
    <nav aria-label="Dashboard sections" className={isRow ? 'flex gap-1.5 overflow-x-auto px-4 py-2.5' : 'grid gap-0.5'}>
      {DASHBOARD_SECTIONS.map((section) => {
        const isActive = section.id === active
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onJump(section.id)}
            aria-current={isActive ? 'true' : undefined}
            className={
              isRow
                ? `flex-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium ${isActive ? 'bg-[#4169e1] text-white' : `bg-[#232327] [[data-theme=light]_&]:bg-white ${MUTED}`}`
                : `rounded-lg px-3 py-2 text-left text-[14px] transition-colors ${isActive ? 'bg-[#26262a] font-semibold [[data-theme=light]_&]:bg-white ' + STRONG : `font-medium hover:bg-[#1c1c1f] [[data-theme=light]_&]:hover:bg-[#ecebe6] ${MUTED}`}`
            }
          >
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}

// The organizer dashboard as its own full-screen page, like the class space:
// it covers the app's own header, brings its own top bar (back, league,
// where-you-are tabs, export) and a section nav beside a wide, scrolling
// body. Participant drawers still open above it.
export function DashboardPage({ league, insights, user, topNav, onExit, onOpenSettings, onSelectParticipant, onRemoveParticipant, onMessageParticipant }) {
  const scrollRef = useRef(null)
  const [activeSection, setActiveSection] = useState(DASHBOARD_SECTIONS[0].id)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onExit()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [onExit])

  // Scroll-spy: the section nearest the top of the body is the current one.
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return undefined
    const seen = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting)
        const first = DASHBOARD_SECTIONS.find((section) => seen.get(`dash-${section.id}`))
        if (first) setActiveSection(first.id)
      },
      { root, rootMargin: '0px 0px -65% 0px' },
    )
    for (const section of DASHBOARD_SECTIONS) {
      const node = root.querySelector(`#dash-${section.id}`)
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [])

  const jump = (id) => {
    setActiveSection(id)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    scrollRef.current?.querySelector(`#dash-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const exportCsv = () => {
    const blob = new Blob([buildInsightsCsv(league, insights)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${league.name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'league'}-standings.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`fixed inset-0 z-[35] flex flex-col ${PAGE}`} role="dialog" aria-modal="true" aria-label={`${league.name} organizer dashboard`}>
      <header className={`flex h-14 flex-none items-center gap-3 border-b px-4 ${TOPBAR} ${BAR_LINE}`}>
        <button
          type="button"
          onClick={onExit}
          aria-label="Back to the league page"
          title="Back to the league page (Esc)"
          className={`grid size-9 flex-none place-items-center rounded-lg hover:bg-[#26262a] [[data-theme=light]_&]:hover:bg-[#f0eee9] ${STRONG}`}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-lg bg-[#26262a] text-[16px] [[data-theme=light]_&]:bg-[#f0f0ee]">{league.emoji ?? '👥'}</span>
          <span className="grid min-w-0 leading-tight">
            <strong className={`truncate text-[15px] font-semibold ${STRONG}`}>{league.name}</strong>
            <span className={`truncate text-[11px] ${FAINT}`}>Organizer dashboard · Day {insights.today + 1} of {insights.seasonDays}</span>
          </span>
        </div>
        <div className="ml-2 hidden self-stretch min-[820px]:block [&>nav]:h-full [&>nav]:border-b-0">{topNav}</div>
        <span className="flex-1" />
        {onOpenSettings && (
          <button type="button" onClick={onOpenSettings} className="hidden text-[13px] font-medium text-[#89baff] hover:underline min-[560px]:block [[data-theme=light]_&]:text-[#3d77eb]">
            League settings
          </button>
        )}
        <ActionButton variant="neutral" className="min-h-9 flex-none whitespace-nowrap px-3.5 text-[13px] font-medium" onClick={exportCsv} aria-label="Export CSV">
          Export<span className="max-[560px]:hidden"> CSV</span>
        </ActionButton>
      </header>

      <div className={`flex-none border-b min-[1024px]:hidden ${TOPBAR} ${BAR_LINE}`}>
        <SectionNav active={activeSection} onJump={jump} orientation="row" />
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className={`hidden w-56 flex-none overflow-y-auto border-r p-4 min-[1024px]:block ${BAR_LINE}`}>
          <span className={`mb-2 block px-3 ${'text-[11px] font-bold uppercase tracking-[.06em]'} ${FAINT}`}>On this page</span>
          <SectionNav active={activeSection} onJump={jump} orientation="column" />
        </aside>
        <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1320px] px-8 pb-16 pt-8 max-[1024px]:px-6 max-[680px]:px-4 max-[680px]:pt-5">
            <LeagueDashboard
              league={league}
              insights={insights}
              user={user}
              onSelectParticipant={onSelectParticipant}
              onRemoveParticipant={onRemoveParticipant}
              onMessageParticipant={onMessageParticipant}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
