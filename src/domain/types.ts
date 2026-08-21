export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export type AccentColor = "coral" | "cyan" | "purple";

export type AppFont = "kumbh" | "slab" | "mono";

export type ShopCategory = "nature" | "space" | "relaxing" | "premium";

export type WallpaperKind = "none" | "shop" | "custom";

export interface DurationSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export interface AppearanceSettings {
  color: AccentColor;
  font: AppFont;
}

export interface AppSettings {
  durations: DurationSettings;
  appearance: AppearanceSettings;
}

export interface TimerSnapshot {
  mode: TimerMode;
  status: TimerStatus;
  remainingMs: number;
  /** Wall-clock deadline while running. Null when paused/idle. */
  endsAt: number | null;
}

export interface CompletedSession {
  id: string;
  mode: TimerMode;
  durationMs: number;
  completedAt: number;
  taskId: string | null;
  taskName: string | null;
}

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
  bonusAwarded: boolean;
}

export interface TasksState {
  items: Task[];
  activeTaskId: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  description: string;
  imageUrl: string;
  price: number;
  hidden?: boolean;
  /** If set, the player must be at least this level to buy the item. */
  requiredLevel?: number;
  /** Shown on locked milestone-only items. */
  unlockHint?: string;
}

export interface ActiveWallpaper {
  kind: WallpaperKind;
  shopItemId: string | null;
}

export interface EconomyState {
  /** Completed pomodoro (focus) time only. */
  focusMsAccumulated: number;
  /** Lifetime coins minted from focus time. Never decreases. */
  coinsMinted: number;
  /** Spendable balance. */
  starCoins: number;
  unlockedItemIds: string[];
  activeWallpaper: ActiveWallpaper;
  customWallpaperDataUrl: string | null;
}

export type MilestoneId = "streak-7" | "tasks-25" | "level-10";

export interface ChestNotice {
  id: MilestoneId;
  headline: string;
  reward: string;
}

export interface ProgressionState {
  totalXp: number;
  streak: number;
  bestStreak: number;
  lastFocusDayKey: string | null;
  lastActiveAt: number | null;
  /** Set when a focus session causes a level-up. Cleared after the toast. */
  levelUpTo: number | null;
  unlockedMilestones: MilestoneId[];
  pendingChests: ChestNotice[];
}

export interface StatsState {
  sessions: CompletedSession[];
  pomodorosCompletedInCycle: number;
}

export interface AppState {
  settings: AppSettings;
  timer: TimerSnapshot;
  stats: StatsState;
  economy: EconomyState;
  tasks: TasksState;
  progression: ProgressionState;
  settingsOpen: boolean;
  shopOpen: boolean;
  historyOpen: boolean;
  spotifyOpen: boolean;
}
