import { CheckIcon } from '../ui/icons'

export function PerkList({ perks, highlightPerk }) {
  return (
    <ul className="grid gap-2.5 m-0 p-0 list-none">
      {perks.map((perk) => (
        <li
          key={perk.id}
          id={`perk-${perk.id}`}
          className={`flex items-start gap-2.5 rounded-xl p-2.5 ${perk.id === highlightPerk ? 'bg-[rgba(111,102,236,0.14)] ring-1 ring-[#6f66ec]' : ''}`}
        >
          <CheckIcon className="w-4 h-4 mt-0.5 flex-none text-[#04adc0]" />
          <div className="grid gap-0.5">
            <strong className="text-sm font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{perk.title}</strong>
            <span className="text-xs leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{perk.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
