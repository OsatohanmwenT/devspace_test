import { useEffect, useId, useRef, useState } from "react";
import { getDailyQuests } from "../../lib/dailyQuests";
import { CheckIcon } from "../ui/icons";

const QUESTS_SEEN_KEY = "devspace-daily-quests-seen";

// When the checklist was last opened, and how many quests were done then — so
// the trigger can carry a dot on the first visit of each day and again when a
// quest gets completed, the way games flag their missions button.
function readQuestsSeen() {
  try {
    return JSON.parse(window.localStorage.getItem(QUESTS_SEEN_KEY)) ?? null;
  } catch {
    return null;
  }
}

// Today's three quests, opened from whatever trigger the caller passes as
// children (on Home it's the XP ring, which already tracks the daily goal).
// Children can be a function of { doneCount, total, unseen }.
// Clicks and keys stay inside so the card this sits in doesn't react.
export function DailyTasks({ dailyXp, xpGoal, lessonDoneToday, practiceDoneToday, onContinueLesson, onStartPractice, className = "", children }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readQuestsSeen);
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

  const quests = getDailyQuests({ dailyXp, xpGoal, lessonDoneToday, practiceDoneToday });
  const tasks = quests.map((quest) => ({
    ...quest,
    meta: quest.target > 1 ? `${quest.current}/${quest.target}` : null,
    onClick: quest.id === "practice" ? onStartPractice : onContinueLesson,
  }));
  const doneCount = tasks.filter((task) => task.done).length;
  const allDone = doneCount === tasks.length;
  const today = new Date().toDateString();
  const unseen = seen?.date !== today || doneCount > (seen?.done ?? 0);

  const toggle = () => {
    if (!open) {
      const next = { date: today, done: doneCount };
      setSeen(next);
      try {
        window.localStorage.setItem(QUESTS_SEEN_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — the dot just comes back next visit
      }
    }
    setOpen((current) => !current);
  };

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
        aria-label={`Daily quests: ${allDone ? "all done" : `${doneCount} of ${tasks.length} done`}${unseen ? ", new" : ""}`}
        onClick={toggle}
      >
        {typeof children === "function" ? children({ doneCount, total: tasks.length, unseen }) : children}
      </button>
      {open && (
        <div className="home-quick-tasks__panel" id={panelId} role="group" aria-label="Daily quests">
          <span className="home-quick-tasks__title">
            Daily quests
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

