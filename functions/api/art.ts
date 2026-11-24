import type { PagesFunction } from '../types';

/**
 * Keyless: asks YouTube's public oEmbed endpoint for a playlist's cover video,
 * so cards can show real artwork. Returns { videoId } or 404.
 */
export const onRequestGet: PagesFunction = async ({ request: req }) => {
  const list = new URL(req.url).searchParams.get('list') ?? '';
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(list)) return Response.json({ error: 'bad id' }, { status: 400 });

  const target = `https://www.youtube.com/playlist?list=${list}`;
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(target)}`);
  if (!res.ok) return Response.json({ error: `oEmbed ${res.status}` }, { status: 404 });

  const data = (await res.json()) as { thumbnail_url?: string };
  const videoId = /\/vi\/([A-Za-z0-9_-]{11})\//.exec(data.thumbnail_url ?? '')?.[1];
  if (!videoId) return Response.json({ error: 'no thumbnail' }, { status: 404 });

  return Response.json({ videoId }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
};
