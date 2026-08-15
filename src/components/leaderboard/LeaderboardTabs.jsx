import { LockIcon } from '../ui/icons'

const BASE = 'relative z-10 flex items-center justify-center gap-1.5 min-h-8 rounded-lg py-1 px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] focus-visible:outline-offset-1'
const ACTIVE = `${BASE} text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800`
const IDLE = `${BASE} bg-transparent text-[#9a9a9d] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-neutral-700`

// A locked tab still looks and behaves like a tab — it just routes the click
// somewhere else. Nothing here knows what unlocks it.
export function LeaderboardTabs({ tabs, active, onSelect, lockedTabs = [], onLockedSelect }) {
  const activeIndex = Math.max(0, tabs.indexOf(active))

  return (
    <div
      className="relative grid w-[324px] max-w-full grid-cols-3 mx-auto rounded-full bg-[#1e1e1e] [[data-theme=light]_&]:bg-[#f1efe9] p-1"
      role="group"
      aria-label="Leaderboard range"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc((100%_-_8px)_/_3)] rounded-full bg-[#262626] [[data-theme=light]_&]:bg-white transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {tabs.map((tab) => {
        const isLocked = lockedTabs.includes(tab)
        const isActive = !isLocked && tab === active

        return (
          <button
            key={tab}
            type="button"
            aria-pressed={isActive}
            onClick={() => (isLocked ? onLockedSelect?.(tab) : onSelect(tab))}
            className={isActive ? ACTIVE : IDLE}
          >
            {tab}
            {isLocked && (
              <>
                <LockIcon className="w-3 h-3 flex-none" />
                <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">Premium</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
