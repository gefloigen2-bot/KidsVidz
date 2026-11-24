# KosherTube Kids

Walled-garden, ad-free video portal for young children. React 18 + TypeScript + Vite + Tailwind, hosted as a Cloudflare Worker.

```bash
npm install
npm run dev      # local
npm test         # URL parser tests
npm run build    # → dist/
```

**Live:** https://koshertube-kids.ms770ms.workers.dev

**Deploy:** `npm run deploy` (needs a Cloudflare API token). The whole site is packed into one Cloudflare Worker (`worker/`, assets embedded by `scripts/embed-assets.mjs`), so there is no separate asset-upload step. Works with zero YouTube API keys.

Real playlist artwork is fetched keylessly via `/api/art` (YouTube oEmbed); until then cards show built-in illustrations (no animals).

**Optional:** set a `YOUTUBE_API_KEY` secret on the Worker (`wrangler secret put YOUTUBE_API_KEY`) to enable `/api/playlist` (episode titles + real card artwork up front).
Without it, the episode strip is built from the YouTube IFrame API, and playlist cards get real artwork after first play.

## Offline videos
Parent Mode → "Videos saved on this computer": pick video files from the device and they are copied into the
app (IndexedDB) with auto-made thumbnails, and play in the same kid-locked player with no internet at all.
A service worker (`public/sw.js`, filled by `scripts/gen-sw.mjs` at build time) caches the whole app shell
and YouTube thumbnail images, so once the site has loaded once, everything except YouTube playback works
offline. Add videos you own or are allowed to download — YouTube's terms do not allow saving YouTube videos,
so YouTube shows always need internet.

## Curating
- Seed shows: `src/data/catalog.json`.
- Parent Mode: 🔒 bottom-right → math question. Paste any YouTube/613Tube link to play or save, hide seed shows, set a session timer, export/import `catalog.json`.
- Parent-added shows live in that browser's localStorage; export and commit `catalog.json` to make them permanent everywhere.

## Lockout notes
- Embeds use `youtube-nocookie.com`; YouTube's own fullscreen is disabled (`fs=0`) because it would escape the click shields — the app's ⛶ button fullscreens the player *with* shields.
- Our end screen covers YouTube's suggested-videos wall; browser Back returns home instead of leaving.
- On tablets, "Add to Home Screen" launches it fullscreen with no address bar. For a full lock, pair with iPad Guided Access / Android screen pinning.
