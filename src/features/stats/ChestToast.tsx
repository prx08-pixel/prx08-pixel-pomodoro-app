import { useEffect } from "react";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./ChestToast.module.css";

export function ChestToast() {
  const { state, ackChest } = usePomodoro();
  const chest = state.progression.pendingChests[0];

  useEffect(() => {
    if (!chest) return;
    const id = window.setTimeout(() => ackChest(), 3200);
    return () => window.clearTimeout(id);
  }, [chest, ackChest]);

  if (!chest) return null;

  return (
    <div className={styles.toast} role="status">
      <span className={styles.chest} aria-hidden="true">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
          <rect x="2" y="10" width="24" height="12" rx="2" fill="currentColor" />
          <path d="M2 10 6 4h16l4 6" stroke="currentColor" strokeWidth="2" />
          <rect x="12" y="12" width="4" height="6" rx="1" fill="#141826" />
        </svg>
      </span>
      <p>{chest.headline}</p>
      <strong>{chest.reward}</strong>
    </div>
  );
}
