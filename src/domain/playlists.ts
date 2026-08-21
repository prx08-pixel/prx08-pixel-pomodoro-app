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
    title: "Lofi Beats",
    description:
      "Chill tempos, calm instrumentation, and relaxing backgrounds designed for pure cognitive productivity.",
    embedSrc: embedPlaylist("37i9dQZF1DWWQRwui0ExPn"),
    featured: true,
  },
  {
    id: "dark-synth",
    title: "Dark Synth",
    description: "Neon pulse and retro synthwave for late-night deep work.",
    embedSrc: embedPlaylist("37i9dQZF1DX0KpeLFwA3tN"),
  },
  {
    id: "deep-ambient",
    title: "Deep Ambient Focus",
    description: "Spacious pads and quiet drones for long, uninterrupted concentration.",
    embedSrc: embedPlaylist("37i9dQZF1DWZeKCadgRdKQ"),
  },
];

export function playlistAt(index: number): FocusPlaylist {
  const playlist = FOCUS_PLAYLISTS[((index % FOCUS_PLAYLISTS.length) + FOCUS_PLAYLISTS.length) % FOCUS_PLAYLISTS.length];
  return playlist ?? FOCUS_PLAYLISTS[0]!;
}
