export function CommandChip({ verb, object, onClick, used }) {
  return (
    <button
      type="button"
      className={used ? 'command-chip is-used' : 'command-chip'}
      onClick={onClick}
      disabled={used}
    >
      <span className="command-chip-verb">{verb}</span> <span className="command-chip-object">{object}</span>
    </button>
  )
}
