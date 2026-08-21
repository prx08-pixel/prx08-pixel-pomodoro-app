export interface FocusTrack {
  id: string;
  title: string;
  artist: string;
  embedSrc: string;
}

export interface FocusTheme {
  id: string;
  title: string;
  description: string;
  featured?: boolean;
  tracks: readonly FocusTrack[];
}

function embedTrack(id: string): string {
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
}

const LOFI_FOCUS_TRACKS: readonly FocusTrack[] = [
  {
    id: "7IVCN0fykPKMffNOMLI1ld",
    title: "House In The Woods",
    artist: "lofi geek",
    embedSrc: embedTrack("7IVCN0fykPKMffNOMLI1ld"),
  },
  {
    id: "3NS4ioxvU89IKOh7NyAuWL",
    title: "Your Body Language Speaks to Me in Lofi",
    artist: "Idleboi",
    embedSrc: embedTrack("3NS4ioxvU89IKOh7NyAuWL"),
  },
  {
    id: "3bWBAoAi5Il7RUXdN53UIB",
    title: "Mossy Corner",
    artist: "lofi geek",
    embedSrc: embedTrack("3bWBAoAi5Il7RUXdN53UIB"),
  },
  {
    id: "2fNS8MYzuLodHZe4JNYXGH",
    title: "Coffee In The Rain",
    artist: "Cloud Ritual",
    embedSrc: embedTrack("2fNS8MYzuLodHZe4JNYXGH"),
  },
  {
    id: "0yvXXYzxeshUInEiWZEAAR",
    title: "Uptown Lofi",
    artist: "LoFi Jazz",
    embedSrc: embedTrack("0yvXXYzxeshUInEiWZEAAR"),
  },
];

export const FOCUS_THEMES: readonly FocusTheme[] = [
  {
    id: "lofi-deep-work",
    title: "Lofi Beats",
    description: "A five-track lo-fi queue for deep work.",
    featured: true,
    tracks: LOFI_FOCUS_TRACKS,
  },
  {
    id: "dark-synth",
    title: "Dark Synth",
    description: "Neon pulse for late-night sessions.",
    tracks: LOFI_FOCUS_TRACKS,
  },
  {
    id: "deep-ambient",
    title: "Deep Ambient Focus",
    description: "Quiet pads and calm focus pieces.",
    tracks: LOFI_FOCUS_TRACKS,
  },
];

export function themeAt(index: number): FocusTheme {
  const theme = FOCUS_THEMES[((index % FOCUS_THEMES.length) + FOCUS_THEMES.length) % FOCUS_THEMES.length];
  return theme ?? FOCUS_THEMES[0]!;
}

export function trackAt(theme: FocusTheme, index: number): FocusTrack {
  const tracks = theme.tracks;
  const track = tracks[((index % tracks.length) + tracks.length) % tracks.length];
  return track ?? tracks[0]!;
}
