import { useEffect, useMemo, useRef, useState } from 'react';
import type { Show } from '../types';
import { useStored } from '../utils/storage';
import { fetchPlaylistArt, fetchPlaylistItems, getArtCache, rememberArt } from '../utils/youtubeApi';
import { thumbUrl } from '../utils/youtubeParser';
import ShowCard from './ShowCard';
import ShowArt from './ShowArt';
import { fetchLiveEpisodes, thisWeeksParsha } from '../utils/parsha';

const FILTERS = [
  { id: 'all', icon: '⭐', label: 'All', sub: '' },
  { id: '2-3', icon: '🎵', label: 'Ages 2–3', sub: 'Songs & Aleph-Beis' },
  { id: '4-5', icon: '📖', label: 'Ages 4–5', sub: 'Stories & Shows' },
  { id: 'yomtov', icon: '🕯️', label: 'Shabbos & Yom Tov', sub: '' },
  { id: 'niggunim', icon: '🎶', label: 'Niggunim', sub: 'with the Rebbe' },
  { id: '7+', icon: '🎓', label: 'Big Kids', sub: 'Ages 7+' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

function matches(show: Show, f: FilterId) {
  if (f === '7+') return show.ageGroup === '7+';
  if (show.ageGroup === '7+') return false; // big-kid shows only under their own button
  if (f === 'all') return true;
  if (f === 'niggunim') return show.category === 'niggunim';
  if (f === 'yomtov') return show.category === 'yom-tov' || show.category === 'shabbos';
  return show.ageGroup === f || show.ageGroup === 'all';
}

const SHELVES = [
  { id: 'songs', icon: '🎵', title: 'Songs' },
  { id: 'niggunim', icon: '🎶', title: 'Niggunim with the Rebbe' },
  { id: 'stories', icon: '📖', title: 'Stories & Shows' },
  { id: 'yomtov', icon: '🕯️', title: 'Shabbos & Yom Tov' },
] as const;

function shelfOf(s: Show): (typeof SHELVES)[number]['id'] {
  if (s.category === 'songs-stories' || s.category === 'aleph-beis') return 'songs';
  if (s.category === 'yom-tov' || s.category === 'shabbos') return 'yomtov';
  if (s.category === 'niggunim') return 'niggunim';
  return 'stories';
}

/** One swipeable row of show cards. Arrow buttons appear on mouse devices (desktop). */
function Shelf({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.85, behavior: 'smooth' });
  const arrow = 'hidden h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-700 shadow-md active:scale-95 sm:flex';
  return (
    <section className="pt-4" aria-label={title}>
      <div className="mb-2 flex items-center gap-2 px-4 sm:px-6">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-black text-slate-800">{title}</h2>
        <div className="ml-auto flex gap-2">
          <button className={arrow} onClick={() => scroll(-1)} aria-label="Scroll left">‹</button>
          <button className={arrow} onClick={() => scroll(1)} aria-label="Scroll right">›</button>
        </div>
      </div>
      <div ref={row} className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 sm:scroll-px-6 sm:px-6">
        {children}
      </div>
    </section>
  );
}

interface Props {
  shows: Show[];
  /** Recently watched show IDs, most recent first. */
  recent: string[];
  onPlay: (show: Show) => void;
  onLock: () => void;
}

export default function Home({ shows, recent, onPlay, onLock }: Props) {
  const [filter, setFilter] = useStored<FilterId>('filter', 'all');
  const [art, setArt] = useState(getArtCache);

  // Fetch real artwork for playlists up front (keyless oEmbed, then API-key function).
  useEffect(() => {
    let alive = true;
    shows
      .filter((s) => s.type === 'playlist' && !art[s.youtubeId] && !s.thumbnail)
      .forEach(async (s) => {
        const videoId = (await fetchPlaylistArt(s.youtubeId)) ?? (await fetchPlaylistItems(s.youtubeId))?.[0]?.videoId;
        if (alive && videoId) {
          rememberArt(s.youtubeId, videoId);
          setArt(getArtCache());
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shows]);

  // A thumbnail used by several shows is a placeholder — show a colourful tile instead
  // until we learn the real first-episode artwork.
  const imageFor = useMemo(() => {
    const counts = new Map<string, number>();
    shows.forEach((s) => counts.set(s.thumbnail, (counts.get(s.thumbnail) ?? 0) + 1));
    return (s: Show) => {
      if (s.type === 'local') return s.thumbnail || null;
      if (s.type === 'video') return thumbUrl(s.youtubeId);
      if (s.type === 'list' && s.videoIds?.length) return thumbUrl(s.videoIds[0]);
      if (s.thumbnail && counts.get(s.thumbnail) === 1) return s.thumbnail;
      return art[s.youtubeId] ? thumbUrl(art[s.youtubeId]) : null;
    };
  }, [shows, art]);

  const visible = shows.filter((s) => matches(s, filter));
  const [parsha, setParsha] = useState(() => thisWeeksParsha());
  useEffect(() => {
    const p = thisWeeksParsha();
    if (!p) return;
    let alive = true;
    fetchLiveEpisodes(p.names).then((live) => {
      if (alive && live && live.length >= p.episodes.length) setParsha({ ...p, episodes: live });
    });
    return () => {
      alive = false;
    };
  }, []);
  const playParsha = (startVideoId: string) => {
    if (!parsha) return;
    onPlay({
      id: `parsha-${parsha.names.join('-')}`,
      title: `Parshas ${parsha.display}`,
      ageGroup: 'all',
      category: 'stories',
      type: 'list',
      youtubeId: parsha.episodes[0].videoId,
      videoIds: parsha.episodes.map((e) => e.videoId),
      startVideoId,
      thumbnail: thumbUrl(parsha.episodes[0].videoId),
      accentColor: '#B45309',
    });
  };
  const keepWatching = filter === 'all'
    ? recent.map((id) => shows.find((s) => s.id === id)).filter((s): s is Show => Boolean(s)).slice(0, 6)
    : [];

  return (
    <div className="min-h-dvh bg-amber-50 bg-[radial-gradient(circle_at_20%_10%,#fde68a_0,transparent_40%),radial-gradient(circle_at_90%_80%,#bfdbfe_0,transparent_40%)] pb-24">
      <div className="flex items-center gap-3 px-4 pt-3 sm:px-6 sm:pt-4">
        <img src="icon.svg" alt="" className="h-9 w-9 sm:h-12 sm:w-12" draggable={false} />
        <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-4xl">
          KosherTube <span className="text-blue-600">Kids</span>
        </h1>
        <button
          onClick={onLock}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-lg opacity-40"
          aria-label="Parent settings"
        >
          🔒
        </button>
      </div>
      <header className="sticky top-0 z-20 bg-amber-50/85 px-4 py-2 backdrop-blur sm:px-6">
        <nav className="no-scrollbar flex gap-3 overflow-x-auto py-1">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`flex h-16 shrink-0 items-center gap-2 rounded-full px-4 shadow-md transition active:scale-95 sm:h-20 sm:gap-3 sm:px-5 ${
                  active ? 'bg-blue-600 text-white ring-4 ring-blue-300' : 'bg-white text-slate-700'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{f.icon}</span>
                <span className="flex flex-col text-left leading-tight">
                  <span className="text-lg font-black">{f.label}</span>
                  {f.sub && <span className="text-xs font-semibold opacity-75">{f.sub}</span>}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {keepWatching.length > 0 && (
        <section className="px-4 pt-2 sm:px-6" aria-label="Keep watching">
          <div className="mb-2 flex items-center gap-2 text-lg font-black text-slate-700">
            <span className="text-2xl">▶️</span> Keep watching
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {keepWatching.map((s) => (
              <button
                key={s.id}
                onClick={() => onPlay(s)}
                aria-label={s.title}
                className="relative h-28 w-48 shrink-0 overflow-hidden rounded-2xl shadow-lg ring-4 active:scale-95 sm:h-32 sm:w-56"
                style={{ '--tw-ring-color': s.accentColor } as React.CSSProperties}
              >
                {imageFor(s) ? (
                  <img src={imageFor(s)!} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <ShowArt show={s} />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {filter === 'all' ? (
        <main>
          {parsha && parsha.episodes.length > 0 && (
            <Shelf icon="📜" title={`This week: Parshas ${parsha.display}`}>
              {parsha.episodes.map((e) => (
                <button
                  key={e.videoId}
                  onClick={() => playParsha(e.videoId)}
                  aria-label={e.title}
                  className="flex w-[78vw] max-w-[420px] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] bg-amber-700 text-left shadow-xl transition active:scale-95 sm:w-[44vw] lg:w-[30vw] xl:w-[23vw]"
                >
                  <span className="relative m-2 mb-0 block aspect-video overflow-hidden rounded-[1.5rem]">
                    <img src={thumbUrl(e.videoId)} alt="" draggable={false} className="h-full w-full object-cover" />
                  </span>
                  <span className="px-4 py-3 text-xl font-black text-white">{e.label}</span>
                </button>
              ))}
            </Shelf>
          )}
          {SHELVES.map((sh) => {
            const list = visible.filter((s) => shelfOf(s) === sh.id).sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
            if (!list.length) return null;
            return (
              <Shelf key={sh.id} icon={sh.icon} title={sh.title}>
                {list.map((s) => (
                  <div key={s.id} className="flex w-[78vw] max-w-[420px] shrink-0 snap-start sm:w-[44vw] lg:w-[30vw] xl:w-[23vw] [&>button]:w-full">
                    <ShowCard show={s} image={imageFor(s)} onPlay={() => onPlay(s)} />
                  </div>
                ))}
              </Shelf>
            );
          })}
        </main>
      ) : (
        <main className="grid grid-cols-1 gap-5 px-4 pt-2 min-[480px]:grid-cols-2 sm:px-6 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((s) => (
            <ShowCard key={s.id} show={s} image={imageFor(s)} onPlay={() => onPlay(s)} />
          ))}
        </main>
      )}

    </div>
  );
}
