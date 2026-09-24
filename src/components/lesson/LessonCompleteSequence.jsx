import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ActionButton } from '../ui/ActionButton'
import { BoltIcon, CheckIcon } from '../ui/icons'
import { DailyQuestProgress } from '../ui/DailyQuestProgress'
import { DevyLottie } from '../ui/DevyLottie'
import { GameIcon } from '../ui/GameIcon'
import { ConceptTransition } from './ConceptTransition'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Counts a number up from `from` once `delay` ms have passed — the reward
// ticks into place rather than just appearing.
function useCountUp(target, { from = 0, delay = 0, duration = 700 } = {}) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : from)

  useEffect(() => {
    if (prefersReducedMotion() || target === from) {
      setValue(target)
      return undefined
    }
    let frame
    const start = performance.now() + delay
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration))
      setValue(Math.round(from + (target - from) * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, from, delay, duration])

  return value
}

function TargetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 9v4l2.5 2M10 3h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// A result card in the Duolingo shape: a coloured frame whose top band names
// the result, around a panel holding the value in the same colour.
function ResultCard({ tone, label, icon, value, index = 0 }) {
  return (
    <div
      data-transition-stat
      className="result-card relative grid overflow-hidden rounded-2xl px-[3px] pb-[3px] text-center"
      style={{
        '--idle-delay': `${1.8 + index * 0.35}s`,
        // A top sheen over the card's colour, a darker lip of the same colour
        // underneath (the raised-tile depth), and a soft glow below that.
        background: `linear-gradient(180deg, rgb(255 255 255 / 0.22), transparent 45%), rgb(${tone})`,
        boxShadow: `0 5px 0 color-mix(in srgb, rgb(${tone}) 68%, #000), 0 18px 28px -16px rgb(${tone} / 0.7)`,
      }}
    >
      <span className="py-1.5 text-[13px] font-bold text-[#1a1a1a] [text-shadow:0_1px_0_rgb(255_255_255_/_0.25)]">{label}</span>
      <span
        className="flex items-center justify-center gap-2 rounded-[13px] bg-[#1f1f1f] px-3 py-3.5 text-[22px] font-bold shadow-[inset_0_3px_0_rgb(0_0_0_/_0.25)] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-[inset_0_3px_0_rgb(0_0_0_/_0.05)] max-[720px]:py-3 max-[720px]:text-[19px]"
        style={{ color: `rgb(${tone})` }}
      >
        {icon}
        {value}
      </span>
    </div>
  )
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function accuracyLabel(percent) {
  if (percent >= 100) return 'Perfect'
  if (percent >= 80) return 'Great'
  if (percent >= 50) return 'Good'
  return 'Accuracy'
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function StreakCelebration({ before, after, dates, onContinue }) {
  const rootRef = useRef(null)
  const count = useCountUp(after, { from: before, delay: 650, duration: 500 })
  const today = new Date()
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7))
  const week = WEEKDAYS.map((letter, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const key = date.toDateString()
    return { key, letter, done: dates.includes(key), isToday: key === today.toDateString() }
  })
  const message = after === 1
    ? 'A new streak! Practice every day to help it grow.'
    : `${after} days in a row — keep it going tomorrow!`

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .from('[data-streak-glow]', { autoAlpha: 0, scale: 0.5, duration: 0.6 })
        .from('[data-streak-fire]', { autoAlpha: 0, scale: 0.3, y: 30, transformOrigin: '50% 100%', duration: 0.6, ease: 'back.out(2.2)' }, '<')
        .from('[data-streak-devy]', { autoAlpha: 0, x: 24, rotate: 12, duration: 0.45, ease: 'back.out(2)' }, '-=0.25')
        .from('[data-streak-bubble]', { autoAlpha: 0, y: 10, scale: 0.9, transformOrigin: '70% 100%', duration: 0.35, ease: 'back.out(2)' }, '-=0.15')
        .from('[data-streak-count]', { scale: 1.4, duration: 0.45, ease: 'back.out(3)' }, 0.65)
        .from('[data-streak-week]', { autoAlpha: 0, y: 14, duration: 0.4 }, '-=0.2')
        .from('[data-streak-link]', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.3, stagger: 0.08 }, '-=0.1')
        .from('[data-streak-today]', { scale: 0, duration: 0.5, ease: 'back.out(3)' }, '-=0.1')
    }, rootRef)
    return () => context.revert()
  }, [])

  return (
    <section ref={rootRef} className="flex h-full flex-col overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-labelledby="streak-celebration-title">
      <div className="grid flex-1 place-items-center px-7 py-10 max-[720px]:px-5">
        <div className="grid justify-items-center text-center">
          <div className="relative">
            <p
              data-streak-bubble
              className="relative m-0 mb-3 max-w-[32ch] rounded-2xl border border-[#3a3a3d] bg-[#262626] px-4 py-3 text-[15px] font-medium leading-[1.45] text-[#e4e4e6] shadow-[0_10px_24px_-16px_rgba(0,0,0,.6)] [[data-theme=light]_&]:border-[#e6e6e2] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:shadow-[0_10px_24px_-16px_rgba(20,20,40,.25)]"
            >
              {message}
              <span className="absolute -bottom-[7px] left-[70%] size-3 rotate-45 border-r border-b border-[#3a3a3d] bg-[#262626] [[data-theme=light]_&]:border-[#e6e6e2] [[data-theme=light]_&]:bg-white" aria-hidden="true" />
            </p>
          </div>

          {/* Lightning is the app's streak mark (the header counter, the
              streak journey), so the streak moment uses it too. Devy leans on
              it rather than standing beside it — one character moment. */}
          <div className="relative size-[200px] max-[720px]:size-[168px]">
            <span
              data-streak-glow
              aria-hidden="true"
              className="absolute inset-[-30px] rounded-full bg-[radial-gradient(circle,rgba(255,214,0,0.32),rgba(255,184,0,0.1)_45%,transparent_70%)] [[data-theme=light]_&]:bg-[radial-gradient(circle,rgba(255,200,0,0.28),rgba(255,170,0,0.08)_45%,transparent_70%)]"
            />
            <span data-streak-fire className="absolute inset-x-0 top-0 grid justify-items-center">
              <GameIcon name="lightning-bolt" className="streak-bolt h-[184px] w-[180px] max-[720px]:h-[154px] max-[720px]:w-[150px]" />
            </span>
            <span data-streak-devy className="absolute -right-20 -bottom-8 size-[150px] max-[720px]:-right-14 max-[720px]:-bottom-6 max-[720px]:size-[118px]">
              <DevyLottie clip="lesson-complete" loop={false} className="size-full" />
            </span>
          </div>

          <strong
            data-streak-count
            id="streak-celebration-title"
            className="mt-3 bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text font-rethink-sans text-[76px] leading-none font-extrabold text-transparent max-[720px]:text-[60px]"
          >
            {count}
          </strong>
          <span className="mt-1 text-[20px] font-bold text-amber-400 [[data-theme=light]_&]:text-amber-500">day streak</span>

          <div
            data-streak-week
            className="mt-8 rounded-3xl border border-[#333336] bg-[#232323] px-6 py-5 [[data-theme=light]_&]:border-[#ececea] [[data-theme=light]_&]:bg-[#fafaf8] max-[720px]:mt-6 max-[720px]:px-4 max-[720px]:py-4"
          >
            <ol className="m-0 grid list-none grid-cols-7 gap-x-3 p-0 max-[720px]:gap-x-2" aria-label="This week">
              {week.map((day, index) => {
                const linksNext = day.done && week[index + 1]?.done
                return (
                  <li key={day.key} className="relative grid justify-items-center gap-2" aria-label={`${day.key}: ${day.done ? 'active' : 'not active'}`}>
                    <span className={`text-[12px] leading-4 font-bold ${day.isToday ? 'text-amber-400 [[data-theme=light]_&]:text-amber-500' : 'text-[#7d7d80] [[data-theme=light]_&]:text-[#9a9a9d]'}`}>
                      {day.letter}
                    </span>
                    {linksNext && (
                      <span
                        data-streak-link
                        aria-hidden="true"
                        className="absolute top-[38px] left-1/2 h-2 w-[calc(100%+0.75rem)] bg-amber-400 max-[720px]:w-[calc(100%+0.5rem)]"
                      />
                    )}
                    {day.done ? (
                      <span
                        data-streak-today={day.isToday || undefined}
                        className={`relative grid size-9 place-items-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 text-white shadow-[0_4px_10px_-4px_rgba(245,180,0,.7)] ${day.isToday ? 'ring-4 ring-amber-400/25' : ''}`}
                      >
                        <CheckIcon className="size-4" />
                      </span>
                    ) : (
                      <span className="relative size-9 rounded-full border-2 border-dashed border-[#3a3a3d] [[data-theme=light]_&]:border-[#dededa]" />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 justify-center px-6 pt-2 pb-7 max-[720px]:px-4 max-[720px]:pb-5">
        <ActionButton variant="primary" className="depth-button min-h-14 w-full max-w-[560px] overflow-hidden text-[17px] font-semibold" onClick={onContinue}>
          Continue
        </ActionButton>
      </div>
    </section>
  )
}

// Duolingo's "quest progress" beat: the daily quests this lesson just moved,
// filling up — so the quests are seen where they're earned, not only when
// someone thinks to open the checklist on Home.
function QuestProgressScreen({ quests, onContinue }) {
  const doneCount = quests.after.filter((quest) => quest.done).length
  const allDone = doneCount === quests.after.length
  return (
    <section className="flex h-full flex-col overflow-auto bg-[#1f1f1f] [[data-theme=light]_&]:bg-white" aria-labelledby="quest-progress-title">
      <div className="grid flex-1 place-items-center px-7 py-10 max-[720px]:px-5">
        <div className="grid w-full max-w-[520px] justify-items-center text-center">
          {/* All three done earns the treasure-chest Devy — the day's haul —
              while part-way through it's the regular celebration. */}
          {allDone ? (
            <GameIcon name="devy-treasure-chest" className="devy-celebrate mb-4 h-36 w-36" />
          ) : (
            <DevyLottie clip="lesson-complete" loop={false} className="mb-5 h-28 w-28" />
          )}
          <h1 id="quest-progress-title" className="m-0 font-rethink-sans text-[clamp(26px,3.4vw,32px)] font-semibold leading-[1.12] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
            {allDone ? 'Daily quests complete!' : 'Daily quest progress'}
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">
            {allDone ? 'All three done for today. See you tomorrow.' : `${doneCount} of ${quests.after.length} done today`}
          </p>
          <DailyQuestProgress before={quests.before} after={quests.after} className="mt-7" />
        </div>
      </div>
      <div className="flex shrink-0 justify-center px-6 pt-2 pb-7 max-[720px]:px-4 max-[720px]:pb-5">
        <ActionButton variant="primary" className="depth-button min-h-14 w-full max-w-[560px] overflow-hidden text-[17px] font-semibold" onClick={onContinue} autoFocus>
          Continue
        </ActionButton>
      </div>
    </section>
  )
}

// The end of a lesson as a short sequence: the results, then the daily quests
// it moved, then — only when this lesson actually extends the streak — the
// streak moment, then back to the path.
export function LessonCompleteSequence({ title, body, xpEarned, accuracy, startedAt, streak, quests, onFinish, onExit }) {
  const [screen, setScreen] = useState('results')
  // Fixed once, when the results appear — not recomputed on every render.
  const [seconds] = useState(() => Math.max(1, Math.round((Date.now() - startedAt) / 1000)))
  const xpShown = useCountUp(xpEarned, { delay: 1300 })

  const afterQuests = () => (streak ? setScreen('streak') : onFinish())

  if (screen === 'quests' && quests) {
    return <QuestProgressScreen quests={quests} onContinue={afterQuests} />
  }

  if (screen === 'streak' && streak) {
    return <StreakCelebration before={streak.before} after={streak.after} dates={streak.dates} onContinue={onFinish} />
  }

  return (
    <ConceptTransition
      title={title}
      body={body}
      mood="celebrating"
      clip="lesson-complete"
      accentTitle
      pinAction
      disableDevyCheer
      markClassName="size-[184px] max-[720px]:size-[140px]"
      onExit={onExit}
      action={{
        label: xpEarned > 0 ? 'Claim XP' : 'Continue',
        onClick: () => (quests ? setScreen('quests') : afterQuests()),
      }}
    >
      <div className="mt-9 grid w-full max-w-[520px] grid-cols-3 gap-3 max-[720px]:mt-7 max-[720px]:gap-2">
        <ResultCard index={0} tone="245 180 0" label="Total XP" icon={<BoltIcon className="size-5" />} value={xpShown} />
        {accuracy != null && (
          <ResultCard index={1} tone="34 197 94" label={accuracyLabel(accuracy)} icon={<TargetIcon className="size-5" />} value={`${accuracy}%`} />
        )}
        <ResultCard index={2} tone="59 130 246" label={seconds < 180 ? 'Speedy' : 'Time'} icon={<ClockIcon className="size-5" />} value={formatTime(seconds)} />
      </div>
    </ConceptTransition>
  )
}
