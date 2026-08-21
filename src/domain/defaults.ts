import type {
  AccentColor,
  AppFont,
  AppSettings,
  AppState,
  DurationSettings,
  TasksState,
  TimerMode,
} from "./types";
import { EMPTY_ECONOMY } from "./shop";
import { EMPTY_PROGRESSION } from "./progression";

export const TASK_COMPLETE_BONUS = 1;
export const MAX_ESTIMATED_POMODOROS = 12;

export const EMPTY_TASKS: TasksState = {
  items: [],
  activeTaskId: null,
};

export const MINUTES = {
  min: 1,
  maxBreak: 60,
  maxPomodoro: 120,
} as const;

export function maxMinutesFor(key: keyof DurationSettings): number {
  return key === "pomodoro" ? MINUTES.maxPomodoro : MINUTES.maxBreak;
}

export function clampMinutes(value: number, key: keyof DurationSettings): number {
  if (!Number.isFinite(value)) return MINUTES.min;
  return Math.min(maxMinutesFor(key), Math.max(MINUTES.min, Math.round(value)));
}

export const POMODOROS_PER_LONG_BREAK = 4;

export const ACCENT_HEX: Record<AccentColor, string> = {
  coral: "#f87070",
  cyan: "#70f3f8",
  purple: "#d881f8",
};

export const FONT_FAMILY: Record<AppFont, string> = {
  kumbh: '"Kumbh Sans", sans-serif',
  slab: '"Roboto Slab", serif',
  mono: '"Space Mono", monospace',
};

export const DEFAULT_SETTINGS: AppSettings = {
  durations: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  appearance: {
    color: "coral",
    font: "kumbh",
  },
};

export const MODE_LABEL: Record<TimerMode, string> = {
  pomodoro: "pomodoro",
  shortBreak: "short break",
  longBreak: "long break",
};

export function minutesToMs(minutes: number): number {
  return Math.round(minutes * 60 * 1000);
}

export function createInitialState(settings: AppSettings = DEFAULT_SETTINGS): AppState {
  return {
    settings,
    timer: {
      mode: "pomodoro",
      status: "idle",
      remainingMs: minutesToMs(settings.durations.pomodoro),
      endsAt: null,
    },
    stats: {
      sessions: [],
      pomodorosCompletedInCycle: 0,
    },
    economy: { ...EMPTY_ECONOMY },
    tasks: { ...EMPTY_TASKS, items: [] },
    progression: { ...EMPTY_PROGRESSION },
    settingsOpen: false,
    shopOpen: false,
    historyOpen: false,
    spotifyOpen: false,
  };
}
