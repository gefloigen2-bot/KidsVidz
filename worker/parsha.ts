import cfg from '../src/data/parsha-sources.json';

/**
 * GET /api/parsha?names=Vayetzei[,…] — live parsha episodes from the source playlists
 * (YouTube's public playlist pages), so new weekly episodes appear without a redeploy.
 * Cached at Cloudflare's edge for 6 hours.
 */
const HDR = { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };

function* walk(o: unknown, key: string): Generator<any> {
  if (Array.isArray(o)) for (const v of o) yield* walk(v, key);
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      if (k === key) yield v;
      yield* walk(v, key);
    }
  }
}

/** Videos in a playlist, keeping only those uploaded by the playlist's main channel (no strays). */
async function playlistVideos(list: string): Promise<{ videoId: string; title: string }[]> {
  const html = await (await fetch(`https://www.youtube.com/playlist?list=${list}`, { headers: HDR })).text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) return [];
  const data = JSON.parse(m[1]);
  const out: { videoId: string; title: string; channel: string }[] = [];
  for (const c of walk(data.contents, 'lockupViewModel')) {
    if (c.contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO') continue;
    const texts = [...walk(c.metadata, 'content')].filter((t) => typeof t === 'string');
    out.push({ videoId: c.contentId, title: texts[0] ?? '', channel: texts[1] ?? '' });
  }
  const counts = new Map<string, number>();
  out.forEach((v) => counts.set(v.channel, (counts.get(v.channel) ?? 0) + 1));
  const main = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return out.filter((v) => v.channel === main).map(({ videoId, title }) => ({ videoId, title }));
}

const normalize = (t: string) => t.toLowerCase().replace(/'/g, '').replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ');

export async function parshaEpisodes(req: Request, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
  const cache = (caches as any).default as Cache;
  const hit = await cache.match(req);
  if (hit) return hit;

  const names = (new URL(req.url).searchParams.get('names') ?? '').split(',').filter((n) => n in cfg.aliases);
  if (!names.length) return Response.json({ error: 'unknown parsha' }, { status: 400 });
  const rx = names.map((n) => new RegExp((cfg.aliases as Record<string, string>)[n]));

  const lists = await Promise.all(cfg.sources.map((s) => playlistVideos(s.list).catch(() => [])));
  const seen = new Set<string>();
  const episodes = cfg.sources.flatMap((s, i) =>
    lists[i]
      .filter((v) => !/yiddish|אידיש/i.test(v.title) && rx.some((r) => r.test(normalize(v.title))))
      .filter((v) => !seen.has(v.videoId) && seen.add(v.videoId))
      .map((v) => ({ ...v, label: s.label, showId: s.showId })),
  );

  const res = Response.json({ episodes }, { headers: { 'Cache-Control': 'public, max-age=21600' } });
  ctx?.waitUntil(cache.put(req, res.clone()));
  return res;
}
