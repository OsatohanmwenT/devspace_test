import { PracticeCard } from '../practice/PracticeCard'

// Home's second reason to exist: something worth doing when there isn't time
// for a full lesson. Every card here is backed by real data — practice sessions
// carry their own `minutes` and question counts.
export function ShortSessionRow({ sessions, completedSessions, onStartPractice, onSeeAll }) {
  if (sessions.length === 0) return null

  return (
    <section className="mt-9" aria-labelledby="short-session-title">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="short-session-title" className="font-['Rethink_Sans',Arial,sans-serif] text-[20px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020]">
          Short on time?
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-[13px] text-[#9a9a9d] hover:text-[#f4f4f2] focus-visible:rounded focus-visible:outline-3 focus-visible:outline-[#888df2] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-[#686968] [[data-theme=light]_&]:hover:text-[#202020]"
        >
          All practice →
        </button>
      </div>
      {/* Breakpoints are wider than the app's usual 900/680 because this row
          sits in the main column, which the 300px sidebar already narrows. */}
      <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[680px]:grid-cols-1">
        {sessions.map((session) => (
          <PracticeCard
            key={session.id}
            session={session}
            completion={completedSessions[session.id]}
            onStart={onStartPractice}
          />
        ))}
      </div>
    </section>
  )
}
