import { useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { LockIcon } from '../ui/icons'
import { getLeague } from '../../data/leagues'
import { ImageUploadError, readImageAsSquareDataUrl } from '../../lib/imageUpload'
import { AVATAR_STYLES, getAvatarDataUri, isStyleUnlocked, LOCKED_PREVIEW_SEED } from '../../lib/avatarStyles'

const FIELD_LABEL = 'text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FIELD_INPUT = 'rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-3 text-[15px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'

export function EditProfileModal({ profile, highestLeagueIndex = 0, onSave, onClose }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [photo, setPhoto] = useState(profile?.photo ?? null)
  const [avatarStyle, setAvatarStyle] = useState(profile?.avatarStyle ?? null)
  const [photoError, setPhotoError] = useState('')
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    // Cleared immediately so picking the same file again still fires onChange.
    event.target.value = ''
    if (!file) return

    setPhotoError('')
    setIsProcessingPhoto(true)
    try {
      const dataUrl = await readImageAsSquareDataUrl(file)
      setPhoto(dataUrl)
    } catch (error) {
      setPhotoError(error instanceof ImageUploadError ? error.message : 'Could not process that image')
    } finally {
      setIsProcessingPhoto(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({ name: name.trim(), headline: headline.trim(), bio: bio.trim(), photo, avatarStyle })
    onClose()
  }

  return (
    <Drawer id="edit-profile" title="Edit profile" onClose={onClose} labelledBy="edit-profile-title">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          <Avatar name={name || 'Learner'} photo={photo} avatarStyle={avatarStyle} avatarSeed={photo ? undefined : (name.trim() || 'you')} size="lg" />
          <div className="grid gap-1.5">
            <div className="flex flex-wrap gap-2">
              <ActionButton
                type="button"
                variant="neutral"
                className="min-h-9 px-3 text-[13px]"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingPhoto}
              >
                {isProcessingPhoto ? 'Processing…' : photo ? 'Change photo' : 'Add photo'}
              </ActionButton>
              {photo && (
                <ActionButton type="button" variant="neutral" className="min-h-9 px-3 text-[13px]" onClick={() => setPhoto(null)}>
                  Remove
                </ActionButton>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {photoError && <span className="text-[12px] text-[#ff676d] [[data-theme=light]_&]:text-[#b3272d]">{photoError}</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <span className={FIELD_LABEL}>Avatar style</span>
          <p className="m-0 text-[12px] leading-[1.5] text-[#7d7d80] [[data-theme=light]_&]:text-[#737371]">
            Unlocked as you climb the leaderboard — a photo, when you have one, is always shown instead.
          </p>
          <div className="grid grid-cols-5 gap-2 max-[480px]:grid-cols-4">
            {AVATAR_STYLES.map((style) => {
              const unlocked = isStyleUnlocked(style, highestLeagueIndex)
              const uri = getAvatarDataUri(style.id, unlocked ? (name.trim() || 'you') : LOCKED_PREVIEW_SEED)
              const selected = avatarStyle === style.id
              const unlockLabel = `Unlocks at ${getLeague(style.requiresLeagueIndex).name}`

              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={!unlocked}
                  aria-pressed={selected}
                  onClick={() => setAvatarStyle(style.id)}
                  title={unlocked ? style.label : unlockLabel}
                  className={`relative grid place-items-center rounded-xl border p-1.5 transition-colors ${selected ? 'border-[#6699ec] bg-[#1d2f5d]/40' : 'border-[#404040] [[data-theme=light]_&]:border-[#e1e1e1]'} ${unlocked ? 'hover:border-[#6699ec] cursor-pointer' : 'cursor-default'}`}
                >
                  <img src={uri} alt="" aria-hidden="true" className={`size-11 rounded-full ${unlocked ? '' : 'opacity-40 blur-[2px]'}`} />
                  {!unlocked && (
                    <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/25" aria-hidden="true">
                      <LockIcon className="size-4 text-white" />
                    </span>
                  )}
                  <span className="absolute w-px h-px overflow-hidden -m-px p-0 border-0 [clip:rect(0,0,0,0)] whitespace-nowrap">
                    {unlocked ? style.label : `${style.label} — ${unlockLabel}`}
                  </span>
                </button>
              )
            })}
          </div>
          {avatarStyle && (
            <button
              type="button"
              className="justify-self-start text-[12px] font-medium text-[#89baff] hover:underline [[data-theme=light]_&]:text-[#3d77eb]"
              onClick={() => setAvatarStyle(null)}
            >
              Use auto-assigned look instead
            </button>
          )}
        </div>

        <label className="grid gap-1.5">
          <span className={FIELD_LABEL}>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Your name" className={FIELD_INPUT} />
        </label>

        <label className="grid gap-1.5">
          <span className={FIELD_LABEL}>Headline</span>
          <input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            maxLength={80}
            placeholder="e.g. Aspiring Machine Learning Engineer"
            className={FIELD_INPUT}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={FIELD_LABEL}>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={400}
            rows={4}
            placeholder="A couple of sentences about you"
            className={`resize-none ${FIELD_INPUT}`}
          />
        </label>

        <ActionButton type="submit" className="min-h-12" disabled={isProcessingPhoto}>Save profile</ActionButton>
      </form>
    </Drawer>
  )
}
