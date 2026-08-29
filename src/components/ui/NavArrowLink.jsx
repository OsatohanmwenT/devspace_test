// Same visual language as the "My learning" back button in
// paths/LearningPathDetail.jsx — bold, neutral-color text with a chevron,
// not a blue underlined link. Used for the small in-page navigation links
// (back to the league board, forward into a sub-view) that sit above the
// main content rather than acting as a page-level nav.
const BASE = 'inline-flex items-center gap-1.5 min-h-9 p-0 border-0 bg-transparent text-[14px] font-semibold text-[#f4f4f2] hover:text-[#88bdf2] [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:text-[#073c72] focus-visible:rounded-lg focus-visible:outline-3 focus-visible:outline-[#9db5d7] focus-visible:outline-offset-3'

function Chevron({ direction }) {
  return (
    <svg className="w-4 h-4 flex-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={direction === 'back' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BackLink({ children, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`${BASE} ${className}`}>
      <Chevron direction="back" />
      <span>{children}</span>
    </button>
  )
}

export function ForwardLink({ children, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`${BASE} ${className}`}>
      <span>{children}</span>
      <Chevron direction="forward" />
    </button>
  )
}
