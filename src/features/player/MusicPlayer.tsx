import { useEffect, useId, useState } from "react";
import {
  AMBIENT_TRACK_MS,
  ambientPad,
  ambientTrackName,
} from "@/lib/ambientPad";
import { formatClock } from "@/lib/timerAudio";
import { usePomodoro } from "@/store/PomodoroContext";
import styles from "./MusicPlayer.module.css";

const BARS = [18, 42, 28, 64, 36, 78, 22, 58, 44, 70, 30, 86, 24, 52, 40, 66];

export function MusicPlayer() {
  const { openSpotify } = usePomodoro();
  const seekId = useId();
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [repeat, setRepeat] = useState(true);
  const [track, setTrack] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      setElapsed((value) => (value + delta) % AMBIENT_TRACK_MS);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const togglePlay = async () => {
    await ambientPad.toggle();
    setPlaying(ambientPad.isPlaying);
  };

  const skip = async (direction: -1 | 1) => {
    if (direction === 1) await ambientPad.next();
    else await ambientPad.previous();
    setTrack(ambientPad.trackIndex);
    setElapsed(0);
    setPlaying(ambientPad.isPlaying);
  };

  const progress = elapsed / AMBIENT_TRACK_MS;

  return (
    <section className={styles.card} aria-label="Ambient music player">
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
        <p>{ambientTrackName(track)}</p>
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
        <span>{formatClock(elapsed)}</span>
        <input
          id={seekId}
          type="range"
          min={0}
          max={100}
          value={Math.round(progress * 100)}
          aria-label="Track progress"
          onChange={(event) => setElapsed((Number(event.target.value) / 100) * AMBIENT_TRACK_MS)}
        />
        <span>{formatClock(AMBIENT_TRACK_MS)}</span>
      </div>

      <div className={styles.controls}>
        <button type="button" aria-label="Previous track" onClick={() => void skip(-1)}>
          <SkipIcon flip />
        </button>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => void togglePlay()}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" aria-label="Next track" onClick={() => void skip(1)}>
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
        <button type="button" aria-label="Open Spotify" onClick={openSpotify}>
          ⋯
        </button>
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
