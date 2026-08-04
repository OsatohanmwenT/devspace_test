const TONE = {
  promoted: { accent: '#04adc0', surface: 'bg-[#213c3f] [[data-theme=light]_&]:bg-[#cee9ed]' },
  demoted: { accent: '#ff676d', surface: 'bg-[#442f30] [[data-theme=light]_&]:bg-[#f6e1e2]' },
  stayed: { accent: '#6f66ec', surface: 'bg-[#2a293c] [[data-theme=light]_&]:bg-[#f1f0fd]' },
}

export function LeagueResultBanner({ result, onDismiss }) {
  const tone = TONE[result.outcome] ?? TONE.stayed

  const message = result.outcome === 'promoted'
    ? `You finished ${result.rank}${result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : result.rank === 3 ? 'rd' : 'th'} and moved up to ${result.toLeague}.`
    : result.outcome === 'demoted'
      ? `You finished ${result.rank}th and dropped to ${result.toLeague}.`
      : `You finished ${result.rank}th and held your place in ${result.fromLeague}.`

  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-2xl ${tone.surface}`} role="status">
      <div className="grid gap-1">
        <strong className="text-[13px] font-semibold uppercase tracking-[.08em]" style={{ color: tone.accent }}>Last week's result</strong>
        <span className="text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] text-[15px]">{message}</span>
        <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{result.score.toLocaleString()} px earned</span>
      </div>
      <button
        type="button"
        className="grid w-9 h-9 flex-none place-items-center border-0 rounded-lg bg-transparent text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] hover:text-[#f4f4f2] [[data-theme=light]_&]:hover:text-[#202020] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#6f66ec]"
        onClick={onDismiss}
        aria-label="Dismiss last week's result"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}
