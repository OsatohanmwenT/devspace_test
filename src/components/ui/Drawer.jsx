import { useEffect, useRef } from 'react'

// A side panel over a scrim. Unlike the full-bleed overlays elsewhere in the
// app, this deliberately leaves the page visible behind it — the point of a
// reference panel is that you don't lose your place while consulting it.
export function Drawer({ title, subtitle, onClose, children, labelledBy = 'drawer-title' }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // Keep focus inside the panel while it's open.
      const focusable = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.removeEventListener('keydown', handleKeyDown, true)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/55 [[data-theme=light]_&]:bg-black/30"
        onClick={onClose}
        aria-label="Close panel"
        tabIndex={-1}
      />

      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative grid h-full w-[min(100%,520px)] grid-rows-[auto_minmax(0,1fr)] border-l border-[#404040] bg-[#151517] shadow-[-24px_0_60px_rgba(0,0,0,.45)] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#404040] px-6 py-4 [[data-theme=light]_&]:border-[#e1e1e1] max-[680px]:px-4">
          <div className="min-w-0">
            <h2 id={labelledBy} className="m-0 font-['Space_Grotesk',Arial,sans-serif] text-xl font-semibold tracking-[-0.03em] text-[#f4f4f2] [[data-theme=light]_&]:text-[#181818]">{title}</h2>
            {subtitle && <p className="mt-0.5 mb-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="grid size-9 flex-none place-items-center rounded-lg border-0 bg-transparent text-[#b2b2b6] hover:bg-[#262629] hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#888df2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-[#181818]"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-6 py-6 max-[680px]:px-4">{children}</div>
      </section>
    </div>
  )
}
