import styles from "./CycleDots.module.css";

export function CycleDots({ completed, estimated }: { completed: number; estimated: number }) {
  const total = Math.max(estimated, completed, 1);
  const shown = Math.min(total, 12);

  return (
    <span className={styles.row} aria-label={`${completed} of ${estimated || completed} pomodoros`}>
      {Array.from({ length: shown }, (_, index) => (
        <span
          key={index}
          className={`${styles.dot} ${index < completed ? styles.filled : ""}`}
        />
      ))}
      {total > shown ? <span className={styles.more}>+{total - shown}</span> : null}
    </span>
  );
}
