import { useEffect, useState } from 'react'
import { BoltIcon, CheckIcon, LockIcon } from '../ui/icons'
import { ActionButton } from '../ui/ActionButton'
import { Drawer } from '../ui/Drawer'
import { DevyMood } from '../ui/DevyMood'
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
      ? 'border-amber-400 bg-amber-400/10 text-amber-300 [[data-theme=light]_&]:bg-amber-50 [[data-theme=light]_&]:text-amber-700'
      : 'border-[#404040] bg-[#1f1f1f] text-[#7d7d80] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-[#9a9a9d]'

  return (
    <span className={`relative z-[1] grid size-9 flex-none place-items-center rounded-lg border text-[11px] font-bold ${tone}`} aria-hidden="true">
      {label}
    </span>
  )
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// The current week, Monday first, read off the same activity list as the
// 30-day history so both views always agree on which days counted.
function getWeek(activity, today) {
  const activeKeys = new Set(activity.filter((day) => day.isActive).map((day) => day.key))
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const monday = new Date(start)
  monday.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return WEEKDAYS.map((letter, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const key = date.toDateString()
    const state = activeKeys.has(key) ? 'done' : key === start.toDateString() ? 'today' : date > start ? 'future' : 'missed'
    return { key, letter, state }
  })
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
  onKeepStreak,
  onClose,
}) {
  const [clock, setClock] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  const activity = getStreakHistory(currentStreak, lastActiveDate, activeDates, clock)
  const week = getWeek(activity, clock)
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
      const previousDays = STREAK_MILESTONES[STREAK_MILESTONES.indexOf(tier) - 1]?.days ?? 0

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
        progress: isNext ? Math.max(0, (currentStreak - previousDays) / (tier.days - previousDays)) : null,
      }
    }),
  ]

  // How far the timeline's spine should paint amber before fading to grey —
  // the last earned step's position, not just a count, so a fresh 0-day
  // streak doesn't show a sliver of "progress" it hasn't made.
  const lastEarnedIndex = steps.reduce((last, step, index) => (step.state === 'earned' ? index : last), -1)
  const timelineProgress = lastEarnedIndex <= 0 ? 0 : (lastEarnedIndex / (steps.length - 1)) * 100

  return (
    <Drawer id="streak-journey-dialog" title="Streak journey" onClose={onClose} labelledBy="streak-journey-title">
      <div className="grid gap-7">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-12 flex-none place-items-center rounded-2xl bg-amber-400/15 text-amber-400 [[data-theme=light]_&]:bg-amber-100 [[data-theme=light]_&]:text-amber-500" aria-hidden="true">
              <BoltIcon className="size-6" />
            </span>
            <span className="grid">
              <strong className="font-rethink-sans text-[40px] leading-none font-semibold tracking-[-.04em] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                {currentStreak}
              </strong>
              <span className="text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
                day streak
              </span>
            </span>
            {/* The status line below already says whether today is covered, but
                it says it in 13px grey. Devy says it at a glance. */}
            {(isAtRisk || isActiveToday) && (
              <DevyMood
                mood={isAtRisk ? 'annoyed' : 'celebrating'}
                className="ml-auto -my-2 size-[72px] flex-none"
              />
            )}
          </div>
          <p className={`m-0 text-[13px] ${status.className}`} role="status">{status.text}</p>
          {lastProtection && (
            <p className="m-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
              {lastProtection === 'shield' ? 'A Premium shield' : 'An earned restore'} covered your last missed day.
            </p>
          )}
          {!isActiveToday && onKeepStreak && (
            <ActionButton variant="primary" className="mt-1 min-h-11 w-full text-[15px] font-semibold" onClick={onKeepStreak}>
              {currentStreak > 0 ? 'Keep my streak' : 'Start my streak'}
            </ActionButton>
          )}
        </div>

        <ol className="m-0 grid list-none grid-cols-7 gap-2 p-0" aria-label="This week">
          {week.map((day) => (
            <li
              key={day.key}
              className="grid justify-items-center gap-1.5"
              aria-label={`${day.key}: ${day.state === 'done' ? 'active' : day.state === 'today' ? 'today, not yet active' : day.state === 'future' ? 'upcoming' : 'no activity'}`}
              aria-current={day.state === 'today' ? 'date' : undefined}
            >
              <span className={`text-[11px] font-semibold ${day.state === 'today' ? 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#9a9a9d]'}`}>
                {day.letter}
              </span>
              <span
                className={`grid size-9 place-items-center rounded-full ${
                  day.state === 'done'
                    ? 'bg-amber-400 text-amber-950'
                    : day.state === 'today'
                      ? 'border-2 border-dashed border-amber-400'
                      : day.state === 'future'
                        ? 'border border-[#333336] [[data-theme=light]_&]:border-[#ececea]'
                        : 'bg-[#262626] [[data-theme=light]_&]:bg-[#f2f2f0]'
                }`}
                aria-hidden="true"
              >
                {day.state === 'done' && <CheckIcon className="size-3.5" />}
              </span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Longest streak', value: `${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}` },
            { label: 'Restores left', value: restoresLeft },
          ].map((stat) => (
            <div key={stat.label} className="grid gap-0.5 rounded-xl bg-[#262626] px-3.5 py-3 [[data-theme=light]_&]:bg-[#f5f5f3]">
              <strong className="text-[17px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{stat.value}</strong>
              <span className="text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <span className="text-[12px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Last 30 days</span>
          <ol className="m-0 grid w-full list-none grid-cols-[repeat(15,minmax(0,1fr))] gap-1 p-0" aria-label="Activity over the last 30 days">
            {activity.map((day) => (
              <li
                key={day.key}
                className={`aspect-square rounded-[4px] ${
                  day.isActive
                    ? 'bg-amber-400'
                    : day.isToday
                      ? 'border border-dashed border-[#7d7d80] [[data-theme=light]_&]:border-[#9a9a9d]'
                      : 'bg-[#262626] [[data-theme=light]_&]:bg-[#f2f2f0]'
                }`}
                aria-label={`${day.key}: ${day.isActive ? 'active' : day.isToday ? 'today, not yet active' : 'no activity'}`}
                aria-current={day.isToday ? 'date' : undefined}
              />
            ))}
          </ol>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-3 text-[14px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
            Milestones and rewards
            <span className="h-px flex-1 bg-[#404040] [[data-theme=light]_&]:bg-[#e1e1e1]" />
            <InfoTooltip label="How milestones work" align="end">
              Every milestone earns one permanent streak restore, so a single slip doesn&apos;t erase what you&apos;ve built.
            </InfoTooltip>
          </div>

          <ol className="relative grid list-none gap-4 m-0 p-0 before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-px before:bg-[#404040] [[data-theme=light]_&]:before:bg-[#e1e1e1]">
            <div
              aria-hidden="true"
              className="absolute left-[17px] top-4 bottom-4 w-px"
              style={{ background: `linear-gradient(to bottom, #fbbf24 ${timelineProgress}%, transparent ${timelineProgress}%)` }}
            />
            {steps.map((step) => (
              <li key={step.key} className="flex items-start gap-3">
                <DayChip label={step.label} state={step.state} />
                <div className="grid min-w-0 gap-0.5 pt-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className={`flex items-center gap-1.5 text-sm font-semibold ${step.state === 'locked' ? 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]' : 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'}`}>
                      {step.state === 'locked' && <LockIcon className="size-3 flex-none" aria-hidden="true" />}
                      {step.title}
                      {step.state === 'earned' && <CheckIcon className="size-3.5 flex-none text-amber-400" aria-label="Earned" />}
                    </span>
                    {step.reward && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        step.state === 'earned'
                          ? 'bg-amber-400/15 text-amber-300 [[data-theme=light]_&]:bg-amber-100 [[data-theme=light]_&]:text-amber-800'
                          : step.state === 'next'
                            ? 'border border-amber-400/50 text-amber-300 [[data-theme=light]_&]:text-amber-700'
                            : 'bg-[#262626] text-[#9a9a9d] [[data-theme=light]_&]:bg-[#f2f2f0] [[data-theme=light]_&]:text-[#686968]'
                      }`}>
                        {step.reward}
                      </span>
                    )}
                  </span>
                  {step.detail && (
                    <span className="text-[13px] leading-[1.45] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{step.detail}</span>
                  )}
                  {step.progress != null && (
                    <span
                      className="mt-1.5 block h-1.5 w-40 overflow-hidden rounded-full bg-[#333336] [[data-theme=light]_&]:bg-[#ececea]"
                      role="progressbar"
                      aria-label={`Progress to ${step.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(step.progress * 100)}
                    >
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${Math.max(6, step.progress * 100)}%` }} />
                    </span>
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
