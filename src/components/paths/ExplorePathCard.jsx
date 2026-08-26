import { useEffect } from 'react'
import { ActionButton } from '../ui/ActionButton'

export const FAMILY_ACCENTS = {
  ml: { accent: '#4169e1', soft: 'rgba(65,105,225,0.16)' },
  data: { accent: '#04adc0', soft: 'rgba(4,173,192,0.16)' },
  backend: { accent: '#88bdf2', soft: 'rgba(136, 189, 242,0.16)' },
  security: { accent: '#a9d94e', soft: 'rgba(169,217,78,0.16)' },
}

export function ExplorePathCard({ path, onSelect }) {
  const family = FAMILY_ACCENTS[path.family] ?? FAMILY_ACCENTS.backend

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-[#404040] bg-[#1f1f1f] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[#4169e1] focus-within:border-[#4169e1] [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:shadow-none">
      <button type="button" className="flex h-full w-full flex-col text-left" onClick={() => onSelect(path)} aria-label={`Open ${path.title} path`}>
        <div className={`grid min-h-40 place-items-center overflow-hidden [[data-theme=light]_&]:bg-[color-mix(in_srgb,${family.soft}_70%,#fafaf8)]`}>
          <img className="block h-32 w-[min(66%,180px)] object-contain" src={path.image} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col border-t border-neutral-800 bg-neutral-800 p-[18px] [[data-theme=light]_&]:border-[#e8e6e1] [[data-theme=light]_&]:bg-[#fdfcf9] max-[680px]:p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold tracking-[.08em] text-neutral-300 uppercase [[data-theme=light]_&]:text-[#525252]">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
          {path.recommended && <span className="rounded-full bg-[#4169e1]/15 px-2 py-1 text-[10px] font-bold tracking-[.06em] text-[#84a5ff] uppercase [[data-theme=light]_&]:text-[#4169e1]">Recommended</span>}
        </div>
        <h3 className="mt-2 text-xl leading-[1.15] font-medium text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800 max-[680px]:text-lg">{path.title}</h3>
        <p className="mt-2 text-sm leading-[1.5] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.description}</p>
        <div className="mt-4 border-t border-[#404040] pt-3 [[data-theme=light]_&]:border-[#dededb]">
          <div className="flex flex-wrap gap-1.5">{path.tools.map((tool) => <span key={tool} className="rounded-full bg-[#363636] px-2.5 py-1 text-[11px] text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f1efe9] [[data-theme=light]_&]:text-[#525252]">{tool}</span>)}</div>
        </div>
        </div>
      </button>
    </article>
  )
}

// A dialog rather than a page: it's a confirm-before-committing step, not a
// destination, so it opens over the explore grid instead of costing a
// navigation round-trip and the grid's scroll position. The point of the
// dialog is to answer "what am I getting into" — a title and one line never
// did that, so the meat of it is the actual skill ladder onboarding would
// walk this same path through (see `learningSteps` in data/paths.js).
export function PathPreviewModal({ path, onClose, onSwitchPrimaryPath, isCurrentPath }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/65 p-5 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <article
        className="relative grid w-full max-w-[600px] max-h-[88vh] overflow-y-auto rounded-3xl border border-[#404040] bg-[#1f1f1f] shadow-[0_24px_60px_rgba(0,0,0,.45)] [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="path-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-[1] grid size-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-2 [[data-theme=light]_&]:bg-white/80 [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-white"
        >
          ×
        </button>
        <div className="grid min-h-36 place-items-center bg-[#303030] [[data-theme=light]_&]:bg-[#f5f5f4]">
          <img className="h-24 w-[min(50%,150px)] object-contain" src={path.image} alt="" />
        </div>
        <div className="grid gap-4 p-[clamp(22px,4vw,36px)]">
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold tracking-[.08em] text-[#4169e1] uppercase">{path.type === 'career' ? 'Career path' : 'Skill path'}</span>
              {isCurrentPath && <span className="rounded-full bg-[#168a46]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]">Active mission</span>}
            </div>
            <h2 id="path-preview-title" className="text-[clamp(24px,3.2vw,32px)] leading-[1.15] font-semibold text-[#f4f4f2] font-rethink-sans [[data-theme=light]_&]:text-neutral-800">{path.title}</h2>
            <p className="text-[15px] leading-[1.55] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{path.reason}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#363636] px-2.5 py-1 text-[11px] font-medium text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f1efe9] [[data-theme=light]_&]:text-[#525252]">{path.meta}</span>
            {path.tools?.map((tool) => (
              <span key={tool} className="rounded-full bg-[#363636] px-2.5 py-1 text-[11px] text-[#d4d4d4] [[data-theme=light]_&]:bg-[#f1efe9] [[data-theme=light]_&]:text-[#525252]">{tool}</span>
            ))}
          </div>

          {path.learningSteps && (
            <div className="grid gap-2.5 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#eeeeeb]">
              <h3 className="text-[11px] font-bold uppercase tracking-[.08em] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">What you'll learn</h3>
              <ol className="m-0 grid list-none gap-2 p-0">
                {path.learningSteps.map((step, index) => (
                  <li key={step} className="flex items-center gap-2.5 text-[14px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
                    <span className="grid size-6 flex-none place-items-center rounded-full border border-[#404040] bg-[#262626] text-[11px] font-bold text-[#9a9a9d] [[data-theme=light]_&]:border-[#d4d4d4] [[data-theme=light]_&]:bg-[#f5f5f4] [[data-theme=light]_&]:text-[#686968]">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#eeeeeb]">
            {!isCurrentPath && onSwitchPrimaryPath ? (
              <ActionButton
                className="min-h-11 px-6 text-sm font-semibold"
                onClick={() => {
                  onSwitchPrimaryPath(path.id)
                  onClose()
                }}
                autoFocus
              >
                Set as active path →
              </ActionButton>
            ) : (
              <span className="text-sm font-medium text-[#6ee7a8] [[data-theme=light]_&]:text-[#168a46]">✓ This is your active mission path</span>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
