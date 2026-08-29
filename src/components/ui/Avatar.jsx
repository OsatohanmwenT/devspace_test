import { resolveAvatar } from '../../lib/avatarStyles'

const SIZES = {
  sm: 'size-7',
  md: 'size-10',
  lg: 'size-14',
}

// Every profile — the learner's own and every simulated rival's — gets a
// real DiceBear SVG (see lib/avatarStyles.js), not an initials circle.
// `avatarStyle`/`avatarSeed` are only ever set once someone has actually
// chosen a look; until then `resolveAvatar` derives a stable default from
// whatever seed is available, so nobody ever renders blank.
export function Avatar({ name, avatarStyle, avatarSeed, size = 'md', className = '' }) {
  const { uri } = resolveAvatar(avatarStyle, avatarSeed, avatarSeed || name)

  return (
    <span className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#262626] [[data-theme=light]_&]:bg-[#f0f0ee] ${SIZES[size] ?? SIZES.md} ${className}`}>
      <img src={uri} alt="" className="h-full w-full" aria-hidden="true" />
    </span>
  )
}
