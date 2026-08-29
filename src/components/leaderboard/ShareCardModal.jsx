import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'

// Fixed-overlay dialog following ShareProfileModal's template in
// components/profile/index.jsx — there's no shared modal primitive in
// components/ui, so that file's markup is the de facto pattern to copy.
// No image-export library is installed (no html2canvas/dom-to-image), so
// "the card" is styled on-screen HTML plus copy-to-clipboard text, not a
// downloadable image.
export function ShareCardModal({ card, inviteLink, onClose }) {
  const [textCopied, setTextCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const shareText = `${card.headline} on Devspace — ${card.statLine}`

  const copy = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard can be unavailable; the button still flips so the flow
      // doesn't dead-end.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-card-title">
      <div className="w-full max-w-[480px] rounded-3xl border border-[#404040] bg-[#1f1f1f] p-6 text-left shadow-2xl [[data-theme=light]_&]:border-[#e0e0dc] [[data-theme=light]_&]:bg-white max-[480px]:p-5">
        <div className="flex items-center justify-between gap-4 border-b border-[#404040] pb-4 [[data-theme=light]_&]:border-[#eeeeeb]">
          <h2 id="share-card-title" className="m-0 font-rethink-sans text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">Share your progress</h2>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg text-[#9a9a9d] hover:bg-[#262626] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:bg-[#f2f2f0] [[data-theme=light]_&]:hover:text-neutral-800"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-2 overflow-hidden rounded-2xl border border-[#404040] bg-[linear-gradient(135deg,#1d2a43_0%,#121214_60%)] p-6 text-center [[data-theme=light]_&]:border-[#e3e3e0] [[data-theme=light]_&]:bg-[linear-gradient(135deg,#e4effd_0%,#fafaf8_60%)]">
          <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#88bdf2] [[data-theme=light]_&]:text-[#3d77eb]">Devspace</span>
          <strong className="mt-1 text-2xl font-semibold leading-tight text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">{card.headline}</strong>
          <span className="mt-1 text-[13px] text-[#b2b2b6] [[data-theme=light]_&]:text-[#686968]">{card.subtext}</span>
          <span className="mt-3 self-center rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-[#f4f4f2] [[data-theme=light]_&]:bg-black/5 [[data-theme=light]_&]:text-neutral-800">{card.statLine}</span>
        </div>

        <div className="mt-5 grid gap-2">
          <ActionButton variant="neutral" className="min-h-11 text-sm font-medium" onClick={() => copy(shareText, setTextCopied)}>
            {textCopied ? '✓ Copied' : 'Copy card text'}
          </ActionButton>
          {inviteLink && (
            <ActionButton variant="neutral" className="min-h-11 text-sm font-medium" onClick={() => copy(inviteLink, setLinkCopied)}>
              {linkCopied ? '✓ Copied' : 'Copy invite link · join my league'}
            </ActionButton>
          )}
        </div>

        <div className="mt-5 flex justify-end border-t border-[#404040] pt-4 [[data-theme=light]_&]:border-[#eeeeeb]">
          <ActionButton variant="neutral" className="min-h-10 text-xs" onClick={onClose}>Done</ActionButton>
        </div>
      </div>
    </div>
  )
}
