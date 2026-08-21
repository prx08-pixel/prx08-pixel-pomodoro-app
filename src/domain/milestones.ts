import { profileFromXp } from "./progression";
import { GOLDEN_NEBULA_ID } from "./shop";
import type { AppState, ChestNotice, MilestoneId } from "./types";

interface Milestone {
  id: MilestoneId;
  headline: string;
  reward: string;
  coins: number;
  wallpaperId: string | null;
  achieved: (state: AppState) => boolean;
}

export const MILESTONES: readonly Milestone[] = [
  {
    id: "streak-7",
    headline: "Milestone Unlocked!",
    reward: "Received 10 Star Coins!",
    coins: 10,
    wallpaperId: null,
    achieved: (state) => Math.max(state.progression.streak, state.progression.bestStreak) >= 7,
  },
  {
    id: "tasks-25",
    headline: "Milestone Unlocked!",
    reward: "Received 15 Star Coins!",
    coins: 15,
    wallpaperId: null,
    achieved: (state) => state.tasks.items.filter((task) => task.completed).length >= 25,
  },
  {
    id: "level-10",
    headline: "Milestone Unlocked!",
    reward: "Golden Nebula wallpaper unlocked!",
    coins: 0,
    wallpaperId: GOLDEN_NEBULA_ID,
    achieved: (state) => profileFromXp(state.progression.totalXp).level >= 10,
  },
];

export function applyMilestones(state: AppState): AppState {
  const claimed = new Set(state.progression.unlockedMilestones);
  const notices: ChestNotice[] = [];
  let { economy } = state;

  for (const milestone of MILESTONES) {
    if (claimed.has(milestone.id) || !milestone.achieved(state)) continue;

    claimed.add(milestone.id);
    notices.push({
      id: milestone.id,
      headline: milestone.headline,
      reward: milestone.reward,
    });

    if (milestone.coins > 0) {
      economy = {
        ...economy,
        starCoins: economy.starCoins + milestone.coins,
      };
    }

    if (milestone.wallpaperId) {
      const unlockedItemIds = economy.unlockedItemIds.includes(milestone.wallpaperId)
        ? economy.unlockedItemIds
        : [...economy.unlockedItemIds, milestone.wallpaperId];
      economy = {
        ...economy,
        unlockedItemIds,
        activeWallpaper: {
          kind: "shop",
          shopItemId: milestone.wallpaperId,
        },
      };
    }
  }

  if (notices.length === 0) return state;

  return {
    ...state,
    economy,
    progression: {
      ...state.progression,
      unlockedMilestones: [...claimed],
      pendingChests: [...state.progression.pendingChests, ...notices],
    },
  };
}
