import { useEffect } from "react";
import { ModeSwitcher } from "@/features/timer/ModeSwitcher";
import { TimerCircle } from "@/features/timer/TimerCircle";
import { SettingsModal } from "@/features/settings/SettingsModal";
import { CoinBalance } from "@/features/shop/CoinBalance";
import { Shop } from "@/features/shop/Shop";
import { ActiveTaskBanner } from "@/features/tasks/ActiveTaskBanner";
import { TaskPanel } from "@/features/tasks/TaskPanel";
import { StatsPanel } from "@/features/stats/StatsPanel";
import { MusicPlayer } from "@/features/player/MusicPlayer";
import { HistoryModal } from "@/features/history/HistoryModal";
import { Spotify } from "@/features/spotify/Spotify";
import { usePomodoro } from "@/store/PomodoroContext";
import { formatClock } from "@/lib/timerAudio";
import styles from "./App.module.css";

export function App() {
  const { state, displayedRemainingMs, openSettings, openShop, openHistory, openSpotify } =
    usePomodoro();
  const isolateClock = state.shopOpen || state.spotifyOpen;
  const hideSideCards = isolateClock;

  useEffect(() => {
    document.title = `${formatClock(displayedRemainingMs)} · pomodoro`;
  }, [displayedRemainingMs]);

  return (
    <div className={`${styles.shell} ${isolateClock ? styles.sideFocus : ""}`}>
      <header className={styles.header}>
        <h1>pomodoro</h1>
      </header>

      <div className={styles.dashboard}>
        <div className={styles.tasks} {...(hideSideCards ? { inert: true, "aria-hidden": true } : {})}>
          <TaskPanel />
        </div>
        <div className={styles.timerCol}>
          <ModeSwitcher />
          <CoinBalance />
          <ActiveTaskBanner />
          <TimerCircle />
        </div>
        <div className={styles.stats} {...(hideSideCards ? { inert: true, "aria-hidden": true } : {})}>
          <StatsPanel />
          <MusicPlayer />
        </div>
      </div>

      <div className={styles.dock}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={openHistory}
          aria-label="Open history"
          aria-expanded={state.historyOpen}
        >
          <HistoryIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={openShop}
          aria-label="Open shop"
          aria-expanded={state.shopOpen}
        >
          <ShopIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={openSpotify}
          aria-label="Open Spotify"
          aria-expanded={state.spotifyOpen}
        >
          <SpotifyIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={openSettings}
          aria-label="Open settings"
          aria-expanded={state.settingsOpen}
        >
          <SettingsIcon />
        </button>
      </div>

      <SettingsModal />
      <Shop />
      <Spotify />
      <HistoryModal />
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M13 8v5.2l3.2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M5 8.5h16l-1.4 10.2A2 2 0 0 1 17.62 20.5H8.38a2 2 0 0 1-1.98-1.8L5 8.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 8.5V7a4 4 0 0 1 8 0v1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7.4 11.2c4.2-1.2 8.8-.7 11.8 1.3M7.8 14.4c3.4-1 7.2-.6 9.7 1.1M8.4 17.5c2.6-.8 5.5-.5 7.5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24.2 15.3c.05-.42.08-.86.08-1.3s-.03-.88-.08-1.3l2.62-2.05a.62.62 0 0 0 .15-.8l-2.48-4.3a.62.62 0 0 0-.75-.27l-3.09 1.24a9.9 9.9 0 0 0-2.25-1.3L17.9 2.7a.62.62 0 0 0-.61-.45h-4.96a.62.62 0 0 0-.61.45l-.5 3.28a9.9 9.9 0 0 0-2.25 1.3L5.88 6.04a.62.62 0 0 0-.75.27l-2.48 4.3a.62.62 0 0 0 .15.8L5.42 12.7c-.05.42-.08.86-.08 1.3s.03.88.08 1.3L2.8 17.35a.62.62 0 0 0-.15.8l2.48 4.3c.16.28.5.4.75.27l3.09-1.24a9.9 9.9 0 0 0 2.25 1.3l.5 3.28c.07.33.32.45.61.45h4.96c.29 0 .54-.12.61-.45l.5-3.28a9.9 9.9 0 0 0 2.25-1.3l3.09 1.24c.28.12.59 0 .75-.27l2.48-4.3a.62.62 0 0 0-.15-.8L24.2 15.3ZM14.12 18.2A4.2 4.2 0 1 1 14.12 9.8a4.2 4.2 0 0 1 0 8.4Z"
      />
    </svg>
  );
}
