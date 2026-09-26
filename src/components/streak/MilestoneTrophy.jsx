import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'

// The trophy badge artwork (devspace_trophy_badge.svg) rebuilt as layers so
// each part can arrive on its own — the unlock sequence from the reference
// recording: a dark badge-shaped socket, the badge assembling back to front,
// a burst as it locks in, a glass sheen sweeping across, then slow rotating
// rays and twinkles while the screen is read. The original's background
// square and stray stars are dropped; the viewBox is cropped to the badge.

const SHIELD =
  'M194 361 L384 315 L482 228 Q540 178 598 228 L696 315 L886 361 Q909 367 901 392 L849 552 L900 704 Q907 727 883 735 L701 786 L604 877 Q540 937 476 877 L379 786 L197 735 Q173 727 180 704 L231 552 L179 392 Q171 367 194 361 Z'
const PINK_BADGE =
  'M540 177 Q553 177 565 188 L686 304 L709 444 L801 542 L717 640 L692 841 L560 892 Q540 900 520 892 L388 841 L363 640 L279 542 L371 444 L394 304 L515 188 Q527 177 540 177 Z'
const HANDLE_LEFT = 'M317 515 H250 Q239 515 239 527 Q238 602 292 638 Q337 668 381 650'
const HANDLE_RIGHT = 'M763 515 H830 Q841 515 841 527 Q842 602 788 638 Q743 668 699 650'
const CUP = 'M318 482 Q307 482 307 494 L307 577 Q307 643 369 691 Q427 736 540 742 Q653 736 711 691 Q773 643 773 577 L773 494 Q773 482 762 482 Z'

// Seconds from mount. The burst lands at BURST — StreakMilestoneTransition
// times its confetti to the same moment.
export const TROPHY_BURST_AT = 0.95
const T = { rear: 0.12, shield: 0.3, cup: 0.55, lines: 0.78, burst: TROPHY_BURST_AT, sheen: 1.15, idle: 1.5 }

const pop = (delay, extra = {}) => ({
  initial: { scale: 0.4, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 260, damping: 16, delay, ...extra },
  style: { transformBox: 'fill-box', transformOrigin: '50% 50%' },
})

// Where the idle twinkles sit around the badge, as % of the stage.
const TWINKLES = [
  { left: '12%', top: '22%', size: 14, delay: 0 },
  { left: '84%', top: '16%', size: 18, delay: 0.8 },
  { left: '90%', top: '70%', size: 12, delay: 1.6 },
  { left: '8%', top: '74%', size: 16, delay: 1.1 },
  { left: '50%', top: '2%', size: 10, delay: 2.2 },
]

function Twinkle({ left, top, size, delay }) {
  return (
    <motion.svg
      className="absolute text-[#ffe66d]"
      style={{ left, top, width: size, height: size }}
      viewBox="0 0 24 24"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.2, 1, 0.2], rotate: [0, 45, 90] }}
      transition={{ duration: 2.4, delay: T.idle + delay, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="currentColor" />
    </motion.svg>
  )
}

// `tier` 1–3 scales how much light the idle state throws — a 3-day streak
// glows, day 100 blazes — the same proportional rule the confetti follows.
export function MilestoneTrophy({ tier = 1, className = '' }) {
  const reduceMotion = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const g = (name) => `${name}-${id}`
  const url = (name) => `url(#${g(name)})`
  const still = Boolean(reduceMotion)
  const layer = (delay) => (still ? {} : pop(delay))
  const raysOpacity = tier >= 3 ? 0.95 : tier === 2 ? 0.75 : 0.55

  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      {/* Slow rotating light rays behind the badge — the idle "it's yours" beat. */}
      <motion.div
        className="milestone-trophy-rays absolute inset-[-18%] rounded-full"
        initial={still ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: raysOpacity, scale: 1, rotate: still ? 0 : 360 }}
        transition={{
          opacity: { duration: 0.6, delay: still ? 0 : T.burst },
          scale: { duration: 0.8, delay: still ? 0 : T.burst, ease: [0.22, 1, 0.36, 1] },
          rotate: { duration: 40, repeat: Infinity, ease: 'linear', delay: T.burst },
        }}
      />

      {/* The empty socket the badge fills — the same dark silhouette an
          unearned badge slot shows, so earning it reads as filling that slot. */}
      <svg className="absolute inset-0 size-full" viewBox="140 150 800 810">
        <motion.path
          d={SHIELD}
          fill="rgb(255 255 255 / 0.06)"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth="8"
          initial={still ? false : { opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: still ? 0 : T.shield + 0.1 }}
        />
      </svg>

      <svg className="relative size-full overflow-visible" viewBox="140 150 800 810">
        <defs>
          <linearGradient id={g('purple')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6447FF" />
            <stop offset="55%" stopColor="#6E39FF" />
            <stop offset="100%" stopColor="#8444F3" />
          </linearGradient>
          <linearGradient id={g('pink')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F14B97" />
            <stop offset="100%" stopColor="#D83F82" />
          </linearGradient>
          <linearGradient id={g('gold')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE978" />
            <stop offset="45%" stopColor="#FFD85D" />
            <stop offset="100%" stopColor="#F89A36" />
          </linearGradient>
          <linearGradient id={g('gold2')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD96B" />
            <stop offset="100%" stopColor="#FF9F3E" />
          </linearGradient>
          <linearGradient id={g('cream')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFF5CF" />
            <stop offset="50%" stopColor="#FFF7DE" />
            <stop offset="100%" stopColor="#FFF0BA" />
          </linearGradient>
          <linearGradient id={g('cup')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFEC70" />
            <stop offset="36%" stopColor="#FFDA55" />
            <stop offset="38%" stopColor="#FFBE49" />
            <stop offset="100%" stopColor="#F8892D" />
          </linearGradient>
          <linearGradient id={g('stem')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFA53F" />
            <stop offset="100%" stopColor="#F07827" />
          </linearGradient>
          <linearGradient id={g('sheen')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id={g('softGlow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={g('smallGlow')} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={g('drop')} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.28" />
          </filter>
          <clipPath id={g('shieldClip')}>
            <path d={SHIELD} />
          </clipPath>
        </defs>

        {/* Gentle idle float once it has settled. */}
        <motion.g
          animate={still ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: T.idle }}
        >
          {/* Rear gold panels fan out first. */}
          <motion.g filter={url('drop')} {...layer(T.rear)}>
            <path d="M325 227 Q307 230 302 250 L273 367 L420 347 L425 276 Z" fill={url('gold')} stroke="#FFF0B0" strokeWidth="10" strokeLinejoin="round" />
            <path d="M755 227 Q773 230 778 250 L807 367 L660 347 L655 276 Z" fill={url('gold')} stroke="#FFF0B0" strokeWidth="10" strokeLinejoin="round" />
            <path d="M161 548 L262 447 L316 521 L232 610 Z" fill={url('gold2')} stroke="#FFCB69" strokeWidth="8" strokeLinejoin="round" />
            <path d="M919 548 L818 447 L764 521 L848 610 Z" fill={url('gold2')} stroke="#FFCB69" strokeWidth="8" strokeLinejoin="round" />
          </motion.g>

          {/* Pink badge and its translucent front panel. */}
          <motion.g {...layer(T.rear + 0.08)}>
            <path d={PINK_BADGE} fill={url('pink')} stroke="#F36AA8" strokeWidth="10" />
            <path d="M540 180 Q553 180 565 191 L671 296 L631 504 L449 504 L409 296 L515 191 Q527 180 540 180 Z" fill="#F0539A" opacity="0.72" />
            <path d="M444 248 L452 502" stroke="#FF8FBE" strokeWidth="7" opacity="0.42" />
            <path d="M636 248 L628 502" stroke="#FF8FBE" strokeWidth="7" opacity="0.42" />
          </motion.g>

          {/* The purple star shield drops into the socket. */}
          <motion.path
            d={SHIELD}
            fill={url('purple')}
            stroke="#765BFF"
            strokeWidth="12"
            strokeLinejoin="round"
            filter={url('softGlow')}
            {...layer(T.shield)}
          />

          {/* The inner neon lines draw themselves around the shield. */}
          <g filter={url('smallGlow')} fill="none" stroke="#fff" strokeLinecap="round" opacity="0.95">
            {[
              { d: 'M255 466 Q222 392 281 377 L376 351 Q393 347 411 329 L486 258 Q540 207 594 258 L669 329 Q687 347 704 351 L799 377 Q858 392 825 466', w: 10 },
              { d: 'M257 632 L233 706 Q228 722 244 727 L366 762', w: 9 },
              { d: 'M823 632 L847 706 Q852 722 836 727 L714 762', w: 9 },
            ].map((line, index) => (
              <motion.path
                key={index}
                d={line.d}
                strokeWidth={line.w}
                initial={still ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: T.lines + index * 0.06, ease: 'easeOut' }}
              />
            ))}
          </g>

          {/* The trophy rises into the shield. */}
          <motion.g
            initial={still ? false : { y: 70, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: T.cup }}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
          >
            <ellipse cx="540" cy="537" rx="94" ry="115" fill="#FFF4CA" opacity="0.45" filter={url('softGlow')} />
            <path d={HANDLE_LEFT} fill="none" stroke="#FFE56D" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            <path d={HANDLE_RIGHT} fill="none" stroke="#FFE56D" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            <path d={HANDLE_LEFT} fill="none" stroke="#F7B83F" strokeWidth="10" strokeLinecap="round" opacity="0.45" />
            <path d={HANDLE_RIGHT} fill="none" stroke="#F7B83F" strokeWidth="10" strokeLinecap="round" opacity="0.45" />
            <path d={CUP} fill={url('cup')} stroke="#FFF0A0" strokeWidth="7" strokeLinejoin="round" />
            <rect x="310" y="482" width="460" height="112" rx="10" fill={url('gold')} stroke="#FFF09E" strokeWidth="7" />
            <rect x="391" y="489" width="86" height="98" rx="6" fill={url('cream')} opacity="0.86" />
            <rect x="607" y="489" width="49" height="98" rx="6" fill={url('cream')} opacity="0.78" />
            <path d="M316 593 Q323 651 382 690 Q449 734 540 740 Q631 734 698 690 Q757 651 764 593 Z" fill="#F47D2C" opacity="0.22" />
            <path d="M500 726 H580 Q581 772 606 793 H474 Q499 772 500 726 Z" fill={url('stem')} />
            <rect x="438" y="777" width="204" height="55" rx="8" fill="#F2A23B" stroke="#F6B64B" strokeWidth="7" />
            <path d="M438 824 H642 L592 913 Q586 925 573 925 H507 Q494 925 488 913 Z" fill={url('gold2')} stroke="#F8B24A" strokeWidth="7" strokeLinejoin="round" />
            <path d="M340 508 H733" stroke="#FFF08D" strokeWidth="4" opacity="0.55" />
          </motion.g>

          {/* The star on top locks it in — the burst moment. */}
          <motion.path
            d="M540 290 L551 313 L576 324 L551 335 L540 360 L529 335 L504 324 L529 313 Z"
            fill="#FFE66D"
            filter={url('smallGlow')}
            {...(still ? {} : pop(T.burst, { stiffness: 420, damping: 12 }))}
          />

          {/* Glass sheen sweeping across the shield, clipped to its shape. */}
          {!still && (
            <g clipPath={url('shieldClip')}>
              <motion.rect
                y="150"
                width="220"
                height="820"
                fill={url('sheen')}
                transform="skewX(-18)"
                initial={{ x: 40 }}
                animate={{ x: 1180 }}
                transition={{ duration: 0.8, delay: T.sheen, ease: [0.4, 0, 0.2, 1] }}
              />
            </g>
          )}
        </motion.g>

        {/* Ring burst expanding out from the badge as it locks in. */}
        {!still && (
          <motion.circle
            cx="540"
            cy="560"
            r="300"
            fill="none"
            stroke="#FFE66D"
            strokeWidth="10"
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: [0.55, 0.6, 1.35], opacity: [0, 0.9, 0] }}
            transition={{ duration: 0.75, delay: T.burst, ease: 'easeOut', times: [0, 0.08, 1] }}
            style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
          />
        )}
      </svg>

      {!still && TWINKLES.slice(0, tier >= 3 ? 5 : tier === 2 ? 4 : 3).map((twinkle) => (
        <Twinkle key={`${twinkle.left}-${twinkle.top}`} {...twinkle} />
      ))}
    </div>
  )
}
