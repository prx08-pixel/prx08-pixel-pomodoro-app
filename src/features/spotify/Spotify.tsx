import { useEffect, useId, useState } from "react";
import { FOCUS_PLAYLISTS, type FocusPlaylist } from "@/domain/playlists";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./Spotify.module.css";

const DEFAULT_PLAYLIST: FocusPlaylist = FOCUS_PLAYLISTS[0] as FocusPlaylist;

export function Spotify() {
  const { state, closeSpotify } = usePomodoro();
  const titleId = useId();
  const { spotifyOpen } = state;
  const [activeId, setActiveId] = useState(DEFAULT_PLAYLIST.id);

  const active = FOCUS_PLAYLISTS.find((item) => item.id === activeId) ?? DEFAULT_PLAYLIST;

  useEffect(() => {
    if (!spotifyOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSpotify();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spotifyOpen, closeSpotify]);

  return (
    <div className={`${styles.root} ${spotifyOpen ? styles.open : ""}`}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close Spotify"
        tabIndex={spotifyOpen ? 0 : -1}
        onClick={closeSpotify}
      />
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!spotifyOpen}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Soundscape</p>
            <h2 id={titleId}>Spotify</h2>
          </div>
          <button type="button" className={styles.close} onClick={closeSpotify} aria-label="Close Spotify">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.player}>
          <iframe
            key={active.embedSrc}
            title={`${active.title} on Spotify`}
            src={active.embedSrc}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className={styles.hint}>Log in, play, and set volume in the player without leaving your timer.</p>

        <section className={styles.waves} aria-labelledby={`${titleId}-waves`}>
          <h3 id={`${titleId}-waves`}>Curated Focus Waves</h3>
          <div className={styles.grid}>
            {FOCUS_PLAYLISTS.map((playlist) => {
              const selected = playlist.id === active.id;
              return (
                <button
                  key={playlist.id}
                  type="button"
                  className={`${styles.card} ${playlist.featured ? styles.featured : ""} ${selected ? styles.selected : ""}`}
                  onClick={() => setActiveId(playlist.id)}
                  aria-pressed={selected}
                >
                  {playlist.featured ? <span className={styles.badge}>Featured</span> : null}
                  <strong>{playlist.title}</strong>
                  <span>{playlist.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
