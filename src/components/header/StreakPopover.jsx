import { BoltIcon, CheckIcon } from '../ui/icons'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F']

export function StreakPopover({ currentStreak, bestStreak }) {
  const todayIndex = (new Date().getDay() + 6) % 7

  return (
    <div
      className="absolute z-[6] top-[calc(100%+10px)] right-0 grid gap-4 w-[300px] p-5 border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-[18px] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-left"
      role="dialog"
      aria-label="Streak details"
    >
      <div className="flex justify-between gap-1" role="img" aria-label="Weekly streak activity">
        {DAY_LABELS.map((label, index) => {
          const isToday = index === todayIndex
          const isComplete = isToday && currentStreak > 0
          return (
            <div
              className={
                isToday
                  ? 'grid justify-items-center gap-1.5 px-1.5 py-1 rounded-[10px] border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#24242d] [[data-theme=light]_&]:bg-[#e5e6ea]'
                  : 'grid justify-items-center gap-1.5 px-1.5 py-1 rounded-[10px]'
              }
              key={index}
            >
              <span
                className={
                  isComplete
                    ? 'grid place-items-center w-[34px] h-[34px] border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-full bg-[#f5a623] text-white'
                    : 'grid place-items-center w-[34px] h-[34px] border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] rounded-full bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
                }
              >
                {isComplete && <CheckIcon className="w-4 h-4" />}
              </span>
              <small className={isToday ? 'text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[11px] font-semibold' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] text-[11px] font-semibold'}>{label}</small>
            </div>
          )
        })}
      </div>
      <ul className="grid gap-2.5 m-0 p-0 list-none">
        <li className="flex items-center gap-2 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[13px] leading-[1.4]">
          <BoltIcon className="w-4 h-4 flex-none text-[#f5a623]" />
          Your current streak is {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
        </li>
        <li className="flex items-center gap-2 text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[13px] leading-[1.4]">
          <BoltIcon className="w-4 h-4 flex-none text-[#888df2]" />
          Your best streak is {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
        </li>
      </ul>
    </div>
  )
}

