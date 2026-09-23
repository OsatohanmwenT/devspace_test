import { isRecommendedForPath, practiceSessions } from "../../data/practice";
import { ArrowLeftIcon } from "../ui/icons";
import { TopicIcon } from "../practice/TopicIcon";

const DAY_MS = 86400000;

// Today's session: one the Practice page recommends for the learner's path
// (falling back to all of them), rotating once a day so it's the same pick
// all day and a different one tomorrow.
export function getDailyPractice(path) {
  const matching = practiceSessions.filter((session) => isRecommendedForPath(session, path));
  const pool = matching.length > 0 ? matching : practiceSessions;
  const now = new Date();
  const dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / DAY_MS);
  return pool[dayIndex % pool.length];
}

// A tear-off calendar page with today's date on it — the one thing that
// changes every day is the thing the illustration shows.
function DailyIllustration({ done }) {
  const day = new Date().getDate();
  return (
    <svg className="home-daily-practice__art" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="daily-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#daily-tile)" />
      <g transform="rotate(-6 24 25)">
        <rect x="11" y="11" width="26" height="28" rx="6" fill="#fff" />
        <path d="M11 17a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v1H11z" fill="#c2410c" />
        <rect x="16" y="8" width="3" height="6" rx="1.5" fill="#7c2d12" />
        <rect x="29" y="8" width="3" height="6" rx="1.5" fill="#7c2d12" />
        {done ? (
          <path d="m17.5 28.5 4.5 4.5 8.5-9" fill="none" stroke="#16a34a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <text x="24" y="34.5" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1f2937" fontFamily="inherit">
            {day}
          </text>
        )}
      </g>
      <path d="M38 5.5l1.1 2.4 2.4 1.1-2.4 1.1L38 12.5l-1.1-2.4-2.4-1.1 2.4-1.1z" fill="#fff" opacity=".9" />
    </svg>
  );
}

export function DailyPracticeButton({ path, completedSessions = {}, onStart }) {
  const session = getDailyPractice(path);
  if (!session) return null;
  const done = completedSessions[session.id]?.completedAt === new Date().toDateString();

  return (
    <button
      type="button"
      className="home-daily-practice"
      data-done={done || undefined}
      onClick={() => onStart(session.id)}
      aria-label={done ? `Daily practice done: ${session.title}. Practice again` : `Start daily practice: ${session.title}`}
    >
      <DailyIllustration done={done} />
      <span className="home-daily-practice__text">
        <strong>{done ? "Daily practice done" : "Daily practice"}</strong>
        <span>
          <TopicIcon topic={session.topic} className="size-3.5 flex-none" />
          {session.title} · {session.minutes} min
        </span>
      </span>
      <span className="home-daily-practice__go" aria-hidden="true">
        <ArrowLeftIcon className="size-4 rotate-180" />
      </span>
    </button>
  );
}
