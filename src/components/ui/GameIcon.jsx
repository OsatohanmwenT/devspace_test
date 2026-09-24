// The illustrated game icons (coins, chest, lightning, lock…) as one component,
// so a screen picks an icon by name rather than a file path. Each is a small
// transparent WebP in /assets/icons, cropped to the artwork and exported at
// about twice its largest on-screen size.
const SOURCES = {
  'devy-dumbbell': '/assets/icons/devy-dumbbell.webp',
  'devy-treasure-chest': '/assets/icons/devy-treasure-chest.webp',
  'lightning-bolt': '/assets/icons/lightning-bolt.webp',
  'daily-tasks-notebook': '/assets/icons/daily-tasks-notebook.webp',
  'treasure-chest': '/assets/icons/treasure-chest.webp',
  'gold-coin': '/assets/icons/gold-coin.webp',
  'coin-stack': '/assets/icons/coin-stack.webp',
  'shield-keyhole': '/assets/icons/shield-keyhole.webp',
  padlock: '/assets/icons/padlock.webp',
}

export function GameIcon({ name, className = '', alt = '', ...rest }) {
  const src = SOURCES[name]
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      draggable="false"
      decoding="async"
      className={`select-none object-contain ${className}`.trim()}
      {...rest}
    />
  )
}

// A season coin sized to the text around it — replaces the 🪙 emoji, which
// renders differently (or not at all) from one OS to the next.
export function CoinIcon({ className = '' }) {
  return <GameIcon name="gold-coin" className={`inline-block size-[1.15em] -translate-y-[0.08em] align-middle ${className}`} />
}
