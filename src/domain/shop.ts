import { profileFromXp } from "./progression";
import type { EconomyState, ShopItem } from "./types";

/** TEMP: 30s for testing. Restore to `45 * 60 * 1000` before shipping. */
export const FOCUS_MS_PER_STAR_COIN = 30 * 1000;

export const THEME_UNLOCK_PRICE = 4;

export const SHOP_CATALOG: readonly ShopItem[] = [
  {
    id: "misty-forest",
    name: "Misty Forest",
    category: "nature",
    description: "Fog between quiet pines.",
    imageUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80",
    price: THEME_UNLOCK_PRICE,
  },
  {
    id: "alpine-range",
    name: "Alpine Range",
    category: "nature",
    description: "Cool peaks above the clouds.",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    price: THEME_UNLOCK_PRICE,
  },
  {
    id: "violet-nebula",
    name: "Violet Nebula",
    category: "space",
    description: "A slow drift through starlight.",
    imageUrl:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80",
    price: THEME_UNLOCK_PRICE,
  },
  {
    id: "soft-horizon",
    name: "Soft Horizon",
    category: "relaxing",
    description: "A calm abstract wash.",
    imageUrl:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80",
    price: THEME_UNLOCK_PRICE,
  },
  {
    id: "golden-nebula",
    name: "Golden Nebula",
    category: "space",
    description: "A hidden cosmic goldfield.",
    imageUrl:
      "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1600&q=80",
    price: 0,
    hidden: true,
    unlockHint: "Chest reward at Level 10",
  },
  {
    id: "cosmic-voyager",
    name: "Cosmic Voyager",
    category: "premium",
    description: "A silent cruise past blue marble and starfield.",
    imageUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
    price: 10,
    requiredLevel: 5,
  },
  {
    id: "deep-forest-zen",
    name: "Deep Forest Zen",
    category: "premium",
    description: "Sunlit canopy and quiet moss underfoot.",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
    price: 15,
    requiredLevel: 10,
  },
  {
    id: "golden-cyberpunk-grid",
    name: "Golden Cyberpunk Grid",
    category: "premium",
    description: "Neon gold streets in a night-city grid.",
    imageUrl:
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80",
    price: 25,
    requiredLevel: 15,
  },
];

export const GOLDEN_NEBULA_ID = "golden-nebula";

export const EMPTY_ECONOMY: EconomyState = {
  focusMsAccumulated: 0,
  coinsMinted: 0,
  starCoins: 0,
  unlockedItemIds: [],
  activeWallpaper: {
    kind: "none",
    shopItemId: null,
  },
  customWallpaperDataUrl: null,
};

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === id);
}

export function playerLevelFromXp(totalXp: number): number {
  return profileFromXp(totalXp).level;
}

export function meetsItemLevel(item: ShopItem, level: number): boolean {
  return level >= (item.requiredLevel ?? 1);
}

export function canBuyShopItem(
  item: ShopItem,
  level: number,
  starCoins: number,
  unlockedItemIds: readonly string[],
): boolean {
  if (unlockedItemIds.includes(item.id)) return false;
  if (item.hidden) return false;
  if (!meetsItemLevel(item, level)) return false;
  if (starCoins < item.price) return false;
  return true;
}

export function resolveWallpaperUrl(economy: {
  activeWallpaper: { kind: string; shopItemId: string | null };
  customWallpaperDataUrl: string | null;
}): string | null {
  if (economy.activeWallpaper.kind === "custom") {
    return economy.customWallpaperDataUrl;
  }
  if (economy.activeWallpaper.kind === "shop" && economy.activeWallpaper.shopItemId) {
    return getShopItem(economy.activeWallpaper.shopItemId)?.imageUrl ?? null;
  }
  return null;
}

export function mintCoinsFromFocus(economy: EconomyState, addedFocusMs: number): EconomyState {
  if (addedFocusMs <= 0) return economy;

  const focusMsAccumulated = economy.focusMsAccumulated + addedFocusMs;
  const coinsMinted = Math.floor(focusMsAccumulated / FOCUS_MS_PER_STAR_COIN);
  const newlyMinted = Math.max(0, coinsMinted - economy.coinsMinted);

  return {
    ...economy,
    focusMsAccumulated,
    coinsMinted,
    starCoins: economy.starCoins + newlyMinted,
  };
}
