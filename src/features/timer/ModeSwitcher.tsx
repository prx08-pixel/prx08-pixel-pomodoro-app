import { usePomodoro } from "@/store/PomodoroContext";
import type { TimerMode } from "@/domain/types";
import { MODE_LABEL } from "@/domain/defaults";
import styles from "./ModeSwitcher.module.css";

const MODES: TimerMode[] = ["pomodoro", "shortBreak", "longBreak"];

export function ModeSwitcher() {
  const { state, setMode } = usePomodoro();

  return (
    <div className={styles.track} role="tablist" aria-label="Timer mode">
      {MODES.map((mode) => {
        const active = state.timer.mode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.active : ""}`}
            onClick={() => setMode(mode)}
          >
            {MODE_LABEL[mode]}
          </button>
        );
      })}
    </div>
  );
}
