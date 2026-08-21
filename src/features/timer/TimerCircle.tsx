import { formatClock } from "@/lib/timerAudio";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./TimerCircle.module.css";

const RADIUS = 45.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerCircle() {
  const { state, displayedRemainingMs, progress, toggleRun } = usePomodoro();
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  const label =
    state.timer.status === "running"
      ? "PAUSE"
      : state.timer.status === "paused"
        ? "RESUME"
        : "START";

  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
          <circle className={styles.track} cx="50" cy="50" r={RADIUS} />
          <circle
            className={styles.progress}
            cx="50"
            cy="50"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.content}>
          <p className={styles.time} aria-live="polite">
            {formatClock(displayedRemainingMs)}
          </p>
          <button type="button" className={styles.action} onClick={toggleRun}>
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}
