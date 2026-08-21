import { useEffect, useId, useState } from "react";
import { playerLevelFromXp, SHOP_CATALOG } from "@/domain/shop";
import type { ShopCategory, ShopItem } from "@/domain/types";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./Shop.module.css";

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  nature: "Nature",
  space: "Space",
  relaxing: "Relaxing",
  premium: "Premium",
};

export function Shop() {
  const { state, closeShop, selectTheme, clearWallpaper } = usePomodoro();
  const titleId = useId();
  const { economy, shopOpen, progression } = state;
  const playerLevel = playerLevelFromXp(progression.totalXp);

  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeShop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shopOpen, closeShop]);

  return (
    <div className={`${styles.root} ${shopOpen ? styles.open : ""}`}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close shop"
        tabIndex={shopOpen ? 0 : -1}
        onClick={closeShop}
      />
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!shopOpen}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Cosmetics</p>
            <h2 id={titleId}>Shop</h2>
          </div>
          <button type="button" className={styles.close} onClick={closeShop} aria-label="Close shop">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.balanceRow}>
          <span>Your balance</span>
          <strong>
            <span aria-hidden="true">★</span> {economy.starCoins}
          </strong>
        </div>

        <p className={styles.hint}>
          Earn 1 Star Coin for every 45 minutes of completed focus time. Hover or tap a card to see
          unlock requirements.
        </p>

        <button
          type="button"
          className={styles.clear}
          onClick={clearWallpaper}
          disabled={economy.activeWallpaper.kind === "none"}
        >
          Use classic navy
        </button>

        <div className={styles.grid}>
          {SHOP_CATALOG.map((item) => (
            <ShopCard
              key={item.id}
              item={item}
              playerLevel={playerLevel}
              shopOpen={shopOpen}
              unlocked={economy.unlockedItemIds.includes(item.id)}
              equipped={
                economy.activeWallpaper.kind === "shop" &&
                economy.activeWallpaper.shopItemId === item.id
              }
              canAfford={economy.starCoins >= item.price}
              onSelect={() => selectTheme(item.id)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function overlayCopy(item: ShopItem, unlocked: boolean, equipped: boolean, locked: boolean): string {
  if (equipped) return "Equipped";
  if (unlocked) return "Click to Apply";
  if (item.hidden) return item.unlockHint ?? "Unlocks from a milestone chest";
  if (locked) {
    const levelBit = item.requiredLevel ? `Unlocks at Level ${item.requiredLevel}` : null;
    return [levelBit, `${item.price} Star Coins`].filter(Boolean).join("  |  ");
  }
  return "Click to Unlock";
}

function ShopCard({
  item,
  playerLevel,
  shopOpen,
  unlocked,
  equipped,
  canAfford,
  onSelect,
}: {
  item: ShopItem;
  playerLevel: number;
  shopOpen: boolean;
  unlocked: boolean;
  equipped: boolean;
  canAfford: boolean;
  onSelect: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const requiredLevel = item.requiredLevel ?? 1;
  const levelLocked = !unlocked && playerLevel < requiredLevel;
  const milestoneLocked = !unlocked && Boolean(item.hidden);
  const coinLocked = !unlocked && !item.hidden && !canAfford;
  const gated = !unlocked && (levelLocked || milestoneLocked);
  const purchaseDisabled = gated || coinLocked || milestoneLocked;
  const locked = purchaseDisabled;
  const message = overlayCopy(item, unlocked, equipped, locked);

  useEffect(() => {
    if (!shopOpen) setRevealed(false);
  }, [shopOpen]);

  return (
    <article
      className={`${styles.card} ${equipped ? styles.equipped : ""} ${gated ? styles.gated : ""} ${revealed ? styles.revealed : ""}`}
    >
      <button
        type="button"
        className={styles.preview}
        onClick={() => {
          if (locked) {
            setRevealed((open) => !open);
            return;
          }
          onSelect();
        }}
      >
        <span className={styles.previewArt}>
          <span className={styles.thumb} style={{ backgroundImage: `url(${item.imageUrl})` }} />
          <span className={styles.badge}>{CATEGORY_LABEL[item.category]}</span>
          <span className={styles.overlay}>
            <span className={styles.overlayText}>
              {locked ? <span className={styles.lockMark}>Locked</span> : null}
              {message}
            </span>
          </span>
        </span>
        <span className={styles.meta}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.copy}>{item.description}</span>
        </span>
      </button>
      <p className={styles.tapHint}>{locked ? "Tap to view requirements" : "Tap the preview to use"}</p>
      {unlocked ? (
        <button type="button" className={styles.use} onClick={onSelect} disabled={equipped}>
          {equipped ? "Equipped" : "Use theme"}
        </button>
      ) : (
        <button type="button" className={styles.buy} onClick={onSelect} disabled={purchaseDisabled}>
          {item.hidden ? "Chest reward" : `Unlock · ★ ${item.price}`}
        </button>
      )}
    </article>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
