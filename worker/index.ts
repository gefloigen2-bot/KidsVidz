import { ASSETS } from './assets.generated';
import { onRequestGet as art } from '../functions/api/art';
import { onRequestGet as playlist } from '../functions/api/playlist';
import type { Env } from '../functions/types';
import { parshaEpisodes } from './parsha';

const SECURITY_HEADERS = {
  // YouTube embeds fail (error 153) without a Referer, so never use no-referrer here.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const decode = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export default {
  async fetch(request: Request, env: Env, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/art') return art({ request, env });
    if (pathname === '/api/playlist') return playlist({ request, env });
    if (pathname === '/api/parsha') return parshaEpisodes(request, ctx);

    // SPA: unknown paths without a file extension get index.html.
    const asset = ASSETS[pathname] ?? (pathname.includes('.') ? undefined : ASSETS['/index.html']);
    if (!asset) return new Response('Not found', { status: 404, headers: SECURITY_HEADERS });

    const hashed = pathname.startsWith('/assets/');
    return new Response(asset.text ?? decode(asset.b64!), {
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': asset.type,
        'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
      },
    });
  },
};
