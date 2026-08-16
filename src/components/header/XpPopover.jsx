const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function XpPopover({ earnedToday = 0, xpGoal = 50 }) {
  const jsDay = new Date().getDay()
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1
  const goalPercent = Math.min(100, Math.round((earnedToday / Math.max(1, xpGoal)) * 100))

  return (
    <div
      className="absolute z-[6] top-[calc(100%+10px)] right-0 grid gap-3.5 w-[300px] p-5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[18px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[0_8px_24px_rgba(20,20,20,0.10)] text-left"
      role="dialog"
      aria-label="Daily and weekly XP activity"
    >
      <div>
        <h2 className="m-0 text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-lg font-semibold">
          You earned <strong className="text-[#6699ec]">{earnedToday} XP</strong> today!
        </h2>
        <div className="mt-2 flex items-center justify-between text-xs text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          <span>Daily goal: {xpGoal} XP</span>
          <span className="font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{goalPercent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#eeeeeb]">
          <div className="h-full rounded-full bg-[#6699ec] transition-all duration-300" style={{ width: `${goalPercent}%` }} />
        </div>
      </div>
      <p className="mt-0.5 mb-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-xs">Here’s a look at your weekly activity</p>
      <div className="flex items-end justify-between gap-2" role="img" aria-label="Weekly XP earned">
        {DAY_LABELS.map((label, index) => {
          const isToday = index === todayIndex
          return (
            <div className="grid justify-items-center gap-2 flex-1" key={index}>
              <span className="flex items-end w-2.5 h-[64px] rounded-full overflow-hidden">
                <span
                  className={isToday ? 'block w-full rounded-[inherit] bg-[#6699ec]' : 'block w-full rounded-[inherit] bg-[#24242d] [[data-theme=light]_&]:bg-[#e5e6ea]'}
                  style={{ height: isToday && earnedToday > 0 ? `${Math.max(15, goalPercent)}%` : '10%' }}
                />
              </span>
              <small className={isToday ? 'text-[#6699ec] text-[11px] font-bold' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] text-[11px] font-semibold'}>{label}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

