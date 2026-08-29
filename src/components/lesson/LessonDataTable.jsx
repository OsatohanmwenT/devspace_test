import { useState } from 'react'

const CELL_BASE = 'border border-[#333336] [[data-theme=light]_&]:border-[#e1e1e1] px-3 py-2 text-[13px] leading-[1.4] font-jetbrains-mono whitespace-nowrap'

function cellKey(rowId, columnKey) {
  return `${rowId}:${columnKey}`
}

// One shared table primitive for both the Explain screens (self-contained
// hover/click-to-highlight, purely visual — variant="explore") and the
// Practice screens (fully controlled selection/markers driven by the parent's
// task state — variant="select"). Both read the same Northstar-style
// {columns, rows} shape so the dataset only needs to be authored once per
// lesson and every screen that shows it stays visually consistent.
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
}) {
  const [exploreTarget, setExploreTarget] = useState(null)
  const target = variant === 'explore' ? exploreTarget : selected

  const exploreRow = (id) => setExploreTarget((current) => (current?.type === 'row' && current.rowId === id ? null : { type: 'row', rowId: id }))
  const exploreColumn = (key) => setExploreTarget((current) => (current?.type === 'column' && current.columnKey === key ? null : { type: 'column', columnKey: key }))
  const exploreCell = (id, key) => setExploreTarget((current) => (current?.type === 'cell' && current.rowId === id && current.columnKey === key ? null : { type: 'cell', rowId: id, columnKey: key }))

  const isRowActive = (id) => target?.rowId === id && (target.type === 'row' || target.type === 'cell')
  const isColumnActive = (key) => target?.columnKey === key && (target.type === 'column' || target.type === 'cell')
  const isCellActive = (id, key) => target?.type === 'cell' && target.rowId === id && target.columnKey === key

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
              return (
                <tr key={id} className={isRowActive(id) ? 'bg-[#1d2f5d]/40 [[data-theme=light]_&]:bg-[#eff4ff]' : ''}>
                  {columns.map((column, columnIndex) => {
                    const marker = markers[cellKey(id, column.key)]
                    return (
                      <td
                        key={column.key}
                        onClick={
                          columnIndex === 0 && variant !== 'explore' && onSelectRow ? () => onSelectRow(id)
                            : variant === 'explore' && columnIndex === 0 ? () => exploreRow(id)
                              : variant === 'explore' ? () => exploreCell(id, column.key)
                                : onSelectCell ? () => onSelectCell(id, column.key) : undefined
                        }
                        className={`${CELL_BASE} text-[#d7d7da] [[data-theme=light]_&]:text-[#454545] ${(onSelectRow || onSelectCell || variant === 'explore') ? 'cursor-pointer' : ''} ${isCellActive(id, column.key) ? 'bg-[#2f6fed]/25 outline outline-2 -outline-offset-2 outline-[#6699ec]' : ''} ${marker === 'found' ? 'bg-[#16281f] text-[#6ee7a8] [[data-theme=light]_&]:bg-[#e7f6ee] [[data-theme=light]_&]:text-[#197a4b]' : ''} ${marker === 'wrong-flash' ? 'bg-[#2a1817]' : ''}`}
                      >
                        {row[column.key]}
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
