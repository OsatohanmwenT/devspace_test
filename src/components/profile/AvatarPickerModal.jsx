import { useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { AVATAR_STYLES, getAvatarDataUri, getDefaultAvatarStyleId, PREVIEW_SEEDS } from '../../lib/avatarStyles'

// Shown at a handful of natural pauses (right after onboarding, right after
// leaving or finishing a lesson) until a learner has picked a look once —
// never forced, always dismissible, and reachable again later from Profile's
// own "Change" affordance. Picking is instant (click a thumbnail); Save
// commits the style/seed/name together in one write via setAvatarChoice.
export function AvatarPickerModal({ initialName = '', initialAvatarStyle, initialAvatarSeed, seedFallback, onSave, onClose }) {
  const [name, setName] = useState(initialName)
  const [styleId, setStyleId] = useState(initialAvatarStyle || getDefaultAvatarStyleId(initialAvatarSeed || seedFallback))
  const [seed, setSeed] = useState(initialAvatarSeed || PREVIEW_SEEDS[0])

  const previewUri = getAvatarDataUri(styleId, seed)

  const save = () => {
    onSave({ avatarStyle: styleId, avatarSeed: seed, name: name.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-5">
      <div
        className="relative grid w-full max-w-[560px] gap-5 rounded-3xl bg-[#14252c] px-7 py-7 shadow-[0_18px_48px_rgba(0,0,0,.45)] [[data-theme=light]_&]:bg-white max-[520px]:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
      >
        <button
          type="button"
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-lg border-0 bg-transparent text-[#b2b2b6] hover:bg-[#262626] hover:text-[#f4f4f2] [[data-theme=light]_&]:text-[#777] [[data-theme=light]_&]:hover:bg-[#f5f5f5]"
          onClick={onClose}
          aria-label="Close, without saving"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="grid justify-items-center gap-2 pt-1 text-center">
          <img
            src={previewUri}
            alt=""
            className="size-24 rounded-full bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#f0f0ee] ring-4 ring-[#1f2f36] [[data-theme=light]_&]:ring-[#eef1f3]"
          />
          <h2 id="avatar-picker-title" className="m-0 mt-1 font-rethink-sans text-xl font-semibold text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
            Set up your profile
          </h2>
          <p className="m-0 max-w-[36ch] text-[13px] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
            Pick a look and a name — this is what other learners see on the leaderboard.
          </p>
        </div>

        <label className="grid gap-1.5 text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">
          Display name
          <input
            className="min-h-11 rounded-xl border border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-[#1f1f1f] [[data-theme=light]_&]:bg-white px-3.5 text-[15px] text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="What should we call you?"
            maxLength={40}
          />
        </label>

        <div className="grid gap-2">
          <span className="text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Style</span>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Avatar style">
            {AVATAR_STYLES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={entry.id === styleId}
                onClick={() => setStyleId(entry.id)}
                className={`flex-none rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap ${
                  entry.id === styleId
                    ? 'border-[#6699ec] bg-[#2f2e3e] text-[#f4f4f2] [[data-theme=light]_&]:bg-[#e4eaf4] [[data-theme=light]_&]:text-neutral-800'
                    : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1] bg-transparent text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:border-[#5a5a60]'
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-[13px] font-medium text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">Scroll for more options</span>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {PREVIEW_SEEDS.map((previewSeed) => (
              <button
                key={previewSeed}
                type="button"
                onClick={() => setSeed(previewSeed)}
                aria-pressed={previewSeed === seed}
                aria-label={`Choose this ${AVATAR_STYLES.find((entry) => entry.id === styleId)?.label} option`}
                className={`grid flex-none place-items-center rounded-2xl border-2 p-1 ${
                  previewSeed === seed ? 'border-[#6699ec]' : 'border-transparent hover:border-[#404040] [[data-theme=light]_&]:hover:border-[#e1e1e1]'
                }`}
              >
                <img src={getAvatarDataUri(styleId, previewSeed)} alt="" className="size-14 rounded-xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#f0f0ee]" />
              </button>
            ))}
          </div>
        </div>

        <ActionButton variant="primary" className="min-h-11 w-full text-[15px] font-semibold" onClick={save}>
          Save
        </ActionButton>
      </div>
    </div>
  )
}
