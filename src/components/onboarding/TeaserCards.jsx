import { FAN } from '../../lib/onboardingMotion'
import { CardFan } from './motion/CardFan'
import { MiniIcon } from './OnboardingStep'

// Three teaser cards fanned into a stack — a streak badge, the daily goal and
// the next lesson: the actual shapes the learner will meet on the home
// screen, so a screen can show the product rather than describe it. Static
// content; they're a preview, not live data.
//
// Not placed anywhere yet. Tried on the welcome screen, where the fan pulled
// focus from the copy; parked here for a screen that has room for a hero.
export function TeaserCard({ tint, eyebrow, title, note, icon }) {
  return (
    <div className="onb-card onb-card--raised w-[172px] rounded-2xl p-3.5 text-left">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]" style={{ background: `linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 60%), ${tint}` }} aria-hidden="true">
          <MiniIcon name={icon} className="size-3.5" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#8b8b90] [[data-theme=light]_&]:text-[#737371]">{eyebrow}</span>
      </div>
      <p className="m-0 mt-2.5 font-rethink-sans text-[18px] font-semibold leading-[1.15] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{title}</p>
      <p className="m-0 mt-1 text-[12px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{note}</p>
    </div>
  )
}

export function TeaserCardFan({ spread = FAN.spread, className = '' }) {
  return (
    <CardFan spread={spread} className={`h-[150px] w-[300px] ${className}`}>
      <TeaserCard tint="#f7c948" eyebrow="Streak" title="7 days" note="Keep it alive" icon="sparkle" />
      <TeaserCard tint="#8b7cf6" eyebrow="Daily goal" title="50 XP" note="About 10 minutes" icon="target" />
      <TeaserCard tint="#2563eb" eyebrow="Next lesson" title="Your first lesson" note="Ready when you are" icon="code" />
    </CardFan>
  )
}
