import { Hammer, Path, Sparkle } from '@phosphor-icons/react'
import { ActionButton } from '../ui/ActionButton'

export default function BuildView({ onStartLearning }) {
  return (
    <section className="grid gap-8" aria-labelledby="build-title">
      <header className="grid max-w-3xl gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--surface-devy-tint)] px-3 py-2 text-[var(--type-label)] font-medium text-[var(--accent-devy)]">
          <Sparkle size={18} weight="regular" aria-hidden="true" />
          Guided projects
        </span>
        <h1 id="build-title" className="page-title">Turn what you learn into work you can show.</h1>
        <p className="body-copy m-0 max-w-2xl">Build will help you shape a real project, break it into useful milestones, and get guidance from Devy as you move.</p>
      </header>

      <article className="surface-card grid overflow-hidden md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-center gap-6 p-6 md:p-8">
          <div className="grid size-14 place-items-center rounded-[var(--radius-card)] bg-[var(--surface-brand-tint)] text-[var(--brand-on-dark)] [[data-theme=light]_&]:text-[var(--brand-base)]">
            <Hammer size={28} weight="regular" aria-hidden="true" />
          </div>
          <div className="grid gap-2">
            <h2 className="section-title">Your project space is taking shape</h2>
            <p className="body-copy m-0 max-w-xl">There are no pretend templates here yet. When Build opens, your current path will guide the project brief and the evidence you create.</p>
          </div>
          <ActionButton variant="primary" className="inline-flex w-fit items-center gap-2" onClick={onStartLearning}>
            Continue your path
            <Path size={20} weight="regular" aria-hidden="true" />
          </ActionButton>
        </div>

        <div className="grid min-h-64 place-items-center bg-[var(--surface-devy-tint)] p-8">
          <div className="grid justify-items-center gap-4 text-center">
            <div className="grid size-32 place-items-center rounded-full bg-[var(--surface-default)] shadow-[var(--shadow-raised)]">
              <img className="size-24 object-contain" src="/assets/devy.svg" alt="" />
            </div>
            <p className="meta-copy m-0 max-w-56">Devy will help turn a goal into a focused, achievable first version.</p>
          </div>
        </div>
      </article>
    </section>
  )
}
