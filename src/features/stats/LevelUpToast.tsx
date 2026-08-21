import { useEffect } from "react";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./LevelUpToast.module.css";

export function LevelUpToast() {
  const { state, ackLevelUp } = usePomodoro();
  const level = state.progression.levelUpTo;

  useEffect(() => {
    if (level === null) return;
    const id = window.setTimeout(() => ackLevelUp(), 2400);
    return () => window.clearTimeout(id);
  }, [level, ackLevelUp]);

  if (level === null) return null;

  return (
    <div className={styles.toast} role="status">
      <span className={styles.glow} />
      <p>Level up</p>
      <strong>{level}</strong>
    </div>
  );
}
