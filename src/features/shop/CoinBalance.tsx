import { FOCUS_MS_PER_STAR_COIN } from "@/domain/shop";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./CoinBalance.module.css";

export function CoinBalance() {
  const { state } = usePomodoro();
  const { starCoins, focusMsAccumulated, coinsMinted } = state.economy;
  const towardNext = focusMsAccumulated - coinsMinted * FOCUS_MS_PER_STAR_COIN;
  const progress = towardNext / FOCUS_MS_PER_STAR_COIN;

  return (
    <div className={styles.chip} title="1 Star Coin per 45 minutes of completed focus time">
      <span className={styles.star} aria-hidden="true">
        ★
      </span>
      <div>
        <p className={styles.value}>{starCoins}</p>
        <p className={styles.label}>Star Coins</p>
      </div>
      <span className={styles.meter} aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }} />
      </span>
    </div>
  );
}
