export interface ParsedYouTube {
  videoId?: string;
  playlistId?: string;
}

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const LIST_ID = /^[A-Za-z0-9_-]{12,64}$/;
const BARE_LIST_ID = /^(PL|UU|OL|FL|LL)[A-Za-z0-9_-]{10,62}$/;
const HOSTS = new Set(['youtube.com', 'youtube-nocookie.com', '613tube.com']);
const PATH_ID_PREFIXES = new Set(['shorts', 'embed', 'live', 'v', 'e']);

/**
 * Extracts a video ID and/or playlist ID from a pasted YouTube / 613Tube URL
 * (or a bare ID). Returns null if nothing usable is found.
 */
export function parseYouTubeUrl(input: string): ParsedYouTube | null {
  const raw = input.trim();
  if (!raw) return null;
  if (BARE_LIST_ID.test(raw)) return { playlistId: raw };
  if (VIDEO_ID.test(raw)) return { videoId: raw };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(www|m|music)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);
  let candidate: string | null | undefined;

  if (host === 'youtu.be') {
    candidate = parts[0];
  } else if (HOSTS.has(host)) {
    if (parts[0] === 'watch' || parts.length === 0) candidate = url.searchParams.get('v');
    else if (PATH_ID_PREFIXES.has(parts[0]) && parts[1] !== 'videoseries') candidate = parts[1];
  } else {
    return null;
  }

  const result: ParsedYouTube = {};
  if (candidate && VIDEO_ID.test(candidate)) result.videoId = candidate;
  const list = url.searchParams.get('list');
  if (list && LIST_ID.test(list)) result.playlistId = list;
  return result.videoId || result.playlistId ? result : null;
}

const BASE = 'https://www.youtube-nocookie.com/embed';
const PARAMS = 'rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&controls=1&autoplay=1&fs=0';

export const videoEmbedUrl = (videoId: string) => `${BASE}/${videoId}?${PARAMS}`;
export const playlistEmbedUrl = (playlistId: string) =>
  `${BASE}/videoseries?list=${encodeURIComponent(playlistId)}&${PARAMS}`;
export const thumbUrl = (videoId: string, size: 'mq' | 'hq' = 'hq') =>
  `https://i.ytimg.com/vi/${videoId}/${size}default.jpg`;
