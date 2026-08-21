import { createInitialState, DEFAULT_SETTINGS, EMPTY_TASKS } from "@/domain/defaults";
import { applyMilestones } from "@/domain/milestones";
import { progressionFromFocusMs, refreshStreak } from "@/domain/progression";
import { EMPTY_ECONOMY, mintCoinsFromFocus } from "@/domain/shop";
import type {
  AppSettings,
  AppState,
  CompletedSession,
  EconomyState,
  ProgressionState,
  Task,
  TasksState,
  WallpaperKind,
} from "@/domain/types";

const SETTINGS_KEY = "pomo.settings.v1";
const SESSIONS_KEY = "pomo.sessions.v1";
const CYCLE_KEY = "pomo.cycle.v1";
const ECONOMY_KEY = "pomo.economy.v1";
const CUSTOM_WALLPAPER_KEY = "pomo.custom-wallpaper.v1";
const TASKS_KEY = "pomo.tasks.v1";
const PROGRESSION_KEY = "pomo.progression.v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function parseSettings(value: unknown): AppSettings | null {
  if (!isObject(value) || !isObject(value.durations) || !isObject(value.appearance)) {
    return null;
  }

  const { pomodoro, shortBreak, longBreak } = value.durations;
  const { color, font } = value.appearance;

  if (
    typeof pomodoro !== "number" ||
    typeof shortBreak !== "number" ||
    typeof longBreak !== "number" ||
    (color !== "coral" && color !== "cyan" && color !== "purple") ||
    (font !== "kumbh" && font !== "slab" && font !== "mono")
  ) {
    return null;
  }

  return {
    durations: { pomodoro, shortBreak, longBreak },
    appearance: { color, font },
  };
}

function parseSessions(value: unknown): CompletedSession[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sessions: CompletedSession[] = [];
  for (const item of value) {
    if (
      !isObject(item) ||
      typeof item.id !== "string" ||
      (item.mode !== "pomodoro" && item.mode !== "shortBreak" && item.mode !== "longBreak") ||
      typeof item.durationMs !== "number" ||
      typeof item.completedAt !== "number"
    ) {
      continue;
    }

    sessions.push({
      id: item.id,
      mode: item.mode,
      durationMs: item.durationMs,
      completedAt: item.completedAt,
      taskId: typeof item.taskId === "string" ? item.taskId : null,
      taskName: typeof item.taskName === "string" ? item.taskName : null,
    });
  }
  return sessions;
}

function parseTask(value: unknown): Task | null {
  if (!isObject(value)) return null;
  if (typeof value.id !== "string" || typeof value.title !== "string") return null;
  if (typeof value.estimatedPomodoros !== "number" || typeof value.completedPomodoros !== "number") {
    return null;
  }
  if (typeof value.completed !== "boolean" || typeof value.createdAt !== "number") return null;

  return {
    id: value.id,
    title: value.title,
    estimatedPomodoros: Math.max(0, value.estimatedPomodoros),
    completedPomodoros: Math.max(0, value.completedPomodoros),
    completed: value.completed,
    createdAt: value.createdAt,
    completedAt: typeof value.completedAt === "number" ? value.completedAt : null,
    bonusAwarded: value.bonusAwarded === true,
  };
}

function parseTasks(value: unknown): TasksState {
  if (!isObject(value)) return { ...EMPTY_TASKS, items: [] };

  const items = Array.isArray(value.items)
    ? value.items.map(parseTask).filter((task): task is Task => task !== null)
    : [];
  const activeTaskId = typeof value.activeTaskId === "string" ? value.activeTaskId : null;

  return {
    items,
    activeTaskId: items.some((task) => task.id === activeTaskId && !task.completed)
      ? activeTaskId
      : null,
  };
}

function parseWallpaperKind(value: unknown): WallpaperKind | null {
  if (value === "none" || value === "shop" || value === "custom") return value;
  return null;
}

function parseEconomy(value: unknown): EconomyState | null {
  if (!isObject(value)) return null;

  const unlockedItemIds = Array.isArray(value.unlockedItemIds)
    ? value.unlockedItemIds.filter((id): id is string => typeof id === "string")
    : [];

  const wallpaper = isObject(value.activeWallpaper) ? value.activeWallpaper : null;
  const kind = parseWallpaperKind(wallpaper?.kind) ?? "none";

  if (
    typeof value.focusMsAccumulated !== "number" ||
    typeof value.coinsMinted !== "number" ||
    typeof value.starCoins !== "number"
  ) {
    return null;
  }

  return {
    focusMsAccumulated: Math.max(0, value.focusMsAccumulated),
    coinsMinted: Math.max(0, value.coinsMinted),
    starCoins: Math.max(0, Math.floor(value.starCoins)),
    unlockedItemIds: [...new Set(unlockedItemIds)],
    activeWallpaper: {
      kind,
      shopItemId: typeof wallpaper?.shopItemId === "string" ? wallpaper.shopItemId : null,
    },
    customWallpaperDataUrl:
      typeof value.customWallpaperDataUrl === "string" ? value.customWallpaperDataUrl : null,
  };
}

function readCustomWallpaper(): string | null {
  try {
    return localStorage.getItem(CUSTOM_WALLPAPER_KEY);
  } catch {
    return null;
  }
}

function parseProgression(value: unknown): ProgressionState | null {
  if (!isObject(value)) return null;
  if (typeof value.totalXp !== "number") return null;

  return {
    totalXp: Math.max(0, value.totalXp),
    streak: typeof value.streak === "number" ? Math.max(0, value.streak) : 0,
    bestStreak: typeof value.bestStreak === "number" ? Math.max(0, value.bestStreak) : 0,
    lastFocusDayKey: typeof value.lastFocusDayKey === "string" ? value.lastFocusDayKey : null,
    lastActiveAt: typeof value.lastActiveAt === "number" ? value.lastActiveAt : null,
    levelUpTo: null,
    unlockedMilestones: Array.isArray(value.unlockedMilestones)
      ? value.unlockedMilestones.filter(
          (id): id is ProgressionState["unlockedMilestones"][number] =>
            id === "streak-7" || id === "tasks-25" || id === "level-10",
        )
      : [],
    pendingChests: [],
  };
}

function economyFromSessions(sessions: CompletedSession[]): EconomyState {
  const focusMs = sessions
    .filter((session) => session.mode === "pomodoro")
    .reduce((sum, session) => sum + session.durationMs, 0);

  return mintCoinsFromFocus({ ...EMPTY_ECONOMY }, focusMs);
}

export function loadPersistedState(): AppState {
  const settings = parseSettings(readJson(SETTINGS_KEY)) ?? DEFAULT_SETTINGS;
  const sessions = parseSessions(readJson(SESSIONS_KEY));
  const cycleRaw = readJson(CYCLE_KEY);
  const pomodorosCompletedInCycle =
    typeof cycleRaw === "number" && Number.isFinite(cycleRaw) ? cycleRaw : 0;
  const storedEconomy = parseEconomy(readJson(ECONOMY_KEY));
  const customWallpaper = readCustomWallpaper();
  const tasks = parseTasks(readJson(TASKS_KEY));
  const storedProgression = parseProgression(readJson(PROGRESSION_KEY));
  const economy = storedEconomy
    ? {
        ...storedEconomy,
        customWallpaperDataUrl: customWallpaper ?? storedEconomy.customWallpaperDataUrl,
      }
    : economyFromSessions(sessions);
  const progression = refreshStreak(
    storedProgression ?? progressionFromFocusMs(economy.focusMsAccumulated),
    Date.now(),
  );

  const state = createInitialState(settings);
  return applyMilestones({
    ...state,
    stats: {
      sessions,
      pomodorosCompletedInCycle,
    },
    economy,
    tasks,
    progression: { ...progression, levelUpTo: null, pendingChests: [] },
  });
}

export function persistSettings(settings: AppSettings): void {
  writeJson(SETTINGS_KEY, settings);
}

export function persistStats(sessions: CompletedSession[], pomodorosCompletedInCycle: number): void {
  writeJson(SESSIONS_KEY, sessions);
  writeJson(CYCLE_KEY, pomodorosCompletedInCycle);
}

export function persistTasks(tasks: TasksState): void {
  writeJson(TASKS_KEY, tasks);
}

export function persistProgression(progression: ProgressionState): void {
  writeJson(PROGRESSION_KEY, {
    totalXp: progression.totalXp,
    streak: progression.streak,
    bestStreak: progression.bestStreak,
    lastFocusDayKey: progression.lastFocusDayKey,
    lastActiveAt: progression.lastActiveAt,
    unlockedMilestones: progression.unlockedMilestones,
  });
}

export function persistEconomy(economy: EconomyState): void {
  const { customWallpaperDataUrl, ...rest } = economy;
  writeJson(ECONOMY_KEY, rest);

  try {
    if (customWallpaperDataUrl) {
      localStorage.setItem(CUSTOM_WALLPAPER_KEY, customWallpaperDataUrl);
    } else {
      localStorage.removeItem(CUSTOM_WALLPAPER_KEY);
    }
  } catch {
    // Keep coins and unlocks even if the image exceeds quota.
  }
}

export function pomodoroDates(sessions: CompletedSession[]): string[] {
  const dates = new Set<string>();
  for (const session of sessions) {
    if (session.mode !== "pomodoro") continue;
    dates.add(new Date(session.completedAt).toISOString().slice(0, 10));
  }
  return [...dates].sort();
}
