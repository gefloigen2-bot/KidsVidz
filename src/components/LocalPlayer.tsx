import { useCallback, useEffect, useRef, useState } from 'react';
import type { Episode, Show } from '../types';
import { getVideo } from '../utils/localStore';
import { useStored } from '../utils/storage';
import EpisodeStrip from './EpisodeStrip';
import { BigChoice } from './Player';
import { PlayIcon } from './Icons';

interface Props {
  show: Show;
  onBack: () => void;
  /** Called when an episode finishes. Return false to stop (session timer hit). */
  onEpisodeEnded: () => boolean;
}

/**
 * Plays offline video files stored on this device (type 'local' shows) with the
 * same kid-proof shell as the YouTube player: no links out, our own controls,
 * our own end screen.
 */
export default function LocalPlayer({ show, onBack, onEpisodeEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [queue] = useState<Episode[]>(() =>
    (show.localEpisodes ?? []).map((e) => ({ videoId: e.id, title: e.title, ...(e.thumb ? { thumb: e.thumb } : {}) })),
  );
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(() => {
    const saved = 0;
    return saved < queue.length ? saved : 0;
  });
  const [missing, setMissing] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nativeFull, setNativeFull] = useState(false);
  const [fakeFull, setFakeFull] = useState(false);
  const isFull = nativeFull || fakeFull;
  const [autoNext, setAutoNext] = useStored('autoNext', true);
  const [progress, setProgress] = useStored<Record<string, number>>('progress', {});

  // Load every episode's blob once; missing files are reported, never fatal.
  useEffect(() => {
    let cancelled = false;
    const made: string[] = [];
    (async () => {
      const out: Record<string, string> = {};
      const gone: string[] = [];
      for (const ep of queue) {
        const blob = await getVideo(ep.videoId).catch(() => null);
        if (cancelled) return;
        if (blob) {
          out[ep.videoId] = URL.createObjectURL(blob);
          made.push(out[ep.videoId]);
        } else {
          gone.push(ep.videoId);
        }
      }
      setUrls(out);
      setMissing(gone);
    })();
    return () => {
      cancelled = true;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one load per mount (App remounts per show via `key`)
  }, []);

  // Resume at the episode the kid reached last time.
  useEffect(() => {
    const saved = progress[show.id] ?? 0;
    if (saved > 0 && saved < queue.length) setIndex(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = queue[index];
  const src = current ? urls[current.videoId] : undefined;

  const playIndex = useCallback(
    (i: number) => {
      if (!queue[i]) return;
      setIndex(i);
      setEnded(false);
      setProgress((p) => ({ ...p, [show.id]: i }));
    },
    [queue, setProgress, show.id],
  );

  // Autoplay each new src; browsers allow it because playback started with a tap.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.play().catch(() => setPaused(true));
  }, [src]);

  // Fullscreen the whole stage (video + our controls), like the YouTube player.
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
      setFakeFull(true);
    }
  };

  const poke = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);
  useEffect(() => {
    if (paused || ended) setShowControls(true);
    else poke();
  }, [paused, ended, poke]);

  const play = () => videoRef.current?.play().catch(() => {});
  const togglePlay = () => {
    if (!showControls) return poke();
    poke();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play();
    else v.pause();
  };
  const step = (dir: 1 | -1) => {
    poke();
    playIndex(index + dir);
  };
  const seek = (v: number) => {
    poke();
    if (videoRef.current) videoRef.current.currentTime = v;
    setTime((t) => ({ ...t, cur: v }));
  };

  const onEnded = () => {
    if (!onEpisodeEnded()) return; // session timer hit — App shows the time-up screen
    if (autoNext && index + 1 < queue.length) playIndex(index + 1);
    else setEnded(true);
  };

  const next = index + 1 < queue.length ? queue[index + 1] : null;
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const ctrlBtn = 'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/90 text-2xl shadow-lg active:scale-90 disabled:opacity-30 sm:h-16 sm:w-16';
  const loading = queue.length > 0 && missing.length < queue.length && !src;

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
          {queue.length > 1 && (
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

      {/* Stage */}
      <div
        ref={stageRef}
        className={`stage flex justify-center ${fakeFull ? 'fake-full fixed inset-0 z-50 items-center bg-black' : ''}`}
      >
        <div className="player-box relative aspect-video overflow-hidden rounded-3xl bg-black shadow-2xl">
          {src && (
            <video
              ref={videoRef}
              src={src}
              className="absolute inset-0 h-full w-full"
              playsInline
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              onEnded={onEnded}
              onTimeUpdate={(e) => setTime({ cur: e.currentTarget.currentTime, dur: e.currentTarget.duration || 0 })}
              onLoadedMetadata={(e) => setTime({ cur: e.currentTarget.currentTime, dur: e.currentTarget.duration || 0 })}
            />
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-7xl">
              <span className="animate-bounce">🎬</span>
            </div>
          )}

          {(queue.length === 0 || missing.length === queue.length) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <span className="text-6xl">📼</span>
              <p className="text-xl font-bold">These videos aren’t on this device anymore.</p>
              <button onClick={onBack} className="h-14 rounded-full bg-amber-300 px-8 text-xl font-black text-slate-900">
                🏠 Shows
              </button>
            </div>
          )}

          {/* Tap anywhere on the video: play / pause. */}
          {src && !ended && <button className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} aria-label={paused ? 'Play' : 'Pause'} />}

          {/* Paused: big play button. */}
          {src && paused && !ended && (
            <button onClick={play} aria-label="Play" className="absolute inset-0 z-20 flex items-center justify-center">
              <PlayIcon className="h-24 w-24 drop-shadow-2xl sm:h-32 sm:w-32" color={show.accentColor} />
            </button>
          )}

          {/* Our own control bar. */}
          {src && !ended && (
            <div
              className={`absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 transition-opacity sm:gap-3 sm:px-4 ${
                showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <button className={ctrlBtn} onClick={() => step(-1)} disabled={index === 0} aria-label="Previous episode">⏮</button>
              <button className={`${ctrlBtn} !bg-white`} onClick={togglePlay} aria-label={paused ? 'Play' : 'Pause'}>
                {paused ? '▶' : '⏸'}
              </button>
              <button className={ctrlBtn} onClick={() => step(1)} disabled={!next} aria-label="Next episode">⏭</button>
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
                <BigChoice label="Next" onClick={() => playIndex(index + 1)} image={next.thumb} />
              )}
              <BigChoice label="Shows" emoji="🏠" onClick={onBack} />
            </div>
          )}
        </div>
      </div>

      {queue.length > 1 && (
        <EpisodeStrip episodes={queue} current={index} accent={show.accentColor} onPick={playIndex} />
      )}
    </div>
  );
}
