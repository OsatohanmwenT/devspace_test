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

// Today's three tasks, opened from whatever trigger the caller passes as
// children (on Home it's the XP ring, which already tracks the daily goal).
// Clicks and keys stay inside so the card this sits in doesn't react.
export function DailyTasks({ dailyXp, xpGoal, lessonDoneToday, practiceDoneToday, onContinueLesson, onStartPractice, className = "", children }) {
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
    { id: "practice", label: "Warm up or practice", done: practiceDoneToday, onClick: onStartPractice },
  ];
  const doneCount = tasks.filter((task) => task.done).length;
  const allDone = doneCount === tasks.length;

  return (
    <div
      className="home-quick-tasks"
      ref={rootRef}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={className}
        data-done={allDone || undefined}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Today's tasks: ${allDone ? "all done" : `${doneCount} of ${tasks.length} done`}`}
        onClick={() => setOpen((current) => !current)}
      >
        {typeof children === "function" ? children({ doneCount, total: tasks.length }) : children}
      </button>
      {open && (
        <div className="home-quick-tasks__panel" id={panelId} role="group" aria-label="Today's tasks">
          <span className="home-quick-tasks__title">
            Today
            <span>{doneCount}/{tasks.length}</span>
          </span>
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

// A quiet secondary line under the main "Continue lesson" button — today's
// practice is an alternative to the lesson, not a peer of it.
export function PracticeLink({ path, completedSessions = {}, onStart, onSeeAll }) {
  const session = getDailyPractice(path);
  if (!session) return null;
  const done = completedSessions[session.id]?.completedAt === new Date().toDateString();

  return (
    <button
      type="button"
      className="home-practice-link"
      data-done={done || undefined}
      onClick={(event) => {
        event.stopPropagation();
        if (done) onSeeAll();
        else onStart(session.id);
      }}
    >
      {done ? (
        <>
          <CheckIcon className="size-3.5" />
          Practice done today · browse more
        </>
      ) : (
        <>
          <TopicIcon topic={session.topic} className="size-3.5 flex-none" />
          Or a {session.minutes}-min practice: {session.title}
        </>
      )}
      <ArrowLeftIcon className="size-3.5 rotate-180" />
    </button>
  );
}
