import { rankForLevel, profileFromXp } from "@/domain/progression";
import { formatDuration } from "@/lib/dayStats";
import { usePomodoro } from "@/store/PomodoroContext";
import { ChestToast } from "./ChestToast";
import { LevelUpToast } from "./LevelUpToast";
import styles from "./StatsPanel.module.css";

export function StatsPanel() {
  const { state, openHistory, openShop } = usePomodoro();
  const { level, xpIntoLevel, xpForLevel } = profileFromXp(state.progression.totalXp);
  const rank = rankForLevel(level);
  const fill = xpForLevel === 0 ? 0 : xpIntoLevel / xpForLevel;
  const tasksSlain = state.tasks.items.filter((task) => task.completed).length;

  return (
    <section className={styles.panel} aria-label="Focus profile">
      <LevelUpToast />
      <ChestToast />
      <header className={styles.header}>
        <h2>Focus Profile</h2>
        <p>Level up with every focused minute.</p>
      </header>

      <div className={styles.levelCard}>
        <div className={`${styles.badge} ${styles[rank.tier]}`} aria-hidden="true">
          {level}
        </div>
        <div className={styles.levelCopy}>
          <p className={styles[rank.tier]}>Level {level}</p>
          <em className={styles[rank.tier]}>{rank.title}</em>
          <strong>
            {xpIntoLevel} / {xpForLevel} XP
          </strong>
        </div>
      </div>

      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={xpForLevel}
        aria-valuenow={xpIntoLevel}
        aria-label="Experience toward next level"
      >
        <span className={styles[rank.tier]} style={{ width: `${Math.min(100, fill * 100)}%` }} />
      </div>

      <div className={styles.metrics}>
        <article>
          <p>Daily streak</p>
          <strong>{state.progression.streak}</strong>
          <span>Best {state.progression.bestStreak}</span>
        </article>
        <article>
          <p>Total focus</p>
          <strong>{formatDuration(state.economy.focusMsAccumulated)}</strong>
        </article>
        <article className={styles.wide}>
          <p>Tasks slain</p>
          <strong>{tasksSlain}</strong>
        </article>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={openHistory}>
          History
        </button>
        <button type="button" onClick={openShop}>
          Shop
        </button>
      </div>
    </section>
  );
}
