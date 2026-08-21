import { useEffect, useId } from "react";
import { FOCUS_PLAYLISTS } from "@/domain/playlists";
import { usePomodoro } from "@/store/PomodoroContext";
import { useSpotifyRemote } from "@/store/SpotifyRemoteContext";
import styles from "./Spotify.module.css";

export function Spotify() {
  const { state, closeSpotify } = usePomodoro();
  const { playlist, bindIframe, selectPlaylist } = useSpotifyRemote();
  const titleId = useId();
  const { spotifyOpen, settingsOpen, historyOpen } = state;

  useEffect(() => {
    if (!spotifyOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (settingsOpen || historyOpen) return;
      closeSpotify();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spotifyOpen, closeSpotify, settingsOpen, historyOpen]);

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
            ref={bindIframe}
            key={playlist.embedSrc}
            title={`${playlist.title} on Spotify`}
            src={playlist.embedSrc}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className={styles.hint}>Control playback from the retro player on the dashboard. This drawer is optional.</p>

        <section className={styles.waves} aria-labelledby={`${titleId}-waves`}>
          <h3 id={`${titleId}-waves`}>Curated Focus Waves</h3>
          <div className={styles.grid}>
            {FOCUS_PLAYLISTS.map((item) => {
              const selected = item.id === playlist.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.card} ${item.featured ? styles.featured : ""} ${selected ? styles.selected : ""}`}
                  onClick={() => selectPlaylist(item.id)}
                  aria-pressed={selected}
                >
                  {item.featured ? <span className={styles.badge}>Featured</span> : null}
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
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
