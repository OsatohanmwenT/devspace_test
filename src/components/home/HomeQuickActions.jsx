import { useEffect, useId, useRef, useState } from "react";
import { isRecommendedForPath, practiceSessions } from "../../data/practice";
import { TopicIcon } from "../practice/TopicIcon";
import { ArrowLeftIcon, CheckIcon } from "../ui/icons";

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

// A tear-off calendar page with today's date on it.
function CalendarArt({ done }) {
  const day = new Date().getDate();
  return (
    <svg className="home-quick-action__art" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="quick-tasks-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#quick-tasks-tile)" />
      <g transform="rotate(-6 24 25)">
        <rect x="11" y="11" width="26" height="28" rx="6" fill="#fff" />
        <path d="M11 17a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v1H11z" fill="#6d28d9" />
        <rect x="16" y="8" width="3" height="6" rx="1.5" fill="#3b0764" />
        <rect x="29" y="8" width="3" height="6" rx="1.5" fill="#3b0764" />
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

// A dumbbell — the same object the Practice tab uses as its icon.
function DumbbellArt({ done }) {
  return (
    <svg className="home-quick-action__art" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="quick-practice-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#quick-practice-tile)" />
      <g transform="rotate(-20 24 24)">
        <rect x="12" y="22" width="24" height="4" rx="2" fill="#7c2d12" />
        <rect x="8" y="15" width="6" height="18" rx="3" fill="#fff" />
        <rect x="34" y="15" width="6" height="18" rx="3" fill="#fff" />
        <rect x="4.5" y="19" width="4" height="10" rx="2" fill="#ffedd5" />
        <rect x="39.5" y="19" width="4" height="10" rx="2" fill="#ffedd5" />
      </g>
      {done ? (
        <g>
          <circle cx="37" cy="11" r="7" fill="#16a34a" stroke="#fff" strokeWidth="2" />
          <path d="m33.8 11 2.2 2.2 4-4.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <path d="M38 5.5l1.1 2.4 2.4 1.1-2.4 1.1L38 12.5l-1.1-2.4-2.4-1.1 2.4-1.1z" fill="#fff" opacity=".9" />
      )}
    </svg>
  );
}

export function DailyTasksButton({ dailyXp, xpGoal, lessonDoneToday, practiceDoneToday, onContinueLesson, onStartPractice }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const tasks = [
    {
      id: "xp",
      label: `Earn ${xpGoal} XP`,
      meta: `${Math.min(dailyXp, xpGoal)}/${xpGoal}`,
      done: dailyXp >= xpGoal,
      onClick: onContinueLesson,
    },
    { id: "lesson", label: "Finish a lesson", done: lessonDoneToday, onClick: onContinueLesson },
    { id: "practice", label: "Complete a practice", done: practiceDoneToday, onClick: onStartPractice },
  ];
  const doneCount = tasks.filter((task) => task.done).length;
  const allDone = doneCount === tasks.length;

  return (
    <div className="home-quick-tasks" ref={rootRef}>
      <button
        type="button"
        className="home-quick-action"
        data-done={allDone || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarArt done={allDone} />
        <span className="home-quick-action__text">
          <strong>Daily tasks</strong>
          <span>{allDone ? "All done for today" : `${doneCount} of ${tasks.length} done`}</span>
        </span>
      </button>
      {open && (
        <div className="home-quick-tasks__panel" id={panelId} role="group" aria-label="Today's tasks">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              className="home-quick-tasks__row"
              data-done={task.done || undefined}
              onClick={() => {
                setOpen(false);
                task.onClick();
              }}
            >
              <span className="home-quick-tasks__check" aria-hidden="true">
                {task.done && <CheckIcon className="size-3.5" />}
              </span>
              <span className="flex-1">{task.label}</span>
              {task.meta && <span className="home-quick-tasks__meta">{task.meta}</span>}
              <span className="sr-only">{task.done ? "done" : "not done"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PracticeButton({ path, completedSessions = {}, onStart, onSeeAll }) {
  const session = getDailyPractice(path);
  if (!session) return null;
  const done = completedSessions[session.id]?.completedAt === new Date().toDateString();

  return (
    <button
      type="button"
      className="home-quick-action"
      data-done={done || undefined}
      onClick={() => (done ? onSeeAll() : onStart(session.id))}
      aria-label={done ? "Practice done today. Browse more practice" : `Start practice: ${session.title}`}
    >
      <DumbbellArt done={done} />
      <span className="home-quick-action__text">
        <strong>{done ? "Practice done" : "Practice"}</strong>
        <span>
          <TopicIcon topic={session.topic} className="size-3.5 flex-none" />
          {done ? "Browse more sessions" : `${session.title} · ${session.minutes} min`}
        </span>
      </span>
      <span className="home-quick-action__go" aria-hidden="true">
        <ArrowLeftIcon className="size-4 rotate-180" />
      </span>
    </button>
  );
}
