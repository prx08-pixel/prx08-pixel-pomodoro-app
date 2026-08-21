import { dayKey, previousDayKey } from "@/lib/dayStats";
import type { ProgressionState } from "./types";

export const XP_PER_FOCUS_MINUTE = 10;

/** TEMP: 5 XP per level for testing. Restore to 400 before shipping. */
export const XP_PER_LEVEL_FACTOR = 5;

export const EMPTY_PROGRESSION: ProgressionState = {
  totalXp: 0,
  streak: 0,
  bestStreak: 0,
  lastFocusDayKey: null,
  lastActiveAt: null,
  levelUpTo: null,
  unlockedMilestones: [],
  pendingChests: [],
};

export type RankTier = "novice" | "adept" | "alchemist" | "master";

export interface RankBadge {
  tier: RankTier;
  title: string;
}

export function rankForLevel(level: number): RankBadge {
  if (level >= 15) return { tier: "master", title: "Zen Productivity Master" };
  if (level >= 10) return { tier: "alchemist", title: "Time Alchemist" };
  if (level >= 5) return { tier: "adept", title: "Deep Work Adept" };
  return { tier: "novice", title: "Focus Novice" };
}

export function xpToReachNext(level: number): number {
  return Math.max(1, level) * XP_PER_LEVEL_FACTOR;
}

export function xpFromFocusMs(focusMs: number): number {
  return Math.floor((Math.max(0, focusMs) / 60000) * XP_PER_FOCUS_MINUTE);
}

export function profileFromXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
} {
  let remaining = Math.max(0, totalXp);
  let level = 1;
  let cost = xpToReachNext(level);

  while (remaining >= cost) {
    remaining -= cost;
    level += 1;
    cost = xpToReachNext(level);
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForLevel: cost,
  };
}

export function refreshStreak(progression: ProgressionState, now: number): ProgressionState {
  const today = dayKey(now);
  const last = progression.lastFocusDayKey;
  if (!last) return { ...progression, streak: 0 };
  if (last === today || last === previousDayKey(today)) return progression;
  return { ...progression, streak: 0 };
}

export function awardFocusProgress(
  progression: ProgressionState,
  focusMs: number,
  now: number,
): ProgressionState {
  if (focusMs <= 0) return refreshStreak(progression, now);

  const before = profileFromXp(progression.totalXp);
  const totalXp = progression.totalXp + xpFromFocusMs(focusMs);
  const after = profileFromXp(totalXp);
  const today = dayKey(now);
  const last = progression.lastFocusDayKey;

  let streak = progression.streak;
  if (last === today) {
    streak = Math.max(1, streak);
  } else if (last === previousDayKey(today)) {
    streak += 1;
  } else {
    streak = 1;
  }

  return {
    ...progression,
    totalXp,
    streak,
    bestStreak: Math.max(progression.bestStreak, streak),
    lastFocusDayKey: today,
    lastActiveAt: now,
    levelUpTo: after.level > before.level ? after.level : null,
  };
}

export function progressionFromFocusMs(focusMs: number): ProgressionState {
  return {
    ...EMPTY_PROGRESSION,
    totalXp: xpFromFocusMs(focusMs),
  };
}
