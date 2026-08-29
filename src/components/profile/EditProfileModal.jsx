import { useRef, useState } from 'react'
import { ActionButton } from '../ui/ActionButton'
import { Avatar } from '../ui/Avatar'
import { Drawer } from '../ui/Drawer'
import { ImageUploadError, readImageAsSquareDataUrl } from '../../lib/imageUpload'

const FIELD_LABEL = 'text-[13px] font-semibold text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]'
const FIELD_INPUT = 'rounded-xl border border-[#404040] bg-[#1f1f1f] px-3.5 py-3 text-[15px] text-[#f4f4f2] outline-none focus-visible:border-[#88bdf2] [[data-theme=light]_&]:border-[#e1e1e1] [[data-theme=light]_&]:bg-white [[data-theme=light]_&]:text-neutral-800'

export function EditProfileModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.name ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [photo, setPhoto] = useState(profile?.photo ?? null)
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
    onSave({ name: name.trim(), headline: headline.trim(), bio: bio.trim(), photo })
    onClose()
  }

  return (
    <Drawer id="edit-profile" title="Edit profile" onClose={onClose} labelledBy="edit-profile-title">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          <Avatar name={name || 'Learner'} photo={photo} size="lg" />
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
