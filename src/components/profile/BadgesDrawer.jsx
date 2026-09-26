import { Drawer } from '../ui/Drawer'
import { BADGE_CATEGORIES, MAX_FEATURED_BADGES } from '../../lib/badges'
import { BadgeCoin } from './BadgeCoin'

const INK = 'text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800'
const MUTED = 'text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FAINT = 'text-[#86868a] [[data-theme=light]_&]:text-[#767674]'

function PinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 3h6l-1 6 4 3v2H6v-2l4-3-1-6ZM12 14v7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// The whole collection, grouped by ladder. The owner can pin up to three
// earned badges to show beside their name; a visitor only ever sees what's
// been earned, so the drawer there is a trophy case rather than a to-do list.
export function BadgesDrawer({ badges, pinnedIds = [], onTogglePin, readOnly = false, onClose }) {
  const earnedCount = badges.filter((badge) => badge.earned).length
  const groups = BADGE_CATEGORIES
    .map((category) => ({ ...category, badges: badges.filter((badge) => badge.category === category.id && (!readOnly || badge.earned)) }))
    .filter((group) => group.badges.length > 0)

  return (
    <Drawer
      id="badges"
      title="Badges"
      subtitle={readOnly ? `${earnedCount} earned` : `${earnedCount} of ${badges.length} collected`}
      onClose={onClose}
      labelledBy="badges-title"
    >
      <div className="grid gap-7">
        {!readOnly && (
          <p className={`m-0 text-[13px] leading-[1.55] ${MUTED}`}>
            Pin up to {MAX_FEATURED_BADGES} earned badges to show beside your name. With none pinned, your best badge from each category is shown.
          </p>
        )}

        {groups.map((group) => {
          const groupEarned = group.badges.filter((badge) => badge.earned).length
          return (
            <section key={group.id} className="grid gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className={`m-0 text-[12px] font-semibold uppercase tracking-[.08em] ${MUTED}`}>{group.label}</h3>
                {!readOnly && <span className={`text-[12px] tabular-nums ${FAINT}`}>{groupEarned} / {group.badges.length}</span>}
              </div>
              <ul className="m-0 grid list-none gap-1 p-0">
                {group.badges.map((badge) => {
                  const pinned = pinnedIds.includes(badge.id)
                  return (
                    <li
                      key={badge.id}
                      className={`flex items-center gap-3.5 rounded-xl px-2 py-2 ${pinned ? 'bg-[#6699ec]/10' : ''}`}
                    >
                      <BadgeCoin badge={badge} size={44} />
                      <div className="grid min-w-0 flex-1 gap-0.5">
                        <span className={`text-[14px] font-semibold ${badge.earned ? INK : MUTED}`}>{badge.label}</span>
                        <span className={`text-[12.5px] leading-[1.4] ${FAINT}`}>
                          {badge.description}
                          {!badge.earned && badge.progress && (
                            <span className="tabular-nums"> · {badge.progress.current} of {badge.progress.target}</span>
                          )}
                        </span>
                      </div>
                      {!readOnly && badge.earned && (
                        <button
                          type="button"
                          aria-pressed={pinned}
                          onClick={() => onTogglePin?.(badge.id)}
                          className={`inline-flex min-h-8 flex-none items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${
                            pinned
                              ? 'bg-[#6699ec] text-white'
                              : 'text-[#9a9a9d] hover:bg-[#262629] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-[#f0f0ed] [[data-theme=light]_&]:hover:text-neutral-800'
                          }`}
                        >
                          <PinIcon className="size-3.5" />
                          {pinned ? 'Pinned' : 'Pin'}
                        </button>
                      )}
                      {!badge.earned && <span className={`flex-none text-[12px] ${FAINT}`}>Locked</span>}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </Drawer>
  )
}
