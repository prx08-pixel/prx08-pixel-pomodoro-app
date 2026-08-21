import { useEffect, useId, useState } from "react";
import { ACCENT_HEX, FONT_FAMILY, MINUTES, clampMinutes, maxMinutesFor } from "@/domain/defaults";
import type { AccentColor, AppFont, AppSettings, DurationSettings } from "@/domain/types";
import { readImageAsCompressedDataUrl } from "@/lib/image";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./SettingsModal.module.css";

/** Flip this to test the custom wallpaper paywall. */
const isPremiumUser = true;

const COLORS: AccentColor[] = ["coral", "cyan", "purple"];
const FONTS: AppFont[] = ["kumbh", "slab", "mono"];

type DurationDraft = Record<keyof DurationSettings, string>;

function toDraft(durations: DurationSettings): DurationDraft {
  return {
    pomodoro: String(durations.pomodoro),
    shortBreak: String(durations.shortBreak),
    longBreak: String(durations.longBreak),
  };
}

function parseDurationInput(raw: string, key: keyof DurationSettings): number {
  const parsed = Number.parseInt(raw, 10);
  return clampMinutes(parsed, key);
}

export function SettingsModal() {
  const { state, closeSettings, applySettings, setCustomWallpaper, clearCustomWallpaper } =
    usePomodoro();
  const titleId = useId();
  const [draft, setDraft] = useState<AppSettings>(state.settings);
  const [durationDraft, setDurationDraft] = useState<DurationDraft>(toDraft(state.settings.durations));

  useEffect(() => {
    if (state.settingsOpen) {
      setDraft(state.settings);
      setDurationDraft(toDraft(state.settings.durations));
    }
  }, [state.settingsOpen, state.settings]);

  useEffect(() => {
    if (!state.settingsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.settingsOpen, closeSettings]);

  if (!state.settingsOpen) return null;

  const updateDuration = (key: keyof DurationSettings, delta: number) => {
    const current = parseDurationInput(durationDraft[key], key);
    const next = clampMinutes(current + delta, key);
    setDurationDraft((draftValue) => ({ ...draftValue, [key]: String(next) }));
    setDraft((currentDraft) => ({
      ...currentDraft,
      durations: { ...currentDraft.durations, [key]: next },
    }));
  };

  const setDurationRaw = (key: keyof DurationSettings, raw: string) => {
    if (raw !== "" && !/^\d{0,3}$/.test(raw)) return;
    setDurationDraft((current) => ({ ...current, [key]: raw }));
    if (raw === "") return;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return;
    setDraft((current) => ({
      ...current,
      durations: {
        ...current.durations,
        [key]: parsed,
      },
    }));
  };

  const commitDuration = (key: keyof DurationSettings) => {
    const next = parseDurationInput(durationDraft[key], key);
    setDurationDraft((current) => ({ ...current, [key]: String(next) }));
    setDraft((current) => ({
      ...current,
      durations: { ...current.durations, [key]: next },
    }));
  };

  const handleApply = () => {
    const durations: DurationSettings = {
      pomodoro: parseDurationInput(durationDraft.pomodoro, "pomodoro"),
      shortBreak: parseDurationInput(durationDraft.shortBreak, "shortBreak"),
      longBreak: parseDurationInput(durationDraft.longBreak, "longBreak"),
    };
    applySettings({ ...draft, durations });
  };

  return (
    <div className={styles.backdrop} onClick={closeSettings}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId}>Settings</h2>
          <button type="button" className={styles.close} onClick={closeSettings} aria-label="Close settings">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3>Time (minutes)</h3>
            <div className={styles.durations}>
              <DurationField
                label="pomodoro"
                value={durationDraft.pomodoro}
                max={maxMinutesFor("pomodoro")}
                onChange={(value) => setDurationRaw("pomodoro", value)}
                onBlur={() => commitDuration("pomodoro")}
                onStep={(delta) => updateDuration("pomodoro", delta)}
              />
              <DurationField
                label="short break"
                value={durationDraft.shortBreak}
                max={maxMinutesFor("shortBreak")}
                onChange={(value) => setDurationRaw("shortBreak", value)}
                onBlur={() => commitDuration("shortBreak")}
                onStep={(delta) => updateDuration("shortBreak", delta)}
              />
              <DurationField
                label="long break"
                value={durationDraft.longBreak}
                max={maxMinutesFor("longBreak")}
                onChange={(value) => setDurationRaw("longBreak", value)}
                onBlur={() => commitDuration("longBreak")}
                onStep={(delta) => updateDuration("longBreak", delta)}
              />
            </div>
          </section>

          <section className={`${styles.section} ${styles.row}`}>
            <h3>Font</h3>
            <div className={styles.swatches}>
              {FONTS.map((font) => (
                <button
                  key={font}
                  type="button"
                  className={`${styles.fontSwatch} ${draft.appearance.font === font ? styles.fontActive : ""}`}
                  style={{ fontFamily: FONT_FAMILY[font] }}
                  aria-label={`Use ${font} font`}
                  aria-pressed={draft.appearance.font === font}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      appearance: { ...current.appearance, font },
                    }))
                  }
                >
                  Aa
                </button>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.row}`}>
            <h3>Color</h3>
            <div className={styles.swatches}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={styles.colorSwatch}
                  style={{ background: ACCENT_HEX[color] }}
                  aria-label={`Use ${color} accent`}
                  aria-pressed={draft.appearance.color === color}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      appearance: { ...current.appearance, color },
                    }))
                  }
                >
                  {draft.appearance.color === color ? <CheckIcon /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.last}`}>
            <h3>Custom wallpaper</h3>
            <CustomWallpaperField
              hasCustom={Boolean(state.economy.customWallpaperDataUrl)}
              isActive={state.economy.activeWallpaper.kind === "custom"}
              onFile={async (file) => {
                const dataUrl = await readImageAsCompressedDataUrl(file);
                setCustomWallpaper(dataUrl, isPremiumUser);
              }}
              onClear={clearCustomWallpaper}
            />
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.apply} onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomWallpaperField({
  hasCustom,
  isActive,
  onFile,
  onClear,
}: {
  hasCustom: boolean;
  isActive: boolean;
  onFile: (file: File) => Promise<void>;
  onClear: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className={`${styles.premiumBox} ${isPremiumUser ? "" : styles.locked}`}>
      {!isPremiumUser ? (
        <div className={styles.paywall} role="note">
          <span>Premium Version Only</span>
        </div>
      ) : null}

      <p className={styles.premiumCopy}>
        Upload a photo from your device to use as the timer background.
      </p>

      <label className={styles.upload}>
        <input
          type="file"
          accept="image/*"
          disabled={!isPremiumUser || busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file || !isPremiumUser) return;
            setBusy(true);
            setError(null);
            try {
              await onFile(file);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Upload failed.");
            } finally {
              setBusy(false);
            }
          }}
        />
        <span>{busy ? "Preparing…" : "Choose image"}</span>
      </label>

      {hasCustom ? (
        <p className={styles.premiumStatus}>{isActive ? "Custom wallpaper is active." : "Saved custom wallpaper."}</p>
      ) : null}

      {hasCustom ? (
        <button type="button" className={styles.removeCustom} onClick={onClear} disabled={!isPremiumUser}>
          Remove upload
        </button>
      ) : null}

      {error ? <p className={styles.premiumError}>{error}</p> : null}
    </div>
  );
}

function DurationField({
  label,
  value,
  max,
  onChange,
  onBlur,
  onStep,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  onBlur: () => void;
  onStep: (delta: number) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.stepper}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          min={MINUTES.min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <div className={styles.stepperButtons}>
          <button type="button" aria-label={`Increase ${label}`} onClick={() => onStep(1)}>
            <Chevron direction="up" />
          </button>
          <button type="button" aria-label={`Decrease ${label}`} onClick={() => onStep(-1)}>
            <Chevron direction="down" />
          </button>
        </div>
      </div>
    </label>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
      <path d="M1 5.5 5.5 10 14 1" stroke="#161932" strokeWidth="2" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="14" height="7" viewBox="0 0 14 7" fill="none" aria-hidden="true">
      <path
        d={direction === "up" ? "M1 6l6-5 6 5" : "M1 1l6 5 6-5"}
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
