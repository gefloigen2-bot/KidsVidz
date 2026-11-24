import { useCallback, useEffect, useRef, useState } from 'react';
import type { Episode, Show } from '../types';
import { fetchPlaylistItems, loadYouTubeApi, rememberArt } from '../utils/youtubeApi';
import { playlistEmbedUrl, thumbUrl, videoEmbedUrl } from '../utils/youtubeParser';
import { useStored } from '../utils/storage';
import EpisodeStrip from './EpisodeStrip';
import { PlayIcon } from './Icons';

interface Props {
  show: Show;
  onBack: () => void;
  /** Called when an episode finishes. Return false to stop (session timer hit). */
  onEpisodeEnded: () => boolean;
}

type Mode = 'loading' | 'api' | 'iframe';

export default function Player({ show, onBack, onEpisodeEnded }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);

  const [mode, setMode] = useState<Mode>('loading');
  const [queue, setQueue] = useState<Episode[] | null>(null);
  const [index, setIndex] = useState(0);
  const [ended, setEnded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ytState, setYtState] = useState(-1);
  const [needsTap, setNeedsTap] = useState(false); // autoplay blocked (e.g. iPhone): wait for a tap
  const [unlocked, setUnlocked] = useState(false); // last resort: let one tap reach YouTube's own play button
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nativeFull, setNativeFull] = useState(false);
  const [fakeFull, setFakeFull] = useState(false); // iPhone Safari has no element fullscreen
  const isFull = nativeFull || fakeFull;
  const lastVideo = useRef<string | null>(null);
  const [autoNext, setAutoNext] = useStored('autoNext', true);
  const [progress, setProgress] = useStored<Record<string, number>>('progress', {});

  // Refs so YouTube event callbacks always see the latest values.
  const latest = useRef({ queue, index, autoNext, onEpisodeEnded });
  latest.current = { queue, index, autoNext, onEpisodeEnded };

  const playIndex = useCallback(
    (i: number) => {
      const q = latest.current.queue;
      if (!q || !q[i]) return;
      setIndex(i);
      setEnded(false);
      setProgress((p) => ({ ...p, [show.id]: i }));
      playerRef.current?.loadVideoById(q[i].videoId);
    },
    [setProgress, show.id],
  );

  useEffect(() => {
    let cancelled = false;
    let player: YT.Player | null = null;

    const startIndexFor = (q: Episode[]) => {
      if (show.startVideoId) {
        const i = q.findIndex((e) => e.videoId === show.startVideoId);
        if (i >= 0) return i;
      }
      const saved = progress[show.id] ?? 0;
      return saved < q.length ? saved : 0;
    };

    const adoptQueue = (q: Episode[]) => {
      const start = startIndexFor(q);
      setQueue(q);
      setIndex(start);
      latest.current.queue = q;
      latest.current.index = start;
      if (show.type === 'playlist') rememberArt(show.youtubeId, q[0].videoId);
      return start;
    };

    (async () => {
      let q: Episode[] | null =
        show.type === 'video'
          ? [{ videoId: show.youtubeId, title: show.title }]
          : show.type === 'list'
            ? (show.videoIds ?? []).map((videoId) => ({ videoId }))
            : await fetchPlaylistItems(show.youtubeId);

      let YTApi: typeof YT;
      try {
        YTApi = await loadYouTubeApi();
      } catch {
        if (!cancelled) setMode('iframe'); // spec'd plain-embed fallback
        return;
      }
      if (cancelled || !hostRef.current) return;

      const start = q ? adoptQueue(q) : 0;
      const target = document.createElement('div');
      hostRef.current.replaceChildren(target);

      // Safety net: if the API player errors or never becomes ready, use the plain embed.
      const fallback = () => {
        if (cancelled) return;
        try {
          player?.destroy();
        } catch {
          /* ignore */
        }
        player = null;
        playerRef.current = null;
        setMode('iframe');
      };
      const watchdog = setTimeout(fallback, 10000);

      try {
      player = new YTApi.Player(target, {
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        // Only pass videoId when known: the API throws "Invalid video id" on undefined.
        ...(q ? { videoId: q[start].videoId } : {}),
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          controls: 0, // no YouTube controls at all; ours are drawn on top
          disablekb: 1,
          fs: 0, // YouTube's own fullscreen would escape our click shields; we provide one instead.
          cc_load_policy: 0,
          autoplay: q ? 1 : 0,
          origin: window.location.origin,
          ...(q ? {} : { listType: 'playlist', list: show.youtubeId }),
        } as YT.PlayerVars,
        events: {
          onReady: (e) => {
            clearTimeout(watchdog);
            if (cancelled) return;
            setMode('api');
            // If autoplay was blocked, show our big play button instead of a black box.
            setTimeout(() => {
              if (cancelled) return;
              const st = e.target.getPlayerState?.();
              if (st !== YTApi.PlayerState.PLAYING && st !== YTApi.PlayerState.BUFFERING) setNeedsTap(true);
            }, 2500);
            if (q) return;
            // Zero-API-key path: read the playlist's video IDs from the cued player.
            let tries = 0;
            const poll = () => {
              if (cancelled) return;
              const ids = e.target.getPlaylist?.();
              if (ids?.length) {
                q = ids.map((videoId) => ({ videoId }));
                const s = adoptQueue(q);
                e.target.loadVideoById(q[s].videoId);
              } else if (++tries < 24) {
                setTimeout(poll, 250);
              } else {
                e.target.playVideo(); // give up on the strip; native playlist playback still works
              }
            };
            poll();
          },
          onStateChange: (e) => {
            setPaused(e.data === YTApi.PlayerState.PAUSED);
            setYtState(e.data);
            if (e.data === YTApi.PlayerState.PLAYING || e.data === YTApi.PlayerState.BUFFERING) {
              setNeedsTap(false);
              setUnlocked(false);
            }
            if (e.data === YTApi.PlayerState.PLAYING) {
              setEnded(false);
              // Captions off by default for each new video (YouTube may auto-enable them).
              const vid = (e.target as any).getVideoData?.()?.video_id ?? null;
              if (vid && vid !== lastVideo.current) {
                lastVideo.current = vid;
                try {
                  (e.target as any).unloadModule?.('captions');
                  (e.target as any).unloadModule?.('cc');
                } catch {
                  /* not supported */
                }
              }
            }
            if (e.data !== YTApi.PlayerState.ENDED) return;
            const { queue: cq, index: ci, autoNext: an, onEpisodeEnded: done } = latest.current;
            if (!done()) return; // timer reached — App swaps in the time-up screen
            if (!cq) return; // native playlist mode: YouTube advances by itself
            if (an && ci + 1 < cq.length) playIndex(ci + 1);
            else setEnded(true); // our end screen hides YouTube's suggested-video wall
          },
          onError: () => {
            // Unavailable/private video: skip it rather than leave a toddler on an error screen.
            const { queue: cq, index: ci } = latest.current;
            if (cq && ci + 1 < cq.length) playIndex(ci + 1);
            else setEnded(true);
          },
        },
      });
      } catch {
        clearTimeout(watchdog);
        fallback();
        return;
      }
      playerRef.current = player;
    })();

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remounted per show via `key`
  }, [show.id]);

  // Fullscreen the whole stage (iframe + shields), never the bare iframe.
  useEffect(() => {
    const onChange = () => setNativeFull(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);
  const stage = stageRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
  const canFullscreen =
    typeof document !== 'undefined' &&
    Boolean(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled);
  const toggleFull = () => {
    if (fakeFull) return setFakeFull(false);
    if (nativeFull) {
      (document.exitFullscreen ?? (document as any).webkitExitFullscreen)?.call(document);
    } else if (stage && canFullscreen) {
      (stage.requestFullscreen ?? stage.webkitRequestFullscreen)?.call(stage);
    } else {
      setFakeFull(true); // CSS fullscreen fallback (e.g. iPhone)
    }
  };

  const next = queue && index + 1 < queue.length ? queue[index + 1] : null;
  const prevOk = queue ? index > 0 : true;
  const nextOk = queue ? index + 1 < queue.length : true;
  const iframeSrc =
    show.type === 'video'
      ? videoEmbedUrl(show.youtubeId)
      : show.type === 'list'
        ? `${videoEmbedUrl(show.videoIds?.[0] ?? show.youtubeId)}&playlist=${(show.videoIds ?? []).slice(1).join(',')}`
        : playlistEmbedUrl(show.youtubeId);
  const isPlaying = ytState === 1 || ytState === 3;
  const api = mode === 'api';

  // Progress for our own seek bar.
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      const pl = playerRef.current;
      if (!pl?.getCurrentTime) return;
      setTime({ cur: pl.getCurrentTime() || 0, dur: pl.getDuration() || 0 });
    }, 500);
    return () => clearInterval(id);
  }, [api]);

  // Our controls auto-hide while playing; any tap brings them back.
  const poke = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);
  useEffect(() => {
    if (!isPlaying) setShowControls(true);
    else poke();
  }, [isPlaying, poke]);

  const play = () => {
    const pl = playerRef.current;
    if (!pl) return;
    pl.playVideo();
    // Some browsers (iPhone) only start playback from a tap inside the video itself.
    setTimeout(() => {
      const st = pl.getPlayerState?.();
      if (st !== 1 && st !== 3) setUnlocked(true);
    }, 1500);
  };
  const togglePlay = () => {
    if (!showControls) return poke(); // first tap just shows the controls
    poke();
    if (isPlaying) playerRef.current?.pauseVideo();
    else play();
  };
  const step = (dir: 1 | -1) => {
    poke();
    if (queue) playIndex(index + dir);
    else if (dir > 0) playerRef.current?.nextVideo();
    else playerRef.current?.previousVideo();
  };
  const seek = (v: number) => {
    poke();
    setTime((t) => ({ ...t, cur: v }));
    playerRef.current?.seekTo(v, true);
  };
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const showBigPlay = api && !ended && !unlocked && (paused || needsTap || ytState === 5);
  const ctrlBtn = 'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/90 text-2xl shadow-lg active:scale-90 disabled:opacity-30 sm:h-16 sm:w-16';

  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-slate-900 p-3 sm:p-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-16 min-w-16 items-center gap-3 rounded-full bg-amber-300 px-6 text-2xl font-black text-slate-900 shadow-lg active:scale-95"
          aria-label="Back to shows"
        >
          <span className="text-3xl">🏠</span>
          <span className="hidden sm:inline">Shows</span>
        </button>
        <div
          className="hidden flex-1 truncate rounded-full px-5 py-3 text-xl font-bold text-white md:block"
          style={{ background: show.accentColor }}
        >
          {show.title}
        </div>
        <div className="ml-auto flex gap-3">
          {queue && queue.length > 1 && (
            <button
              onClick={() => setAutoNext(!autoNext)}
              className={`flex h-16 items-center gap-2 rounded-full px-5 text-lg font-bold shadow-lg active:scale-95 ${
                autoNext ? 'bg-emerald-400 text-slate-900' : 'bg-slate-600 text-slate-200'
              }`}
              aria-pressed={autoNext}
              aria-label="Auto-play next"
            >
              <span className="text-3xl">{autoNext ? '🔁' : '⏹️'}</span>
              <span>{autoNext ? 'ON' : 'OFF'}</span>
            </button>
          )}
          <button
            onClick={toggleFull}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-400 text-3xl shadow-lg active:scale-95"
            aria-label="Full screen"
          >
            ⛶
          </button>
        </div>
      </div>

      {/* Stage: fullscreen target containing the video and all of our controls */}
      <div
        ref={stageRef}
        className={`stage flex justify-center ${fakeFull ? 'fake-full fixed inset-0 z-50 items-center bg-black' : ''}`}
      >
        <div className="player-box relative aspect-video overflow-hidden rounded-3xl bg-black shadow-2xl">
          {mode === 'iframe' ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={iframeSrc}
              title={show.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            /* YouTube's player never receives a tap: nothing it draws can link out. */
            <div
              ref={hostRef}
              className={`absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full ${unlocked ? '' : '[&>iframe]:pointer-events-none'}`}
            />
          )}

          {mode === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center text-7xl">
              <span className="animate-bounce">🎬</span>
            </div>
          )}

          {/* Plain-embed fallback only (API unavailable): cover YouTube's links. */}
          {mode === 'iframe' && (
            <>
              <div className="absolute left-0 right-[170px] top-0 z-10 h-[60px]" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 z-10 h-[50px]" aria-hidden />
            </>
          )}

          {/* Tap anywhere on the video: play / pause. */}
          {api && !unlocked && <button className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} />}

          {/* Last resort when a browser insists on a tap inside YouTube's player: only the title stays covered. */}
          {unlocked && (
            <>
              <div className="absolute inset-x-0 top-0 z-10 h-[64px]" aria-hidden />
              <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 animate-bounce text-5xl">👆</div>
            </>
          )}

          {/* Whenever the video isn't actually playing, YouTube draws its title / "More videos" UI.
              Hide it behind a black curtain with our own spinner. */}
          {api && !unlocked && !ended && ytState !== 1 && (
            <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-black">
              {!showBigPlay && <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />}
            </div>
          )}

          {/* Paused / waiting: big play button. */}
          {showBigPlay && (
            <button onClick={play} aria-label="Play" className="absolute inset-0 z-20 flex items-center justify-center">
              <PlayIcon className="h-24 w-24 drop-shadow-2xl sm:h-32 sm:w-32" color={show.accentColor} />
            </button>
          )}

          {/* Our own control bar. */}
          {api && !ended && (
            <div
              className={`absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 transition-opacity sm:gap-3 sm:px-4 ${
                showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <button className={ctrlBtn} onClick={() => step(-1)} disabled={!prevOk} aria-label="Previous episode">⏮</button>
              <button className={`${ctrlBtn} !bg-white`} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className={ctrlBtn} onClick={() => step(1)} disabled={!nextOk} aria-label="Next episode">⏭</button>
              <input
                type="range"
                min={0}
                max={Math.max(1, time.dur)}
                step={1}
                value={Math.min(time.cur, time.dur || 0)}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                className="seek h-10 min-w-0 flex-1"
                style={{ '--accent': show.accentColor } as React.CSSProperties}
              />
              <span className="hidden shrink-0 text-sm font-bold tabular-nums text-white sm:block">
                {fmt(time.cur)} / {fmt(time.dur)}
              </span>
            </div>
          )}

          {isFull && (
            <button
              onClick={toggleFull}
              className="absolute left-3 top-3 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-3xl text-white"
              aria-label="Exit full screen"
            >
              ✕
            </button>
          )}

          {ended && (
            <div className="absolute inset-0 z-40 flex items-center justify-center gap-6 bg-slate-900/95 p-6">
              <BigChoice label="Again" emoji="🔁" onClick={() => playIndex(index)} />
              {next && (
                <BigChoice label="Next" onClick={() => playIndex(index + 1)} image={thumbUrl(next.videoId, 'mq')} />
              )}
              <BigChoice label="Shows" emoji="🏠" onClick={onBack} />
            </div>
          )}
        </div>
      </div>

      {queue && queue.length > 1 && (
        <EpisodeStrip episodes={queue} current={index} accent={show.accentColor} onPick={playIndex} />
      )}
    </div>
  );
}

export function BigChoice({ label, emoji, image, onClick }: { label: string; emoji?: string; image?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-3xl bg-amber-300 text-6xl shadow-xl ring-4 ring-white/40 active:scale-95 sm:h-40 sm:w-40"
    >
      {image ? (
        <span className="relative h-full w-full">
          <img src={image} alt="" draggable={false} className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center">
            <PlayIcon className="h-16 w-16 drop-shadow-lg" />
          </span>
        </span>
      ) : (
        emoji
      )}
    </button>
  );
}
