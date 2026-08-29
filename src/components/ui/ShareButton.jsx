import { useState } from 'react'
import { ActionButton } from './ActionButton'

// One button, two real mechanisms: the OS share sheet where it exists
// (mobile browsers, most desktop ones now), clipboard everywhere else. If the
// learner explicitly cancels the native sheet, that's their call — this
// never covers a cancel by copying anyway, only a genuine failure or absence.
export function ShareButton({ text, title = 'Devspace', variant = 'neutral', className = '', children = 'Share' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be unavailable (permissions, a non-secure context) —
      // there's nothing else to fall back to, so this just quietly no-ops.
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
      } catch (error) {
        if (error?.name !== 'AbortError') await copyToClipboard()
      }
      return
    }
    await copyToClipboard()
  }

  return (
    <ActionButton variant={variant} className={className} onClick={handleShare}>
      {copied ? 'Copied!' : children}
    </ActionButton>
  )
}
