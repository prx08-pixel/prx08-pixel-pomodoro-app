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
import { FOCUS_PLAYLISTS, playlistAt, type FocusPlaylist } from "@/domain/playlists";

const SPOTIFY_ORIGIN = "https://open.spotify.com";

interface SpotifyRemoteValue {
  playlist: FocusPlaylist;
  playlistIndex: number;
  playing: boolean;
  bindIframe: RefCallback<HTMLIFrameElement>;
  selectPlaylist: (id: string) => void;
  skipPlaylist: (direction: -1 | 1) => void;
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
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const pendingPlay = useRef(false);

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

  const selectPlaylist = useCallback((id: string) => {
    const next = FOCUS_PLAYLISTS.findIndex((item) => item.id === id);
    if (next < 0 || next === playlistIndex) return;
    pendingPlay.current = playing;
    setPlaylistIndex(next);
  }, [playing, playlistIndex]);

  const skipPlaylist = useCallback((direction: -1 | 1) => {
    pendingPlay.current = true;
    setPlaying(true);
    setPlaylistIndex((current) => (current + direction + FOCUS_PLAYLISTS.length) % FOCUS_PLAYLISTS.length);
  }, []);

  const togglePlay = useCallback(() => {
    postSpotifyCommand(iframeRef.current, "toggle");
    setPlaying((value) => !value);
  }, []);

  const value = useMemo(
    () => ({
      playlist: playlistAt(playlistIndex),
      playlistIndex,
      playing,
      bindIframe,
      selectPlaylist,
      skipPlaylist,
      togglePlay,
    }),
    [playlistIndex, playing, bindIframe, selectPlaylist, skipPlaylist, togglePlay],
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
