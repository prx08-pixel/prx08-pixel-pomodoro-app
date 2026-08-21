import { useId, useState } from "react";
import { useSpotifyRemote } from "@/store/SpotifyRemoteContext";
import styles from "./MusicPlayer.module.css";

const BARS = [18, 42, 28, 64, 36, 78, 22, 58, 44, 70, 30, 86, 24, 52, 40, 66];

export function MusicPlayer() {
  const { theme, track, playing, skipTrack, togglePlay } = useSpotifyRemote();
  const seekId = useId();
  const [liked, setLiked] = useState(false);
  const [repeat, setRepeat] = useState(true);

  return (
    <section className={styles.card} aria-label="Spotify remote">
      <div className={styles.screen}>
        <span className={styles.leds} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className={`${styles.wave} ${playing ? styles.live : ""}`} aria-hidden="true">
          {BARS.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} />
          ))}
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.copy}>
          <p>{track.title}</p>
          <span>{track.artist}</span>
        </div>
        <button
          type="button"
          className={`${styles.heart} ${liked ? styles.loved : ""}`}
          aria-pressed={liked}
          aria-label={liked ? "Unlike track" : "Like track"}
          onClick={() => setLiked((value) => !value)}
        >
          ♥
        </button>
      </div>

      <div className={styles.seek}>
        <span>Spotify</span>
        <input
          id={seekId}
          type="range"
          min={0}
          max={100}
          value={playing ? 42 : 0}
          disabled
          aria-label="Spotify progress"
        />
        <span>Live</span>
      </div>

      <div className={styles.controls}>
        <button type="button" aria-label="Previous track" onClick={() => skipTrack(-1)}>
          <SkipIcon flip />
        </button>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? "Pause Spotify" : "Play Spotify"}
          onClick={togglePlay}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" aria-label="Next track" onClick={() => skipTrack(1)}>
          <SkipIcon />
        </button>
      </div>

      <div className={styles.tray}>
        <button
          type="button"
          className={repeat ? styles.on : undefined}
          aria-pressed={repeat}
          aria-label="Repeat"
          onClick={() => setRepeat((value) => !value)}
        >
          ↺
        </button>
        <span className={styles.hint}>{theme.title}</span>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v11l10-5.5L4 2.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 3h3v10H4V3Zm5 0h3v10H9V3Z" />
    </svg>
  );
}

function SkipIcon({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="currentColor"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M3 4h2v10H3V4Zm3 5 9-5.5v11L6 9Z" />
    </svg>
  );
}
