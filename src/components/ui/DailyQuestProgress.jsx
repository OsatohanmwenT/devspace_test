import { useEffect, useState } from 'react'
import { GameIcon } from './GameIcon'
import { BoltIcon, CheckIcon } from './icons'

function BookGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function FlameGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8.6 1.2c.3 2.1-.9 3.2-2 4.4C5.4 6.9 4 8.3 4 10.4 4 12.9 5.8 14.8 8 14.8s4-1.9 4-4.3c0-1.9-1-3.2-1.9-4.1-.2 1-.7 1.7-1.4 2 .6-2.6-.3-5.4-.1-7.2z" fill="currentColor" />
    </svg>
  )
}

const QUEST_LOOK = {
  xp: { tone: '245 180 0', icon: <BoltIcon className="size-5" /> },
  lesson: { tone: '59 130 246', icon: <BookGlyph className="size-5" /> },
  practice: { tone: '249 115 22', icon: <FlameGlyph className="size-5" /> },
}

const percent = (quest) => (quest ? Math.round((quest.current / quest.target) * 100) : 0)

// Today's quests as progress bars that fill from where they stood before this
// lesson/practice to where they are now — the Duolingo "quest progress" beat
// that shows people the quests exist at the moment they move them.
export function DailyQuestProgress({ before, after, className = '' }) {
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <ul className={`m-0 grid w-full list-none gap-3 p-0 ${className}`} aria-label="Daily quests">
      {after.map((quest, index) => {
        const look = QUEST_LOOK[quest.id] ?? QUEST_LOOK.xp
        const previous = before?.[index]
        const moved = quest.current > (previous?.current ?? 0)
        const width = filled ? percent(quest) : percent(previous)
        return (
          <li
            key={quest.id}
            className="flex items-center gap-3.5 rounded-2xl border border-[#333336] bg-[#232323] px-4 py-3 text-left [[data-theme=light]_&]:border-[#ececea] [[data-theme=light]_&]:bg-[#fafaf8]"
          >
            <span
              className="grid size-10 flex-none place-items-center rounded-xl"
              style={{ background: `rgb(${look.tone} / 0.16)`, color: `rgb(${look.tone})` }}
            >
              {look.icon}
            </span>
            <span className="grid min-w-0 flex-1 gap-1.5">
              <span className="flex items-center justify-between gap-3">
                <strong className={`truncate text-[15px] font-semibold ${quest.done ? 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800' : 'text-[#d4d4d6] [[data-theme=light]_&]:text-neutral-700'}`}>
                  {quest.label}
                </strong>
                <span className={`flex-none text-[13px] font-bold tabular-nums ${moved ? '' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#8a8a86]'}`} style={moved ? { color: `rgb(${look.tone})` } : undefined}>
                  {quest.current}/{quest.target}
                </span>
              </span>
              <span className="relative h-2.5 overflow-hidden rounded-full bg-[#3a3a3d] [[data-theme=light]_&]:bg-[#e8e8e4]" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: `${width}%`, background: quest.done ? '#22c55e' : `rgb(${look.tone})`, transitionDelay: `${250 + index * 150}ms` }}
                />
              </span>
            </span>
            {/* Each quest ends in its reward chest, greyed out until it's earned
                and marked with a check once it is. */}
            <span className="relative flex-none" role="img" aria-label={quest.done ? 'done' : 'not done yet'}>
              <GameIcon
                name="treasure-chest"
                className={`size-9 transition-[filter,opacity] duration-500 ${quest.done ? '' : 'opacity-45 grayscale'}`}
              />
              {quest.done && (
                <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border-2 border-[#232323] bg-[#22c55e] text-white [[data-theme=light]_&]:border-[#fafaf8]">
                  <CheckIcon className="size-2.5" />
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
