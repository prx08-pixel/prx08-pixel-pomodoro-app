import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from "react";
import { FOCUS_THEMES, trackAt, themeAt, type FocusTheme, type FocusTrack } from "@/domain/playlists";

const SPOTIFY_ORIGIN = "https://open.spotify.com";

interface SpotifyRemoteValue {
  theme: FocusTheme;
  track: FocusTrack;
  themeIndex: number;
  trackIndex: number;
  playing: boolean;
  bindIframe: RefCallback<HTMLIFrameElement>;
  selectTheme: (id: string) => void;
  skipTrack: (direction: -1 | 1) => void;
  togglePlay: () => void;
}

const SpotifyRemoteContext = createContext<SpotifyRemoteValue | null>(null);

function postSpotifyCommand(frame: HTMLIFrameElement | null, command: string): void {
  const target = frame?.contentWindow;
  if (!target) return;
  target.postMessage({ command }, "*");
  target.postMessage({ command }, SPOTIFY_ORIGIN);
}

export function SpotifyRemoteProvider({ children }: { children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const pendingPlay = useRef(false);

  const theme = themeAt(themeIndex);
  const track = trackAt(theme, trackIndex);

  const bindIframe = useCallback<RefCallback<HTMLIFrameElement>>((node) => {
    iframeRef.current = node;
    if (!node) return;
    node.onload = () => {
      if (!pendingPlay.current) return;
      pendingPlay.current = false;
      postSpotifyCommand(node, "play");
      postSpotifyCommand(node, "toggle");
    };
  }, []);

  const selectTheme = useCallback((id: string) => {
    const next = FOCUS_THEMES.findIndex((item) => item.id === id);
    if (next < 0) return;
    pendingPlay.current = playing;
    setThemeIndex(next);
    setTrackIndex(0);
  }, [playing]);

  const skipTrack = useCallback((direction: -1 | 1) => {
    pendingPlay.current = true;
    setPlaying(true);
    setTrackIndex((current) => {
      const length = themeAt(themeIndex).tracks.length;
      return (current + direction + length) % length;
    });
  }, [themeIndex]);

  const togglePlay = useCallback(() => {
    postSpotifyCommand(iframeRef.current, "toggle");
    setPlaying((value) => !value);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      track,
      themeIndex,
      trackIndex,
      playing,
      bindIframe,
      selectTheme,
      skipTrack,
      togglePlay,
    }),
    [theme, track, themeIndex, trackIndex, playing, bindIframe, selectTheme, skipTrack, togglePlay],
  );

  return <SpotifyRemoteContext.Provider value={value}>{children}</SpotifyRemoteContext.Provider>;
}

export function useSpotifyRemote(): SpotifyRemoteValue {
  const context = useContext(SpotifyRemoteContext);
  if (!context) {
    throw new Error("useSpotifyRemote must be used within SpotifyRemoteProvider");
  }
  return context;
}
