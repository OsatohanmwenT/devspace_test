import { resolveAvatar } from '../../lib/avatarStyles'

const PALETTE = ['#6699ec', '#04adc0', '#e08a3c', '#7fb069', '#e0607e', '#5fb8ff']
const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-10 text-[15px]',
  lg: 'size-14 text-xl',
}

function colorForName(name) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

// Three tiers, in order: a real uploaded `photo` wins if set; otherwise an
// explicit `avatarSeed` (a rival's id, a learner's own id — anything stable)
// renders a generated DiceBear avatar instead of a bare colored initial —
// same style+seed always produces the same image (see lib/avatarStyles.js),
// so a rival's look never shuffles between renders. `avatarSeed` is opt-in:
// every call site that doesn't pass one keeps today's plain initials circle
// exactly as before.
export function Avatar({ name, photo, avatarStyle, avatarSeed, size = 'md', className = '' }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? '?'
  const sizeClasses = SIZES[size] ?? SIZES.md

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className={`inline-block shrink-0 rounded-full object-cover ${sizeClasses} ${className}`}
      />
    )
  }

  if (avatarSeed) {
    const { uri } = resolveAvatar(avatarStyle, avatarSeed, avatarSeed)
    return (
      <span className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#f0f0ee] ${sizeClasses} ${className}`}>
        <img src={uri} alt="" className="h-full w-full" aria-hidden="true" />
      </span>
    )
  }

  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-rethink-sans font-semibold text-white ${sizeClasses} ${className}`} style={{ background: colorForName(name ?? '') }} aria-hidden="true">
      {initial}
    </span>
  )
}
