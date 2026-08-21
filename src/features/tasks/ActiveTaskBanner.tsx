import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./ActiveTaskBanner.module.css";

export function ActiveTaskBanner() {
  const { state } = usePomodoro();
  const active = state.tasks.items.find((task) => task.id === state.tasks.activeTaskId);

  if (!active) {
    return <p className={styles.idle}>No active task</p>;
  }

  return (
    <p className={styles.active}>
      <span>Focusing on</span>
      <strong>{active.title}</strong>
    </p>
  );
}
