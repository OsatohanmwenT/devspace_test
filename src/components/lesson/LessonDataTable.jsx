import { useState } from 'react'

const CELL_BASE = 'border border-[#333336] [[data-theme=light]_&]:border-[#e1e1e1] px-3 py-2 text-[13px] leading-[1.4] font-jetbrains-mono whitespace-nowrap'

function cellKey(rowId, columnKey) {
  return `${rowId}:${columnKey}`
}

const ROW_MARKER_BG = {
  found: 'bg-[#16281f] [[data-theme=light]_&]:bg-[#e7f6ee]',
  wrong: 'bg-[#2a1817] [[data-theme=light]_&]:bg-[#fdecea]',
  missed: 'bg-[#332612] [[data-theme=light]_&]:bg-[#fdf3dc]',
}

const ROW_MARKER_DOT = {
  found: 'border-[#04adc0] bg-[#04adc0] text-[#0b1f20]',
  wrong: 'border-[#ff676d] bg-[#ff676d] text-[#2a1010]',
  missed: 'border-[#e0a53a] bg-transparent text-[#e0a53a]',
}

function RowMarkerDot({ marker, selected }) {
  if (!marker && !selected) return <span className="inline-block size-4 flex-none rounded-[4px] border border-dashed border-[#515151] [[data-theme=light]_&]:border-[#d5d5d5]" aria-hidden="true" />
  const className = marker ? ROW_MARKER_DOT[marker] : 'border-[#6699ec] bg-[#6699ec] text-white'
  const glyph = marker === 'found' ? '✓' : marker === 'wrong' ? '✕' : marker === 'missed' ? '!' : '✓'
  return (
    <span className={`grid size-4 flex-none place-items-center rounded-[4px] border text-[10px] font-bold leading-none ${className}`} aria-hidden="true">
      {glyph}
    </span>
  )
}

// One shared table primitive across three jobs, all reading the same
// Northstar-style {columns, rows} shape so a dataset only needs to be
// authored once per lesson:
//  - "explore" — self-contained hover/click-to-highlight on Explain screens.
//  - "select" — single-target row/column/cell selection, fully controlled by
//    the parent's task state (LessonPractice's table-tasks/issue-spotter
//    modes — "click the row with the longest delivery time").
//  - "select-rows" — multi-row selection, also parent-controlled (Practice's
//    SQL table-select questions — "click every row this query returns").
export function LessonDataTable({
  columns,
  rows,
  rowKey = 'order_id',
  variant = 'explore',
  caption,
  selected,
  markers = {},
  onSelectRow,
  onSelectColumn,
  onSelectCell,
  selectedRowIds = [],
  rowMarkers = {},
  disabled = false,
  onToggleRow,
}) {
  const [exploreTarget, setExploreTarget] = useState(null)
  const target = variant === 'explore' ? exploreTarget : selected

  const exploreRow = (id) => setExploreTarget((current) => (current?.type === 'row' && current.rowId === id ? null : { type: 'row', rowId: id }))
  const exploreColumn = (key) => setExploreTarget((current) => (current?.type === 'column' && current.columnKey === key ? null : { type: 'column', columnKey: key }))
  const exploreCell = (id, key) => setExploreTarget((current) => (current?.type === 'cell' && current.rowId === id && current.columnKey === key ? null : { type: 'cell', rowId: id, columnKey: key }))

  const isRowSelectedMulti = (id) => selectedRowIds.includes(id)
  const isRowActive = (id) => variant === 'select-rows'
    ? isRowSelectedMulti(id)
    : target?.rowId === id && (target.type === 'row' || target.type === 'cell')
  const isColumnActive = (key) => variant !== 'select-rows' && target?.columnKey === key && (target.type === 'column' || target.type === 'cell')
  const isCellActive = (id, key) => variant !== 'select-rows' && target?.type === 'cell' && target.rowId === id && target.columnKey === key

  const exploreCaption = variant === 'explore' && target
    ? target.type === 'row'
      ? 'One observation — one recorded order.'
      : target.type === 'column'
        ? 'One variable — one thing recorded for every order.'
        : `For order ${target.rowId}, ${target.columnKey} = ${rows.find((row) => row[rowKey] === target.rowId)?.[target.columnKey]}.`
    : null

  return (
    <div className="mt-3.5">
      <div className="overflow-x-auto rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1a1a1a] [[data-theme=light]_&]:bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  onClick={variant === 'explore' ? () => exploreColumn(column.key) : onSelectColumn ? () => onSelectColumn(column.key) : undefined}
                  className={`${CELL_BASE} text-left font-semibold text-[#e4e4e6] [[data-theme=light]_&]:text-neutral-700 ${variant === 'explore' || onSelectColumn ? 'cursor-pointer' : ''} ${isColumnActive(column.key) ? 'bg-[#26344f] [[data-theme=light]_&]:bg-[#e4eaf4] text-[#a9c4ff] [[data-theme=light]_&]:text-[#2563eb]' : 'bg-[#232326] [[data-theme=light]_&]:bg-[#f5f5f5]'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = row[rowKey]
              const rowMarker = variant === 'select-rows' ? rowMarkers[id] : undefined
              const rowActiveClass = isRowActive(id) && !rowMarker ? 'bg-[#1d2f5d]/40 [[data-theme=light]_&]:bg-[#eff4ff]' : ''
              const rowMarkerClass = rowMarker ? ROW_MARKER_BG[rowMarker] : ''
              const canToggleRow = variant === 'select-rows' && !disabled && onToggleRow

              return (
                <tr key={id} className={rowMarkerClass || rowActiveClass}>
                  {columns.map((column, columnIndex) => {
                    const cellMarker = variant !== 'select-rows' ? markers[cellKey(id, column.key)] : undefined
                    return (
                      <td
                        key={column.key}
                        onClick={
                          canToggleRow ? () => onToggleRow(id)
                            : columnIndex === 0 && variant !== 'explore' && variant !== 'select-rows' && onSelectRow ? () => onSelectRow(id)
                              : variant === 'explore' && columnIndex === 0 ? () => exploreRow(id)
                                : variant === 'explore' ? () => exploreCell(id, column.key)
                                  : variant !== 'select-rows' && onSelectCell ? () => onSelectCell(id, column.key) : undefined
                        }
                        aria-selected={variant === 'select-rows' ? isRowSelectedMulti(id) : undefined}
                        className={`${CELL_BASE} text-[#d7d7da] [[data-theme=light]_&]:text-[#454545] ${(onSelectRow || onSelectCell || variant === 'explore' || canToggleRow) ? 'cursor-pointer' : ''} ${isCellActive(id, column.key) ? 'bg-[#2f6fed]/25 outline outline-2 -outline-offset-2 outline-[#6699ec]' : ''} ${cellMarker === 'found' ? 'bg-[#16281f] text-[#6ee7a8] [[data-theme=light]_&]:bg-[#e7f6ee] [[data-theme=light]_&]:text-[#197a4b]' : ''} ${cellMarker === 'wrong-flash' ? 'bg-[#2a1817]' : ''}`}
                      >
                        {variant === 'select-rows' && columnIndex === 0
                          ? <span className="inline-flex items-center gap-2"><RowMarkerDot marker={rowMarker} selected={isRowSelectedMulti(id)} />{row[column.key]}</span>
                          : row[column.key]}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(exploreCaption || caption) && (
        <p className="m-0 mt-2 text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{exploreCaption || caption}</p>
      )}
    </div>
  )
}
