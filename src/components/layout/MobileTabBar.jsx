import { CompassIcon, DumbbellIcon, HomeIcon, PodiumIcon } from '../ui/icons'

// The desktop nav in main.jsx hides itself below 680px and nothing replaced
// it — below that width the only way back to Paths/Leaderboard/Practice was
// tapping through a Home card, with no way back once you'd left. This is
// that replacement: the same four top-level destinations, always reachable.
const TABS = [
  { id: 'Home', label: 'Home', Icon: HomeIcon },
  { id: 'Paths', label: 'Paths', Icon: CompassIcon },
  { id: 'Leaderboard', label: 'Ranks', Icon: PodiumIcon },
  { id: 'Practice', label: 'Practice', Icon: DumbbellIcon },
]

export function MobileTabBar({ active, onSelect }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 hidden grid-cols-4 border-t border-[#404040] bg-[#121214]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md max-[680px]:grid [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white/95"
      aria-label="Primary navigation"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            className={`flex min-h-14 flex-col items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-medium focus-visible:outline focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] ${isActive ? 'text-[#6699ec]' : 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'}`}
            onClick={() => onSelect(id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="size-[22px]" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
