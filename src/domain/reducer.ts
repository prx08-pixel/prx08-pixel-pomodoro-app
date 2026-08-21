import { clampMinutes, minutesToMs, POMODOROS_PER_LONG_BREAK } from "./defaults";
import { applyMilestones } from "./milestones";
import { awardFocusProgress } from "./progression";
import { canBuyShopItem, getShopItem, mintCoinsFromFocus, playerLevelFromXp } from "./shop";
import { addTask, completeTask, logPomodoroOnActiveTask } from "./tasks";
import type {
  AppSettings,
  AppState,
  CompletedSession,
  TimerMode,
} from "./types";

export type AppAction =
  | { type: "HYDRATE"; state: AppState }
  | { type: "SET_MODE"; mode: TimerMode }
  | { type: "TOGGLE_RUN"; now: number }
  | { type: "TICK"; now: number }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "OPEN_SHOP" }
  | { type: "CLOSE_SHOP" }
  | { type: "OPEN_HISTORY" }
  | { type: "CLOSE_HISTORY" }
  | { type: "OPEN_SPOTIFY" }
  | { type: "CLOSE_SPOTIFY" }
  | { type: "APPLY_SETTINGS"; settings: AppSettings; now: number }
  | { type: "SET_LAYOUT"; layout: AppSettings["layout"] }
  | { type: "UNLOCK_THEME"; itemId: string }
  | { type: "EQUIP_THEME"; itemId: string }
  | { type: "SELECT_THEME"; itemId: string }
  | { type: "CLEAR_WALLPAPER" }
  | { type: "SET_CUSTOM_WALLPAPER"; dataUrl: string; isPremiumUser: boolean }
  | { type: "CLEAR_CUSTOM_WALLPAPER" }
  | { type: "ADD_TASK"; title: string; estimatedPomodoros: number; now: number }
  | { type: "SET_ACTIVE_TASK"; taskId: string | null }
  | { type: "COMPLETE_TASK"; taskId: string; now: number }
  | { type: "REOPEN_TASK"; taskId: string }
  | { type: "DELETE_TASK"; taskId: string }
  | { type: "ACK_LEVEL_UP" }
  | { type: "ACK_CHEST" };

function durationFor(settings: AppSettings, mode: TimerMode): number {
  return minutesToMs(settings.durations[mode]);
}

function remainingWhileRunning(endsAt: number, now: number): number {
  return Math.max(0, endsAt - now);
}

function nextModeAfterComplete(
  completedMode: TimerMode,
  pomodorosInCycle: number,
): { mode: TimerMode; pomodorosInCycle: number } {
  if (completedMode !== "pomodoro") {
    return { mode: "pomodoro", pomodorosInCycle };
  }

  const nextCount = pomodorosInCycle + 1;
  if (nextCount >= POMODOROS_PER_LONG_BREAK) {
    return { mode: "longBreak", pomodorosInCycle: 0 };
  }

  return { mode: "shortBreak", pomodorosInCycle: nextCount };
}

function completeTimer(state: AppState, now: number): AppState {
  const activeTask = state.tasks.items.find((task) => task.id === state.tasks.activeTaskId);
  const isFocus = state.timer.mode === "pomodoro";
  const session: CompletedSession = {
    id: `${state.timer.mode}-${now}`,
    mode: state.timer.mode,
    durationMs: durationFor(state.settings, state.timer.mode),
    completedAt: now,
    taskId: isFocus ? (activeTask?.id ?? null) : null,
    taskName: isFocus ? (activeTask?.title ?? null) : null,
  };

  const { mode, pomodorosInCycle } = nextModeAfterComplete(
    state.timer.mode,
    state.stats.pomodorosCompletedInCycle,
  );

  const focusMs = isFocus ? session.durationMs : 0;
  const withSession: AppState = {
    ...state,
    timer: {
      mode,
      status: "idle",
      remainingMs: durationFor(state.settings, mode),
      endsAt: null,
    },
    stats: {
      sessions: [...state.stats.sessions, session],
      pomodorosCompletedInCycle: pomodorosInCycle,
    },
    economy: mintCoinsFromFocus(state.economy, focusMs),
    progression: isFocus
      ? awardFocusProgress(state.progression, focusMs, now)
      : state.progression,
  };

  return applyMilestones(isFocus ? logPomodoroOnActiveTask(withSession) : withSession);
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "OPEN_SETTINGS":
      return { ...state, settingsOpen: true, historyOpen: false };

    case "CLOSE_SETTINGS":
      return { ...state, settingsOpen: false };

    case "OPEN_SHOP":
      return { ...state, shopOpen: true, settingsOpen: false, historyOpen: false, spotifyOpen: false };

    case "CLOSE_SHOP":
      return { ...state, shopOpen: false };

    case "OPEN_HISTORY":
      return { ...state, historyOpen: true, settingsOpen: false };

    case "CLOSE_HISTORY":
      return { ...state, historyOpen: false };

    case "OPEN_SPOTIFY":
      return { ...state, spotifyOpen: true, settingsOpen: false, shopOpen: false, historyOpen: false };

    case "CLOSE_SPOTIFY":
      return { ...state, spotifyOpen: false };

    case "SET_MODE": {
      if (state.timer.mode === action.mode) {
        return state;
      }

      return {
        ...state,
        timer: {
          mode: action.mode,
          status: "idle",
          remainingMs: durationFor(state.settings, action.mode),
          endsAt: null,
        },
      };
    }

    case "TOGGLE_RUN": {
      if (state.timer.status === "running") {
        return {
          ...state,
          timer: {
            ...state.timer,
            status: "paused",
            remainingMs: remainingWhileRunning(state.timer.endsAt ?? action.now, action.now),
            endsAt: null,
          },
        };
      }

      return {
        ...state,
        timer: {
          ...state.timer,
          status: "running",
          endsAt: action.now + state.timer.remainingMs,
        },
      };
    }

    case "TICK": {
      if (state.timer.status !== "running" || state.timer.endsAt === null) {
        return state;
      }

      const remainingMs = remainingWhileRunning(state.timer.endsAt, action.now);
      if (remainingMs === 0) {
        return completeTimer(state, action.now);
      }

      if (remainingMs === state.timer.remainingMs) {
        return state;
      }

      return {
        ...state,
        timer: {
          ...state.timer,
          remainingMs,
        },
      };
    }

    case "APPLY_SETTINGS": {
      const settings = {
        ...action.settings,
        durations: {
          pomodoro: clampMinutes(action.settings.durations.pomodoro, "pomodoro"),
          shortBreak: clampMinutes(action.settings.durations.shortBreak, "shortBreak"),
          longBreak: clampMinutes(action.settings.durations.longBreak, "longBreak"),
        },
        layout: {
          showTasks: action.settings.layout?.showTasks !== false,
          showProfile: action.settings.layout?.showProfile !== false,
          showPlayer: action.settings.layout?.showPlayer !== false,
        },
      };
      const nextDuration = durationFor(settings, state.timer.mode);
      const wasRunning = state.timer.status === "running";

      return {
        ...state,
        settings,
        settingsOpen: false,
        timer: {
          ...state.timer,
          remainingMs: nextDuration,
          status: wasRunning ? "running" : "idle",
          endsAt: wasRunning ? action.now + nextDuration : null,
        },
      };
    }

    case "SET_LAYOUT":
      return {
        ...state,
        settings: {
          ...state.settings,
          layout: {
            showTasks: action.layout.showTasks,
            showProfile: action.layout.showProfile,
            showPlayer: action.layout.showPlayer,
          },
        },
      };

    case "UNLOCK_THEME":
    case "SELECT_THEME":
    case "EQUIP_THEME": {
      const item = getShopItem(action.itemId);
      if (!item) return state;

      const alreadyUnlocked = state.economy.unlockedItemIds.includes(item.id);

      if (alreadyUnlocked) {
        return {
          ...state,
          economy: {
            ...state.economy,
            activeWallpaper: {
              kind: "shop",
              shopItemId: item.id,
            },
          },
        };
      }

      if (action.type === "EQUIP_THEME") return state;
      if (
        !canBuyShopItem(
          item,
          playerLevelFromXp(state.progression.totalXp),
          state.economy.starCoins,
          state.economy.unlockedItemIds,
        )
      ) {
        return state;
      }

      return {
        ...state,
        economy: {
          ...state.economy,
          starCoins: state.economy.starCoins - item.price,
          unlockedItemIds: [...state.economy.unlockedItemIds, item.id],
          activeWallpaper: {
            kind: "shop",
            shopItemId: item.id,
          },
        },
      };
    }

    case "CLEAR_WALLPAPER":
      return {
        ...state,
        economy: {
          ...state.economy,
          activeWallpaper: {
            kind: "none",
            shopItemId: null,
          },
        },
      };

    case "SET_CUSTOM_WALLPAPER": {
      if (!action.isPremiumUser || !action.dataUrl) return state;

      return {
        ...state,
        economy: {
          ...state.economy,
          customWallpaperDataUrl: action.dataUrl,
          activeWallpaper: {
            kind: "custom",
            shopItemId: null,
          },
        },
      };
    }

    case "CLEAR_CUSTOM_WALLPAPER": {
      const nextKind =
        state.economy.activeWallpaper.kind === "custom"
          ? { kind: "none" as const, shopItemId: null }
          : state.economy.activeWallpaper;

      return {
        ...state,
        economy: {
          ...state.economy,
          customWallpaperDataUrl: null,
          activeWallpaper: nextKind,
        },
      };
    }

    case "ADD_TASK":
      return {
        ...state,
        tasks: addTask(state.tasks, action.title, action.estimatedPomodoros, action.now),
      };

    case "SET_ACTIVE_TASK": {
      if (action.taskId === null) {
        return { ...state, tasks: { ...state.tasks, activeTaskId: null } };
      }
      const task = state.tasks.items.find((item) => item.id === action.taskId);
      if (!task || task.completed) return state;
      return { ...state, tasks: { ...state.tasks, activeTaskId: action.taskId } };
    }

    case "COMPLETE_TASK":
      return applyMilestones(completeTask(state, action.taskId, action.now));

    case "REOPEN_TASK":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          items: state.tasks.items.map((item) =>
            item.id === action.taskId
              ? { ...item, completed: false, completedAt: null }
              : item,
          ),
        },
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: {
          items: state.tasks.items.filter((item) => item.id !== action.taskId),
          activeTaskId: state.tasks.activeTaskId === action.taskId ? null : state.tasks.activeTaskId,
        },
      };

    case "ACK_LEVEL_UP":
      if (state.progression.levelUpTo === null) return state;
      return {
        ...state,
        progression: { ...state.progression, levelUpTo: null },
      };

    case "ACK_CHEST":
      if (state.progression.pendingChests.length === 0) return state;
      return {
        ...state,
        progression: {
          ...state.progression,
          pendingChests: state.progression.pendingChests.slice(1),
        },
      };

    default:
      return state;
  }
}
