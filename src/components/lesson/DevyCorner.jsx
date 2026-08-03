export function DevyCorner({ expanded, onToggleExpand }) {
  return (
    <div className="lesson-devy-launcher">
      <span className="lesson-devy-avatar" aria-hidden="true">
        <img src="/assets/devy.svg" alt="" />
      </span>
      <div className="lesson-devy-quick-actions">
        <button
          type="button"
          className="lesson-devy-quick-action"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse Devy chat' : 'Expand Devy chat'}
          onClick={onToggleExpand}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v10H8l-4 4V5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="lesson-devy-quick-action" aria-label="Use microphone">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

