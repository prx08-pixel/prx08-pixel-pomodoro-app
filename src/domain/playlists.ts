export interface FocusPlaylist {
  id: string;
  title: string;
  description: string;
  embedSrc: string;
  featured?: boolean;
}

function embedPlaylist(id: string): string {
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
}

export const FOCUS_PLAYLISTS: readonly FocusPlaylist[] = [
  {
    id: "lofi-deep-work",
    title: "Lofi Beats for Deep Work",
    description:
      "Chill tempos, calm instrumentation, and relaxing backgrounds designed for pure cognitive productivity.",
    embedSrc: embedPlaylist("37i9dQZF1DWWQRwui0ExPn"),
    featured: true,
  },
  {
    id: "deep-ambient",
    title: "Deep Ambient Focus",
    description: "Spacious pads and quiet drones for long, uninterrupted concentration.",
    embedSrc: embedPlaylist("37i9dQZF1DWZeKCadgRdKQ"),
  },
  {
    id: "productivity-electronic",
    title: "Productivity Electronic",
    description: "Steady study electronics to keep your workflow moving without distraction.",
    embedSrc: embedPlaylist("37i9dQZF1DX8NTLI2TtZa6"),
  },
];
