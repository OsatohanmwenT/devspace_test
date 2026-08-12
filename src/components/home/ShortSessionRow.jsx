import { PracticeCard } from '../practice/PracticeCard'
import { BoltIcon } from '../ui/icons'

// Home's second reason to exist: something worth doing when there isn't time
// for a full lesson. Every card here is backed by real data.
export function ShortSessionRow({ sessions, completedSessions, onStartPractice, onSeeAll }) {
  if (sessions.length === 0) return null

  return (
    <section className="mt-9" aria-labelledby="short-session-title">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="short-session-title" className="font-rethink-sans text-[20px] font-medium text-[#f4f4f2] [[data-theme=light]_&]:text-neutral-800">
          Short on time?
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="inline-flex items-center gap-2 min-h-11 p-0 border-0 bg-transparent text-[15px] font-semibold text-[#f4f4f2] hover:text-[#88bdf2] focus-visible:rounded-lg focus-visible:outline-3 focus-visible:outline-[#88bdf2] focus-visible:outline-offset-3 [[data-theme=light]_&]:text-neutral-800 [[data-theme=light]_&]:hover:text-[#073c72]"
        >
          <BoltIcon className="w-5 h-5" />
          <span>All practice</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* flex-wrap lets cards grow to fill the row from the left, instead of
          grid-cols-3 leaving dead space (or a stray centered card) when there
          are fewer than three sessions. */}
      <div className="flex flex-wrap gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="min-w-[260px] max-w-[380px] flex-1 basis-[280px]">
            <PracticeCard
              session={session}
              completion={completedSessions[session.id]}
              onStart={onStartPractice}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
