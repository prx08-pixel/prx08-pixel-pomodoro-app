import { useEffect, useId, useMemo } from "react";
import { usePomodoro } from "@/store/PomodoroContext";
import { MODE_LABEL } from "@/domain/defaults";
import { dayKey, formatDuration, todaysCompletedTasks, todaysFocusMs } from "@/lib/dayStats";
import styles from "./HistoryModal.module.css";

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

export function HistoryModal() {
  const { state, closeHistory } = usePomodoro();
  const titleId = useId();

  useEffect(() => {
    if (!state.historyOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeHistory();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.historyOpen, closeHistory]);

  const today = dayKey(Date.now());

  const summary = useMemo(
    () => ({
      tasksToday: todaysCompletedTasks(state.tasks.items, today),
      focusMs: todaysFocusMs(state.stats.sessions, today),
    }),
    [state.stats.sessions, state.tasks.items, today],
  );

  const recent = [...state.stats.sessions].reverse().slice(0, 20);

  if (!state.historyOpen) return null;

  return (
    <div className={styles.backdrop} onClick={closeHistory}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId}>History</h2>
          <button type="button" className={styles.close} onClick={closeHistory} aria-label="Close history">
            ×
          </button>
        </header>

        <div className={styles.stats}>
          <article>
            <p>Tasks done today</p>
            <strong>{summary.tasksToday}</strong>
          </article>
          <article>
            <p>Focus time today</p>
            <strong>{formatDuration(summary.focusMs)}</strong>
          </article>
        </div>

        <h3 className={styles.sub}>Recent sessions</h3>
        <div className={styles.log}>
          {recent.length === 0 ? <p className={styles.empty}>No sessions yet.</p> : null}
          {recent.map((session) => (
            <article key={session.id} className={styles.row}>
              <div>
                <p className={styles.task}>
                  {session.mode === "pomodoro"
                    ? session.taskName ?? "Unassigned focus"
                    : MODE_LABEL[session.mode]}
                </p>
                <p className={styles.when}>{formatTime(session.completedAt)}</p>
              </div>
              <span>{formatDuration(session.durationMs)}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
