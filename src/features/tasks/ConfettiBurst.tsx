import { useEffect, useState, type CSSProperties } from "react";
import styles from "./ConfettiBurst.module.css";

const PIECES = [
  { x: -42, y: -58, rot: 28, color: "#f87070" },
  { x: 36, y: -64, rot: -18, color: "#70f3f8" },
  { x: -8, y: -78, rot: 12, color: "#d881f8" },
  { x: 52, y: -36, rot: 40, color: "#f87070" },
  { x: -56, y: -24, rot: -32, color: "#d7e0ff" },
  { x: 14, y: -48, rot: 8, color: "#70f3f8" },
  { x: -28, y: -40, rot: -14, color: "#d881f8" },
  { x: 44, y: -72, rot: 22, color: "#ffffff" },
];

export function ConfettiBurst({ token }: { token: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (token === 0) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(id);
  }, [token]);

  if (!visible) return null;

  return (
    <div className={styles.burst} aria-hidden="true">
      <span className={styles.check}>✓</span>
      {PIECES.map((piece, index) => (
        <span
          key={`${token}-${index}`}
          className={styles.piece}
          style={
            {
              "--x": `${piece.x}px`,
              "--y": `${piece.y}px`,
              "--rot": `${piece.rot}deg`,
              background: piece.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
