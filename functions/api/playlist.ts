import type { PagesFunction } from '../types';

/**
 * OPTIONAL. Returns { items: [{ videoId, title }] } for a playlist using the
 * YouTube Data API v3. Requires the YOUTUBE_API_KEY variable in Cloudflare Pages.
 * Without it, the app falls back to the IFrame API (zero keys needed).
 */
const MAX_PAGES = 4; // 200 items

interface ApiItem {
  snippet?: { title?: string; resourceId?: { videoId?: string } };
  status?: { privacyStatus?: string };
}

export const onRequestGet: PagesFunction = async ({ request: req, env }) => {
  const key = env.YOUTUBE_API_KEY;
  if (!key) return Response.json({ error: 'YOUTUBE_API_KEY not set' }, { status: 501 });

  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(id)) return Response.json({ error: 'bad id' }, { status: 400 });

  const items: { videoId: string; title: string }[] = [];
  let pageToken = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.search = new URLSearchParams({
      part: 'snippet,status',
      maxResults: '50',
      playlistId: id,
      key,
      ...(pageToken ? { pageToken } : {}),
    }).toString();
    const res = await fetch(url);
    if (!res.ok) return Response.json({ error: `YouTube API ${res.status}` }, { status: 502 });
    const data = (await res.json()) as { items?: ApiItem[]; nextPageToken?: string };
    for (const it of data.items ?? []) {
      const videoId = it.snippet?.resourceId?.videoId;
      const privacy = it.status?.privacyStatus;
      if (videoId && (privacy === 'public' || privacy === 'unlisted')) {
        items.push({ videoId, title: it.snippet?.title ?? '' });
      }
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return Response.json({ items }, { headers: { 'Cache-Control': 'public, max-age=21600' } });
};
