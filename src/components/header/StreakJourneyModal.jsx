import { useEffect, useState } from 'react'
import { CheckIcon, LockIcon } from '../ui/icons'
import { Drawer } from '../ui/Drawer'
import { InfoTooltip } from '../ui/InfoTooltip'
import { getStreakHistory, getTimeUntilMidnight, STREAK_MILESTONES } from '../../lib/streak'

// The journey is a side panel rather than a full modal for the same reason the
// cheatsheet is: it's something you consult, not a destination. Keeping the page
// behind it visible is what stops a streak check from feeling like a detour.
//
// Everything here is deliberately low-contrast except one thing at a time. The
// earlier version painted the green "safe" banner, an indigo next-reward block,
// amber grid cells and a bordered card per milestone all at once, so nothing
// read as more important than anything else.

// The day number is the whole point of the chip — it answers "when do I get
// this". A locked step keeps its number and just recedes; swapping it for a
// padlock would hide the schedule the timeline exists to show.
function DayChip({ label, state }) {
  const tone = state === 'earned'
    ? 'border-amber-400 bg-amber-400 text-amber-950'
    : state === 'next'
      ? 'border-[#6f66ec] bg-[#6f66ec] text-white'
      : 'border-[#404040] bg-[#1f1f1f] text-[#7d7d80] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#9a9a9d]'

  return (
    <span className={`relative z-[1] grid size-9 flex-none place-items-center rounded-lg border text-[11px] font-bold ${tone}`} aria-hidden="true">
      {label}
    </span>
  )
}

export function StreakJourneyModal({
  currentStreak,
  longestStreak,
  activeDates,
  restoresLeft,
  earnedMilestones,
  lastActiveDate,
  isActiveToday,
  lastProtection,
  onClose,
}) {
  const [clock, setClock] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  const activity = getStreakHistory(currentStreak, lastActiveDate, activeDates, clock)
  const nextMilestone = STREAK_MILESTONES.find((tier) => tier.days > currentStreak)
  const isAtRisk = currentStreak > 0 && !isActiveToday

  const status = isAtRisk
    ? { text: `${getTimeUntilMidnight(clock)} left to keep your streak`, className: 'text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]' }
    : isActiveToday
      ? { text: "You're covered for today — come back tomorrow.", className: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' }
      : { text: 'Finish a lesson or practice round to begin.', className: 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' }

  // `0d` anchors the timeline so a learner with no streak still sees where they
  // are on it, rather than a list that starts at a milestone they can't reach yet.
  const steps = [
    {
      key: 'start',
      label: '0d',
      title: 'Start your streak',
      reward: null,
      detail: currentStreak > 0 ? null : 'Any lesson or practice round counts.',
      state: currentStreak > 0 ? 'earned' : 'next',
    },
    ...STREAK_MILESTONES.map((tier) => {
      const isEarned = earnedMilestones.includes(tier.days)
      const isNext = tier.days === nextMilestone?.days
      const remaining = tier.days - currentStreak

      return {
        key: tier.days,
        label: `${tier.days}d`,
        title: tier.label,
        reward: `Streak restore ×${tier.restores}`,
        detail: isEarned
          ? 'Earned — covers a missed day automatically.'
          : isNext
            ? `${remaining} more ${remaining === 1 ? 'day' : 'days'} to unlock.`
            : null,
        state: isEarned ? 'earned' : isNext ? 'next' : 'locked',
      }
    }),
  ]

  return (
    <Drawer id="streak-journey-dialog" title="Streak journey" onClose={onClose} labelledBy="streak-journey-title">
      <div className="grid gap-7">
        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <strong className="font-['Rethink_Sans',Arial,sans-serif] text-[44px] leading-none font-medium tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">
              {currentStreak}
            </strong>
            <span className="text-[11px] font-bold uppercase leading-[1.15] tracking-[.08em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              Day<br />streak
            </span>
          </div>
          <p className={`m-0 text-[13px] ${status.className}`} role="status">{status.text}</p>
          {lastProtection && (
            <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              {lastProtection === 'shield' ? 'A Premium shield' : 'An earned restore'} covered your last missed day.
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <ol className="grid w-full list-none grid-cols-10 gap-1.5 m-0 p-0" aria-label="Activity over the last 30 days">
            {activity.map((day) => (
              <li
                key={day.key}
                className={
                  day.isActive
                    ? 'grid aspect-square place-items-center rounded-md bg-amber-400 text-amber-950'
                    : day.isToday
                      ? 'grid aspect-square place-items-center rounded-md border border-dashed border-[#7d7d80] [[data-theme=light]_&]:border-[#9a9a9d]'
                      : 'aspect-square rounded-md bg-[#262626] [[data-theme=light]_&]:bg-[#f2f2f0]'
                }
                aria-label={`${day.key}: ${day.isActive ? 'active' : day.isToday ? 'today, not yet active' : 'no activity'}`}
                aria-current={day.isToday ? 'date' : undefined}
              >
                {day.isActive && <CheckIcon className="size-3" />}
              </li>
            ))}
          </ol>
          <div className="flex justify-between gap-3 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            <span>Longest streak: <strong className="font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{longestStreak}</strong></span>
            <span>Restores left: <strong className="font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">{restoresLeft}</strong></span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.08em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Milestones &amp; rewards
            <span className="h-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#e1e1e1]" />
            <InfoTooltip label="How milestones work" align="end">
              Every milestone earns one permanent streak restore, so a single slip doesn&apos;t erase what you&apos;ve built.
            </InfoTooltip>
          </div>

          <ol className="relative grid list-none gap-4 m-0 p-0 before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-px before:bg-[#404040] [[data-theme=light]_&]:before:bg-[#e1e1e1]">
            {steps.map((step) => (
              <li key={step.key} className="flex items-start gap-3">
                <DayChip label={step.label} state={step.state} />
                <div className="grid min-w-0 gap-0.5 pt-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${step.state === 'locked' ? 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' : 'text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]'}`}>
                      {step.state === 'locked' && <LockIcon className="size-3 flex-none" aria-hidden="true" />}
                      {step.title}
                      {step.state === 'earned' && <CheckIcon className="size-3.5 flex-none text-amber-400" aria-label="Earned" />}
                    </span>
                    {step.reward && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        step.state === 'earned'
                          ? 'bg-amber-400/15 text-amber-300 [[data-theme=light]_&]:bg-amber-100 [[data-theme=light]_&]:text-amber-800'
                          : step.state === 'next'
                            ? 'bg-[#6f66ec]/20 text-[#b8b3ff] [[data-theme=light]_&]:bg-[#f1efff] [[data-theme=light]_&]:text-[#513deb]'
                            : 'bg-[#262626] text-[#9a9a9d] [[data-theme=light]_&]:bg-[#f2f2f0] [[data-theme=light]_&]:text-[#686968]'
                      }`}>
                        {step.reward}
                      </span>
                    )}
                  </span>
                  {step.detail && (
                    <span className="text-[13px] leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{step.detail}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Drawer>
  )
}
