import { DevyMood } from '../ui/DevyMood'
import { BoltIcon } from '../ui/icons'
import { WEEK_LENGTH } from '../../lib/streak'

export function StreakCard({ streakDays, streakAtRisk, streakMessage, streakWeek, onViewStreakDetail, className = '' }) {
  return (
    <section className={`flex flex-col border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px] ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-rethink-sans text-[38px] font-medium">{streakDays}</span>
          <BoltIcon className="w-[34px] h-[34px] p-2 rounded-full bg-[#f5a623] text-white shadow-[0_0_0_3px_rgba(245,166,35,0.18)]" />
        </div>
        <button className="min-w-9 min-h-8 p-1 text-[#7d7d80] [[data-theme=light]_&]:text-[#737371] tracking-[2px] border-0 bg-transparent focus-visible:rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72]" onClick={onViewStreakDetail} aria-label="View streak details">•••</button>
      </div>
      <div className="mt-3.5 mb-4 flex items-center gap-3">
        {streakAtRisk && <DevyMood mood="annoyed" className="size-[52px] flex-none max-[900px]:size-11" />}
        <p className="m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">
          {streakMessage.emphasis && <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 font-medium">{streakMessage.emphasis} </strong>}
          {streakMessage.text}
        </p>
      </div>
      <div className="mt-auto flex justify-between gap-1.5" role="img" aria-label={`Activity for the last ${WEEK_LENGTH} days: ${streakWeek.filter((day) => day.isActive).length} active`}>
        {streakWeek.map(({ key, label, isActive }) => (
          <div
            className={
              isActive
                ? 'flex flex-1 min-w-0 flex-col items-center gap-[5px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
                : 'flex flex-1 min-w-0 flex-col items-center gap-[5px] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
            }
            key={key}
          >
            <span
              className={
              isActive
                ? 'home-streak-day grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[#f5a623] bg-[#f5a623] text-white shadow-[0_0_0_3px_rgba(245,166,35,0.18)]'
                  : 'grid place-items-center w-full max-w-10 aspect-square rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#eeeeeb] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]'
              }
            >
              <BoltIcon className="w-[18px] h-[18px]" />
            </span>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
