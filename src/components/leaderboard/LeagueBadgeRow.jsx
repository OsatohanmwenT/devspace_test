export function LeagueBadgeRow({ ladder }) {
  return (
    <ul className="flex gap-3.5 m-0 p-0 list-none overflow-x-auto" aria-label="League progression">
      {ladder.map((tier) => {
        const isUnlocked = tier.state === 'current'
        return (
          <li className="grid justify-items-center gap-1.5 flex-none" key={tier.id}>
            <span
              className={
                isUnlocked
                  ? 'grid place-items-center w-[46px] h-[46px] rounded-full bg-[#6f66ec] text-[#121214] [[data-theme=light]_&]:text-[#fafaf8]'
                  : 'grid place-items-center w-[46px] h-[46px]'
              }
              aria-hidden="true"
            >
              {tier.state === 'locked' && <img src="/assets/leagues-locked.svg" alt="" className="w-full h-full" />}
            </span>
            <small className={isUnlocked ? 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[11px] font-semibold' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] text-[11px]'}>{tier.name}</small>
          </li>
        )
      })}
    </ul>
  )
}

