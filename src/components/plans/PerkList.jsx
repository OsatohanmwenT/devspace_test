import { CheckIcon } from '../ui/icons'

export function PerkList({ perks, highlightPerk }) {
  return (
    <ul className="grid gap-2.5 m-0 p-0 list-none">
      {perks.map((perk) => (
        <li
          key={perk.id}
          id={`perk-${perk.id}`}
          className={`flex items-start gap-2.5 rounded-[var(--radius-card)] p-2.5 ${perk.id === highlightPerk ? 'bg-[var(--surface-brand-tint)] ring-1 ring-[var(--brand-cta)]' : ''}`}
        >
          <CheckIcon className="w-4 h-4 mt-0.5 flex-none text-[var(--accent-data)]" />
          <div className="grid gap-0.5">
            <strong className="text-sm font-semibold text-[var(--text-primary)] [[data-theme=light]_&]:text-[var(--text-primary)]">{perk.title}</strong>
            <span className="text-xs leading-[1.45] text-[var(--text-secondary)] [[data-theme=light]_&]:text-[var(--text-secondary)]">{perk.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
