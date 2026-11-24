/** Minimal Cloudflare Pages Functions types (avoids a workers-types dependency). */
export interface Env {
  YOUTUBE_API_KEY?: string;
}

export type PagesFunction = (ctx: { request: Request; env: Env }) => Response | Promise<Response>;
