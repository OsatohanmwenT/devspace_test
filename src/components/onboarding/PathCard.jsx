import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { BRANCHES, branchTint, outcomes, roleInsights } from '../../data/onboarding'
import { DRAW, reducedMotion } from '../../lib/onboardingMotion'
import { MiniIcon } from './OnboardingStep'

// Matches a stage's id against the tech it actually teaches, so a row can
// show a real HTML/JS/React mark instead of a bare number. Falls back to the
// number when a stage (e.g. "DOM manipulation") doesn't map cleanly to one
// icon — better a blank than a wrong mark.
export function stageIcon(stageValue) {
  const tokens = stageValue.split('_')
  const has = (...keywords) => keywords.some((keyword) => tokens.includes(keyword))

  if (has('react')) return 'react'
  if (has('vue')) return 'vue'
  if (has('angular')) return 'angular'
  if (has('typescript')) return 'typescript'
  if (has('html', 'css')) return 'markup'
  if (has('js', 'javascript')) return 'js'
  if (has('python')) return 'python'
  if (has('java')) return 'java'
  if (has('csharp')) return 'csharp'
  if (has('swift')) return 'swift'
  if (has('kotlin')) return 'kotlin'
  if (has('sql', 'database', 'databases')) return 'database'
  if (has('docker', 'containers')) return 'docker'
  if (has('cloud')) return 'cloud'
  if (has('git')) return 'git'
  if (has('figma', 'design')) return 'design'
  if (has('api', 'apis', 'rest', 'graphql', 'networking')) return 'api'
  return null
}

// Parked, not placed yet — `stageIcon` is what the flow uses from here. The
// card itself was tried on the role-reveal and placement screens and pulled
// as too heavy for those; kept for a screen with room for a full route card.
//
// The "Gut Health Vybe" card: a branch-tinted header naming the role, then
// the concrete things the route teaches, as rows. Shown the moment a role is
// chosen so "AI & ML it is" is backed by what that actually means, and again
// (compact) on the placement screen with the recommended row lit.
//
// P5 — panel draw: the header scales down from its top edge, the meta line
// and chips follow, then the rows land one after another. gsap owns the
// entrance; the resting layout is plain CSS.
export function PathCard({ role, branch, stages, highlightValue, compact = false, delay = 0, minutes, className = '' }) {
  const rootRef = useRef(null)
  const branchEntry = BRANCHES.find((item) => item.value === branch)
  const branchLabel = branchEntry?.label ?? ''
  const branchIcon = branchEntry?.icon
  const tint = branchTint[branch] ?? '#6699ec'
  const rows = stages.slice(0, 5)
  const perWeek = outcomes.lessonsPerWeek(minutes ?? 10)

  useLayoutEffect(() => {
    if (!rootRef.current || reducedMotion()) return undefined

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ delay })
      timeline
        .from('[data-card-shell]', { autoAlpha: 0, y: 18, duration: 0.3, ease: DRAW.ease })
        .from('[data-card-header]', { scaleY: 0, transformOrigin: 'top center', duration: DRAW.header, ease: 'power3.inOut' }, '-=0.1')
        .from('[data-card-header] > *', { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.06, ease: DRAW.ease }, '-=0.12')
        .from('[data-card-chip]', { autoAlpha: 0, scale: 0.85, duration: 0.26, stagger: 0.05, ease: 'back.out(1.6)' }, '-=0.1')
        .from('[data-card-insight]', { autoAlpha: 0, y: 6, duration: 0.3, ease: DRAW.ease }, '-=0.14')
        .from('[data-card-row]', { autoAlpha: 0, y: DRAW.rowY, duration: 0.34, stagger: DRAW.rowStagger, ease: DRAW.ease }, '-=0.16')
    }, rootRef)

    return () => context.revert()
  }, [role, branch, delay])

  return (
    <div ref={rootRef} className={`w-full ${compact ? 'max-w-[420px]' : 'max-w-[520px]'} ${className}`}>
      <div
        data-card-shell
        className="onb-card onb-card--tinted overflow-hidden rounded-2xl text-left"
        style={{ '--card-tint': tint }}
      >
        <div data-card-header className={`onb-card-header flex items-start justify-between gap-3 text-white ${compact ? 'px-4 py-3.5' : 'px-5 py-4'}`}>
          <div className="min-w-0">
            <p className={`m-0 truncate font-rethink-sans font-semibold leading-[1.2] ${compact ? 'text-[17px]' : 'text-[20px]'}`}>{role}</p>
            <p className="m-0 mt-1 text-[12px] font-medium text-white/80">{branchLabel} · ~{perWeek} lessons a week</p>
          </div>
          <div className="flex flex-none flex-col items-end gap-1">
            <span className="grid size-9 place-items-center rounded-full bg-white/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]">
              {branchIcon ? <MiniIcon name={branchIcon} className="size-[18px]" /> : null}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-white/85">{stages.length} steps</span>
          </div>
        </div>

        <div className={`grid gap-3 ${compact ? 'p-3.5' : 'p-4'}`}>
          {!compact && (
            <div className="flex flex-wrap gap-1.5">
              {stages.slice(0, 3).map((stage) => (
                <span key={stage.value} data-card-chip className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#d6d6d8] [[data-theme=light]_&]:border-black/5 [[data-theme=light]_&]:bg-black/5 [[data-theme=light]_&]:text-neutral-700">
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7" /></svg>
                  {stage.label}
                </span>
              ))}
            </div>
          )}
          {!compact && roleInsights[branch] && (
            <p data-card-insight className="m-0 text-[13px] leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{roleInsights[branch]}</p>
          )}
          <ol className="m-0 grid gap-1.5 p-0" aria-label={`${role} route`}>
            {rows.map((stage, index) => {
              const icon = stageIcon(stage.value)
              const isHighlighted = stage.value === highlightValue
              return (
                <li
                  key={stage.value}
                  data-card-row
                  className={`flex list-none items-center gap-3 rounded-xl px-3 py-2.5 ${isHighlighted
                    ? 'onboarding-start-pulse relative bg-[#2a264c] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#eeebff] [[data-theme=light]_&]:text-[#30226e]'
                    : 'bg-black/25 text-[#e4e4e6] [[data-theme=light]_&]:bg-black/[.04] [[data-theme=light]_&]:text-neutral-800'}`}
                >
                  <span className={`grid size-7 flex-none place-items-center rounded-full text-[12px] font-semibold ${isHighlighted ? 'bg-[#5c49c9] text-white' : 'bg-white/8 text-[#c8c8c6] [[data-theme=light]_&]:bg-black/6 [[data-theme=light]_&]:text-[#4b4b4d]'}`} aria-hidden="true">
                    {icon ? <MiniIcon name={icon} className="size-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{stage.label}</span>
                    <span className={`block text-[12px] ${isHighlighted ? 'text-white/70 [[data-theme=light]_&]:text-[#30226e]/70' : 'text-[#8b8b90] [[data-theme=light]_&]:text-[#737371]'}`}>
                      {isHighlighted ? 'Start here' : `Step ${index + 1}`}
                    </span>
                  </span>
                  <span className={`size-4 flex-none rounded-full border-2 ${isHighlighted ? 'border-[#8b7cf6] bg-[#8b7cf6]/40' : 'border-white/15 [[data-theme=light]_&]:border-black/12'}`} aria-hidden="true" />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
