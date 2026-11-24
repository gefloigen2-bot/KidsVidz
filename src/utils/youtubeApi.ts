import type { Episode } from '../types';
import { load, save } from './storage';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<typeof YT> | null = null;

/** Loads the YouTube IFrame API once. Rejects after `timeoutMs` (e.g. offline / blocked). */
export function loadYouTubeApi(timeoutMs = 8000): Promise<typeof YT> {
  if (!apiPromise) {
    apiPromise = new Promise<typeof YT>((resolve, reject) => {
      if (window.YT?.Player) return resolve(window.YT);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => reject(new Error('YouTube API failed to load'));
      document.head.appendChild(s);
    });
    apiPromise.catch(() => (apiPromise = null));
  }
  return Promise.race([
    apiPromise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
  ]);
}

const API_OFF = 'ktk:playlist-api-off';

/**
 * Optional: fetch playlist items via the /api/playlist function (needs YOUTUBE_API_KEY).
 * Returns null when the function isn't deployed / has no key, and stops trying for the session.
 */
export async function fetchPlaylistItems(playlistId: string): Promise<Episode[] | null> {
  if (sessionStorage.getItem(API_OFF)) return null;
  try {
    const res = await fetch(`/api/playlist?id=${encodeURIComponent(playlistId)}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) {
      if (res.status !== 400 && res.status !== 502) sessionStorage.setItem(API_OFF, '1');
      return null;
    }
    const data = (await res.json()) as { items?: Episode[] };
    return data.items?.length ? data.items : null;
  } catch {
    sessionStorage.setItem(API_OFF, '1');
    return null;
  }
}

const ART_OFF = 'ktk:art-api-off';

/** Keyless real artwork via the /api/art function. Null if unavailable. */
export async function fetchPlaylistArt(playlistId: string): Promise<string | null> {
  if (sessionStorage.getItem(ART_OFF)) return null;
  try {
    const res = await fetch(`/api/art?list=${encodeURIComponent(playlistId)}`);
    if (!res.headers.get('content-type')?.includes('json')) {
      sessionStorage.setItem(ART_OFF, '1'); // function not deployed (e.g. local dev)
      return null;
    }
    if (!res.ok) return null;
    return ((await res.json()) as { videoId?: string }).videoId ?? null;
  } catch {
    return null;
  }
}

/** Remembers each playlist's first episode (keyed by playlist ID) so its card can show real artwork. */
export const getArtCache = () => load<Record<string, string>>('art2', {});
export function rememberArt(playlistId: string, videoId: string) {
  const art = getArtCache();
  if (art[playlistId] !== videoId) save('art2', { ...art, [playlistId]: videoId });
}
