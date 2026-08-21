import { useState, type FormEvent } from "react";
import { MAX_ESTIMATED_POMODOROS } from "@/domain/defaults";
import { usePomodoro } from "@/store/PomodoroContext";
import { ConfettiBurst } from "./ConfettiBurst";
import { CycleDots } from "./CycleDots";
import styles from "./TaskPanel.module.css";

export function TaskPanel() {
  const { state, addTask, setActiveTask, completeTask, reopenTask, deleteTask } = usePomodoro();
  const [title, setTitle] = useState("");
  const [estimate, setEstimate] = useState("1");
  const [burst, setBurst] = useState(0);

  const active = state.tasks.items.filter((task) => !task.completed);
  const done = state.tasks.items.filter((task) => task.completed);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const estimated = Number.parseInt(estimate, 10);
    addTask(title, Number.isFinite(estimated) ? estimated : 1);
    setTitle("");
    setEstimate("1");
  };

  return (
    <section className={styles.panel} aria-label="Tasks">
      <ConfettiBurst token={burst} />
      <header className={styles.header}>
        <h2>Tasks</h2>
        <p>Estimate cycles, then set one as active.</p>
      </header>

      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.titleInput}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
          maxLength={80}
          aria-label="Task name"
        />
        <label className={styles.estimate}>
          <span>Cycles</span>
          <input
            inputMode="numeric"
            value={estimate}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "" || /^\d{0,2}$/.test(next)) setEstimate(next);
            }}
            onBlur={() => {
              const parsed = Number.parseInt(estimate, 10);
              if (!Number.isFinite(parsed) || parsed < 1) setEstimate("1");
              else setEstimate(String(Math.min(MAX_ESTIMATED_POMODOROS, parsed)));
            }}
            aria-label="Estimated pomodoros"
          />
        </label>
        <button type="submit" className={styles.add} disabled={!title.trim()}>
          Add
        </button>
      </form>

      <div className={styles.list}>
        {active.length === 0 ? <p className={styles.empty}>No open tasks yet.</p> : null}
        {active.map((task) => {
          const isActive = state.tasks.activeTaskId === task.id;
          return (
            <article key={task.id} className={`${styles.card} ${isActive ? styles.cardActive : ""}`}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => {
                    completeTask(task.id);
                    setBurst((value) => value + 1);
                  }}
                  aria-label={`Complete ${task.title}`}
                />
              </label>
              <button type="button" className={styles.body} onClick={() => setActiveTask(task.id)}>
                <span className={styles.name}>{task.title}</span>
                <CycleDots completed={task.completedPomodoros} estimated={task.estimatedPomodoros} />
                <span className={styles.meta}>
                  {task.completedPomodoros}/{task.estimatedPomodoros || task.completedPomodoros || 1} ·{" "}
                  {isActive ? "Active" : "Set as active"}
                </span>
              </button>
              <button
                type="button"
                className={styles.delete}
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
              >
                ×
              </button>
            </article>
          );
        })}

        {done.length > 0 ? (
          <div className={styles.doneBlock}>
            <p className={styles.doneLabel}>Completed</p>
            {done.map((task) => (
              <article key={task.id} className={`${styles.card} ${styles.done}`}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked
                    onChange={() => reopenTask(task.id)}
                    aria-label={`Reopen ${task.title}`}
                  />
                </label>
                <div className={styles.body}>
                  <span className={styles.name}>{task.title}</span>
                  <CycleDots completed={task.completedPomodoros} estimated={task.estimatedPomodoros} />
                </div>
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
