import { useEffect, useRef, useState } from 'react'

// A side panel over a scrim. Unlike the full-bleed overlays elsewhere in the
// app, this deliberately leaves the page visible behind it — the point of a
// reference panel is that you don't lose your place while consulting it.
export function Drawer({ id, title, subtitle, onClose, children, labelledBy = 'drawer-title', placement = 'right', expandable = false, compactHeader = false }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const closeTimerRef = useRef(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const requestClose = () => {
    if (placement !== 'bottom' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    if (isClosing) return
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(onClose, 240)
  }

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        requestClose()
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
  }, [onClose, isClosing, placement])

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  return (
    <div className={`fixed inset-0 z-40 flex ${placement === 'bottom' ? 'items-end justify-center' : 'justify-end'}`}>
      <button
        type="button"
        className={`absolute inset-0 h-full w-full cursor-default border-0 bg-black/55 [[data-theme=light]_&]:bg-black/30 ${placement === 'bottom' ? (isClosing ? 'drawer-scrim-out' : 'drawer-scrim-in') : ''}`}
        onClick={requestClose}
        aria-label="Close panel"
        tabIndex={-1}
      />

      <section
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative grid grid-rows-[auto_minmax(0,1fr)] bg-[#151517] transition-[width,height,border-radius] duration-300 [[data-theme=light]_&]:bg-white ${placement === 'bottom' ? `${isClosing ? 'drawer-bottom-out' : 'drawer-bottom-in'} ${isExpanded ? 'h-full w-full rounded-none border-0' : 'h-[calc(100%-100px)] w-[calc(100%-40px)] rounded-t-3xl border border-b-0 border-[#404040] shadow-[0_-12px_32px_rgba(0,0,0,.34)] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:shadow-[0_-8px_24px_rgba(20,20,20,0.10)] max-[680px]:h-[86vh] max-[680px]:w-full max-[680px]:rounded-t-2xl'}` : 'h-full w-[min(100%,560px)] border-l border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:shadow-[-8px_0_24px_rgba(20,20,20,0.08)]'}`}
      >
        {placement === 'bottom' && !isExpanded && <span className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#6b6b70] [[data-theme=light]_&]:bg-[#c8c8c4]" aria-hidden="true" />}
        <header className={`flex items-center justify-between gap-4 border-b border-[#404040] px-6 py-4 [[data-theme=light]_&]:border-[#e1e1e1] max-[680px]:px-4 ${placement === 'bottom' && !compactHeader ? 'pt-6' : ''} ${compactHeader ? 'px-5 py-2' : ''}`}>
          <div className="min-w-0">
            <h2 id={labelledBy} className={`m-0 font-rethink-sans font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 ${compactHeader ? 'text-[15px]' : 'text-xl'}`}>{title}</h2>
            {subtitle && <p className="mt-0.5 mb-0 text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {placement === 'bottom' && expandable && <button type="button" className={`rounded-lg border border-[#404040] bg-transparent text-xs font-semibold text-[#b2b2b6] hover:bg-[#262629] hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-700 ${compactHeader ? 'min-h-8 px-2.5' : 'min-h-9 px-3'}`} onClick={() => setIsExpanded((expanded) => !expanded)} aria-pressed={isExpanded}>{isExpanded ? 'Minimize' : 'Full screen'}</button>}
            <button ref={closeRef} type="button" className={`grid flex-none place-items-center rounded-lg border-0 bg-transparent text-[#b2b2b6] hover:bg-[#262629] hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-700 ${compactHeader ? 'size-8' : 'size-9'}`} onClick={requestClose} aria-label="Close"><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
          </div>
        </header>

        <div className="min-h-0 overflow-y-auto px-6 py-6 max-[680px]:px-4">{children}</div>
      </section>
    </div>
  )
}
