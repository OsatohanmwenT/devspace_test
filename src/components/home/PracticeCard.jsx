export function PracticeCard({ homePracticeSessions, onStartPractice, onSeeAllPractice, className = '' }) {
  const topSession = homePracticeSessions[0]

  return (
    <section className={`flex flex-col border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] rounded-3xl bg-[#1f1f1f] [[data-theme=light]_&]:bg-[#fdfcf9] [[data-theme=light]_&]:shadow-none p-[22px] ${className}`}>
      <p className="m-0 text-[11px] font-semibold tracking-[0.1em] text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968]">PRACTICE</p>
      {topSession ? (
        <div className="mt-2.5 grid gap-0.5">
          <strong className="text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 text-[15px] font-semibold">{topSession.title}</strong>
          <span className="text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">{topSession.questions?.length ?? topSession.questionCount} questions</span>
        </div>
      ) : (
        <p className="mt-2.5 m-0 text-[#9a9a9d] [[data-theme=light]_&]:text-[#686968] text-[13px]">You're all caught up.</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        {topSession && (
          <button
            type="button"
            className="min-h-9 rounded-full border border-[#404040] [[data-theme=light]_&]:border-[#e8e6e1] bg-[#171717] [[data-theme=light]_&]:bg-white px-3.5 text-[13px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800 hover:border-[#5a5a60] [[data-theme=light]_&]:hover:border-[#d4d4d4]"
            onClick={() => onStartPractice(topSession.id)}
          >
            Start
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#88bdf2] [[data-theme=light]_&]:text-[#2563eb] hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#88bdf2] [[data-theme=light]_&]:focus-visible:outline-[#073c72] rounded"
          onClick={onSeeAllPractice}
        >
          See all <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
