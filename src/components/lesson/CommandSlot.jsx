export function CommandSlot({ index, label }) {
  return (
    <div className={label ? 'command-slot is-filled' : 'command-slot'}>
      <span className="command-slot-index">{index}</span>
      <span className="command-slot-value">{label}</span>
    </div>
  )
}
