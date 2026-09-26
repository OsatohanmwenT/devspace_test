// A profile theme is one banner plus the accent colour that echoes it through
// the rest of the page — the avatar's fallback, the XP bar, section icons and
// the availability pill — so a banner never sits on the page by itself.
// An uploaded banner image replaces the art but keeps the chosen accent.
export const BANNER_THEMES = [
  {
    id: 'tide',
    label: 'Tide',
    accent: '#6699ec',
    background:
      'repeating-linear-gradient(135deg, rgb(255 255 255 / .09) 0 1px, transparent 1px 10px), radial-gradient(120% 140% at 0% 0%, #3f6fd8 0%, transparent 55%), linear-gradient(120deg, #1d3a7a, #2b5bc4 55%, #6699ec)',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    accent: '#2fc7a4',
    background:
      'radial-gradient(60% 120% at 15% 110%, #2fc7a4 0%, transparent 60%), radial-gradient(55% 110% at 70% -10%, #6c5ce7 0%, transparent 60%), radial-gradient(40% 90% at 100% 100%, #1fa2c9 0%, transparent 65%), #13213a',
  },
  {
    id: 'ember',
    label: 'Ember',
    accent: '#f2844e',
    background:
      'radial-gradient(70% 140% at 100% 0%, #ffb36b 0%, transparent 55%), radial-gradient(60% 120% at 0% 100%, #c2345a 0%, transparent 60%), linear-gradient(110deg, #5b1a2e, #d45a3a)',
  },
  {
    id: 'grove',
    label: 'Grove',
    accent: '#46b97c',
    background:
      'radial-gradient(circle at 1px 1px, rgb(255 255 255 / .16) 1px, transparent 0) 0 0 / 14px 14px, linear-gradient(115deg, #0f3d2c, #1e7a52 60%, #7fd1a1)',
  },
  {
    id: 'orchid',
    label: 'Orchid',
    accent: '#a98bf5',
    background:
      'radial-gradient(60% 130% at 85% 20%, #f39bd0 0%, transparent 58%), radial-gradient(70% 140% at 10% 90%, #6e56d8 0%, transparent 60%), #2a1d4e',
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    accent: '#e8a92c',
    background:
      'repeating-radial-gradient(circle at 50% 160%, rgb(255 255 255 / .1) 0 2px, transparent 2px 22px), linear-gradient(180deg, #f7c95c, #e88a3c 60%, #b94f45)',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    accent: '#9aa3b2',
    background:
      'linear-gradient(rgb(255 255 255 / .06) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, rgb(255 255 255 / .06) 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(120deg, #1c1f26, #3a404c)',
  },
]

export const DEFAULT_BANNER_THEME = BANNER_THEMES[0]

export function getBannerTheme(id) {
  return BANNER_THEMES.find((theme) => theme.id === id) ?? DEFAULT_BANNER_THEME
}

export function ProfileBanner({ theme, image, className = '', children }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: theme.background }}
    >
      {/* A soft floor so the avatar ring and any overlaid buttons always sit on
          something calm, whatever the banner art does at its bottom edge. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
      {children}
    </div>
  )
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

export function LinkIcon({ kind, className = 'size-4' }) {
  switch (kind) {
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.38.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
        </svg>
      )
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.72H5.57L16.67 19.2Z" />
        </svg>
      )
    case 'email':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" {...stroke} />
          <path d="m4 7 8 6 8-6" {...stroke} />
        </svg>
      )
    case 'phone':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" {...stroke} />
        </svg>
      )
    case 'location':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" {...stroke} />
          <circle cx="12" cy="10" r="2.3" {...stroke} />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...stroke} />
          <path d="M3.5 10h17M8 3v4M16 3v4" {...stroke} />
        </svg>
      )
    case 'website':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...stroke} />
          <path d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3Z" {...stroke} />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" {...stroke} />
        </svg>
      )
  }
}
