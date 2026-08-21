import { useEffect, useId } from "react";
import { SHOP_CATALOG } from "@/domain/shop";
import type { ShopCategory, ShopItem } from "@/domain/types";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./Shop.module.css";

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  nature: "Nature",
  space: "Space",
  relaxing: "Relaxing",
};

export function Shop() {
  const { state, closeShop, selectTheme, clearWallpaper } = usePomodoro();
  const titleId = useId();
  const { economy, shopOpen } = state;

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

        <p className={styles.hint}>Earn 1 Star Coin for every 45 minutes of completed focus time.</p>

        <button
          type="button"
          className={styles.clear}
          onClick={clearWallpaper}
          disabled={economy.activeWallpaper.kind === "none"}
        >
          Use classic navy
        </button>

        <div className={styles.grid}>
          {SHOP_CATALOG.filter(
            (item) => !item.hidden || economy.unlockedItemIds.includes(item.id),
          ).map((item) => (
            <ShopCard
              key={item.id}
              item={item}
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

function ShopCard({
  item,
  unlocked,
  equipped,
  canAfford,
  onSelect,
}: {
  item: ShopItem;
  unlocked: boolean;
  equipped: boolean;
  canAfford: boolean;
  onSelect: () => void;
}) {
  const lockedOut = !unlocked && !canAfford;

  return (
    <article className={`${styles.card} ${equipped ? styles.equipped : ""} ${lockedOut ? styles.locked : ""}`}>
      <button type="button" className={styles.preview} onClick={onSelect} disabled={lockedOut}>
        <span className={styles.thumb} style={{ backgroundImage: `url(${item.imageUrl})` }}>
          <span className={styles.badge}>{CATEGORY_LABEL[item.category]}</span>
        </span>
        <span className={styles.meta}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.copy}>{item.description}</span>
        </span>
      </button>
      {unlocked ? (
        <button type="button" className={styles.use} onClick={onSelect} disabled={equipped}>
          {equipped ? "Equipped" : "Use theme"}
        </button>
      ) : (
        <button type="button" className={styles.buy} onClick={onSelect} disabled={!canAfford}>
          Unlock · ★ {item.price}
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
