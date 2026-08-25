import { useEffect, useRef, useState } from 'react'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { NARRATION_RATES, useLessonNarration } from './useLessonNarration'

function ChevronRight() {
  return <svg className="size-4 flex-none text-[#68686c]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function PanelRow({ icon, label, value, onClick }) {
  return (
    <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left hover:bg-[#262629] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={onClick}>
      <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#777]" aria-hidden="true">{icon}</span>
      <span className="flex-none text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{label}</span>
      {value && <span className="flex-1 min-w-0 truncate text-right text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#777]">{value}</span>}
      <ChevronRight />
    </button>
  )
}

function OptionList({ options, activeValue, onSelect }) {
  return (
    <div className="grid gap-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left text-[15px] text-[#f4f4f2] hover:bg-[#262629] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:bg-[#f5f5f4]"
          onClick={() => onSelect(option.value)}
        >
          {option.label}
          {option.value === activeValue && <svg className="size-4 text-[#6699ec]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      ))}
    </div>
  )
}

function PanelHeader({ title, onBack, onClose }) {
  return (
    <div className="flex items-center gap-2 px-1 pb-1">
      {onBack && (
        <button type="button" className="grid size-7 flex-none place-items-center rounded-md text-[#9a9a9d] hover:bg-[#262629] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={onBack} aria-label="Back">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <span className="flex-1 text-[13px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{title}</span>
      <button type="button" className="grid size-7 flex-none place-items-center rounded-md text-[#9a9a9d] hover:bg-[#262629] [[data-theme=light]_&]:hover:bg-[#f5f5f4]" onClick={onClose} aria-label="Close">✕</button>
    </div>
  )
}

// Anchored dropdown off the lesson header — "Audio" arms hands-free narration
// (auto-plays each article as it loads), Voice/Speed drill into a sub-list,
// and Auto-continue chains straight into the next step when narration ends.
export function NarrationControl({ article, onNarrationStart, onNarrationEnd }) {
  const narration = useLessonNarration(article, { onNarrationStart, onNarrationEnd })
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('root')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    const onPointerDown = (event) => { if (!rootRef.current?.contains(event.target)) setIsOpen(false) }
    const onKeyDown = (event) => { if (event.key === 'Escape') setIsOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  useEffect(() => { if (!isOpen) setView('root') }, [isOpen])

  if (!narration.supported) return null

  const isActive = narration.autoPlay || narration.isSpeaking

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border pl-3 pr-2.5 text-[15px] font-medium transition-colors ${isActive
          ? 'border-[#2563eb] bg-[#2563eb] text-white'
          : 'border-[#e8e6e1] bg-white text-[#686968] hover:bg-[#f5f5f4] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1f1f1f] [[data-theme=dark]_&]:text-[#b2b2b6] [[data-theme=dark]_&]:hover:bg-[#262626]'}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {narration.isSpeaking && !narration.isPaused ? (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="9" width="2.4" height="6" rx="1.2" fill="currentColor"><animate attributeName="height" values="6;13;6" dur="0.9s" repeatCount="indefinite" /><animate attributeName="y" values="9;5.5;9" dur="0.9s" repeatCount="indefinite" /></rect><rect x="9" y="6" width="2.4" height="12" rx="1.2" fill="currentColor"><animate attributeName="height" values="12;18;12" dur="0.9s" begin="0.15s" repeatCount="indefinite" /><animate attributeName="y" values="6;3;6" dur="0.9s" begin="0.15s" repeatCount="indefinite" /></rect><rect x="14" y="4" width="2.4" height="16" rx="1.2" fill="currentColor"><animate attributeName="height" values="16;9;16" dur="0.9s" begin="0.3s" repeatCount="indefinite" /><animate attributeName="y" values="4;7.5;4" dur="0.9s" begin="0.3s" repeatCount="indefinite" /></rect></svg>
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4M17 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
        {narration.isSpeaking ? (narration.isPaused ? 'Paused' : 'Listening') : 'Audio'}
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 flex w-[300px] max-w-[calc(100vw_-_32px)] flex-col gap-1 overflow-hidden rounded-xl border border-[#eeeeeb] bg-white p-2.5 text-left shadow-[0_16px_36px_rgba(20,20,20,.14)] [[data-theme=dark]_&]:border-[#404040] [[data-theme=dark]_&]:bg-[#1f1f1f] [[data-theme=dark]_&]:shadow-[0_16px_36px_rgba(0,0,0,.36)]">
          {view === 'root' && (
            <>
              <div className="flex items-start gap-3 px-2 py-2">
                <div className="grid min-w-0 flex-1 gap-0.5">
                  <span className="text-[15px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Audio mode</span>
                  <span className="text-[13px] leading-[1.4] text-[#9a9a9d] [[data-theme=light]_&]:text-[#777]">Listen to each lesson step, then complete the quick check.</span>
                </div>
                <ToggleSwitch checked={narration.autoPlay} onChange={narration.changeAutoPlay} label="Audio" />
              </div>

              <div className="my-1 border-t border-[#eeeeeb] [[data-theme=dark]_&]:border-[#404040]" role="separator" />

              <PanelRow
                icon={<svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.7" /><path d="M6 11a6 6 0 0 0 12 0M12 19v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>}
                label="Voice"
                value={narration.activeVoice?.name.replace(/^Microsoft |^Google /, '') ?? '—'}
                onClick={() => setView('voice')}
              />
              <PanelRow
                icon={<svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8h4M4 12h6M4 16h3M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                label="Speed"
                value={`${narration.rate}x`}
                onClick={() => setView('speed')}
              />

            </>
          )}

          {view === 'voice' && (
            <>
              <PanelHeader title="Voice" onBack={() => setView('root')} onClose={() => setIsOpen(false)} />
              <OptionList
                options={narration.voices.map((voice) => ({ value: voice.name, label: voice.name.replace(/^Microsoft |^Google /, '') }))}
                activeValue={narration.activeVoice?.name}
                onSelect={(value) => { narration.changeVoice(value); setView('root') }}
              />
            </>
          )}

          {view === 'speed' && (
            <>
              <PanelHeader title="Speed" onBack={() => setView('root')} onClose={() => setIsOpen(false)} />
              <OptionList
                options={NARRATION_RATES.map((rate) => ({ value: rate, label: `${rate}x` }))}
                activeValue={narration.rate}
                onSelect={(value) => { narration.changeRate(value); setView('root') }}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
