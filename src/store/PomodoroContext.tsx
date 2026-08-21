import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ACCENT_HEX, FONT_FAMILY, minutesToMs } from "@/domain/defaults";
import { appReducer } from "@/domain/reducer";
import { resolveWallpaperUrl } from "@/domain/shop";
import type { AppSettings, AppState, TimerMode } from "@/domain/types";
import { playCompletionChime } from "@/lib/timerAudio";
import {
  loadPersistedState,
  persistEconomy,
  persistProgression,
  persistSettings,
  persistStats,
  persistTasks,
} from "@/persistence/storage";

interface PomodoroContextValue {
  state: AppState;
  displayedRemainingMs: number;
  progress: number;
  setMode: (mode: TimerMode) => void;
  toggleRun: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  applySettings: (settings: AppSettings) => void;
  openShop: () => void;
  closeShop: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  openSpotify: () => void;
  closeSpotify: () => void;
  unlockTheme: (itemId: string) => void;
  equipTheme: (itemId: string) => void;
  selectTheme: (itemId: string) => void;
  clearWallpaper: () => void;
  setCustomWallpaper: (dataUrl: string, isPremiumUser: boolean) => void;
  clearCustomWallpaper: () => void;
  addTask: (title: string, estimatedPomodoros: number) => void;
  setActiveTask: (taskId: string | null) => void;
  completeTask: (taskId: string) => void;
  reopenTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  ackLevelUp: () => void;
  ackChest: () => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function now(): number {
  return Date.now();
}

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadPersistedState);
  const sessionCountRef = useRef(state.stats.sessions.length);

  useEffect(() => {
    persistSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    persistStats(state.stats.sessions, state.stats.pomodorosCompletedInCycle);
  }, [state.stats.sessions, state.stats.pomodorosCompletedInCycle]);

  useEffect(() => {
    persistEconomy(state.economy);
  }, [state.economy]);

  useEffect(() => {
    persistTasks(state.tasks);
  }, [state.tasks]);

  useEffect(() => {
    persistProgression(state.progression);
  }, [state.progression]);

  useEffect(() => {
    if (state.stats.sessions.length > sessionCountRef.current) {
      playCompletionChime();
    }
    sessionCountRef.current = state.stats.sessions.length;
  }, [state.stats.sessions.length]);

  useEffect(() => {
    if (state.timer.status !== "running") return;

    const tick = () => dispatch({ type: "TICK", now: now() });
    const id = window.setInterval(tick, 200);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state.timer.status]);

  const displayedRemainingMs = useMemo(() => {
    if (state.timer.status === "running" && state.timer.endsAt !== null) {
      return Math.max(0, state.timer.endsAt - now());
    }
    return state.timer.remainingMs;
  }, [state.timer]);

  const totalMs = minutesToMs(state.settings.durations[state.timer.mode]);
  const progress = totalMs === 0 ? 0 : displayedRemainingMs / totalMs;

  const setMode = useCallback((mode: TimerMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const toggleRun = useCallback(() => {
    dispatch({ type: "TOGGLE_RUN", now: now() });
  }, []);

  const openSettings = useCallback(() => {
    dispatch({ type: "OPEN_SETTINGS" });
  }, []);

  const closeSettings = useCallback(() => {
    dispatch({ type: "CLOSE_SETTINGS" });
  }, []);

  const applySettings = useCallback((settings: AppSettings) => {
    dispatch({ type: "APPLY_SETTINGS", settings, now: now() });
  }, []);

  const openShop = useCallback(() => {
    dispatch({ type: "OPEN_SHOP" });
  }, []);

  const closeShop = useCallback(() => {
    dispatch({ type: "CLOSE_SHOP" });
  }, []);

  const openHistory = useCallback(() => {
    dispatch({ type: "OPEN_HISTORY" });
  }, []);

  const closeHistory = useCallback(() => {
    dispatch({ type: "CLOSE_HISTORY" });
  }, []);

  const openSpotify = useCallback(() => {
    dispatch({ type: "OPEN_SPOTIFY" });
  }, []);

  const closeSpotify = useCallback(() => {
    dispatch({ type: "CLOSE_SPOTIFY" });
  }, []);

  const unlockTheme = useCallback((itemId: string) => {
    dispatch({ type: "UNLOCK_THEME", itemId });
  }, []);

  const equipTheme = useCallback((itemId: string) => {
    dispatch({ type: "EQUIP_THEME", itemId });
  }, []);

  const selectTheme = useCallback((itemId: string) => {
    dispatch({ type: "SELECT_THEME", itemId });
  }, []);

  const clearWallpaper = useCallback(() => {
    dispatch({ type: "CLEAR_WALLPAPER" });
  }, []);

  const setCustomWallpaper = useCallback((dataUrl: string, isPremiumUser: boolean) => {
    dispatch({ type: "SET_CUSTOM_WALLPAPER", dataUrl, isPremiumUser });
  }, []);

  const clearCustomWallpaper = useCallback(() => {
    dispatch({ type: "CLEAR_CUSTOM_WALLPAPER" });
  }, []);

  const addTask = useCallback((title: string, estimatedPomodoros: number) => {
    dispatch({ type: "ADD_TASK", title, estimatedPomodoros, now: now() });
  }, []);

  const setActiveTask = useCallback((taskId: string | null) => {
    dispatch({ type: "SET_ACTIVE_TASK", taskId });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: "COMPLETE_TASK", taskId, now: now() });
  }, []);

  const reopenTask = useCallback((taskId: string) => {
    dispatch({ type: "REOPEN_TASK", taskId });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: "DELETE_TASK", taskId });
  }, []);

  const ackLevelUp = useCallback(() => {
    dispatch({ type: "ACK_LEVEL_UP" });
  }, []);

  const ackChest = useCallback(() => {
    dispatch({ type: "ACK_CHEST" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      displayedRemainingMs,
      progress,
      setMode,
      toggleRun,
      openSettings,
      closeSettings,
      applySettings,
      openShop,
      closeShop,
      openHistory,
      closeHistory,
      openSpotify,
      closeSpotify,
      unlockTheme,
      equipTheme,
      selectTheme,
      clearWallpaper,
      setCustomWallpaper,
      clearCustomWallpaper,
      addTask,
      setActiveTask,
      completeTask,
      reopenTask,
      deleteTask,
      ackLevelUp,
      ackChest,
    }),
    [
      state,
      displayedRemainingMs,
      progress,
      setMode,
      toggleRun,
      openSettings,
      closeSettings,
      applySettings,
      openShop,
      closeShop,
      openHistory,
      closeHistory,
      openSpotify,
      closeSpotify,
      unlockTheme,
      equipTheme,
      selectTheme,
      clearWallpaper,
      setCustomWallpaper,
      clearCustomWallpaper,
      addTask,
      setActiveTask,
      completeTask,
      reopenTask,
      deleteTask,
      ackLevelUp,
      ackChest,
    ],
  );

  const wallpaperUrl = resolveWallpaperUrl(state.economy);

  return (
    <PomodoroContext.Provider value={value}>
      <div
        data-theme-root
        data-has-wallpaper={wallpaperUrl ? "true" : "false"}
        className={state.shopOpen || state.spotifyOpen ? "side-focus" : undefined}
        style={
          {
            "--accent": ACCENT_HEX[state.settings.appearance.color],
            "--font-app": FONT_FAMILY[state.settings.appearance.font],
            "--wallpaper": wallpaperUrl ? `url("${wallpaperUrl}")` : "none",
          } as CSSProperties
        }
      >
        {children}
      </div>
    </PomodoroContext.Provider>
  );
}

export function usePomodoro(): PomodoroContextValue {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within PomodoroProvider");
  }
  return context;
}
