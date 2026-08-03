export function LeagueHeader({ league }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-[#6f66ec] text-[11px] font-semibold tracking-[.1em] uppercase">League</span>
        <h2 className="mt-1 mb-1.5 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] font-['Space_Grotesk',Arial,sans-serif] text-2xl font-medium tracking-[-.03em]">{league.name}</h2>
        <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">Top {league.promoteCount} advance to the next league</p>
      </div>
      <span className="flex-none border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-full px-3.5 py-1.5 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs font-semibold whitespace-nowrap">{league.daysLeft} days left</span>
    </div>
  )
}

