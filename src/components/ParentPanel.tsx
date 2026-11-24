import { useEffect, useRef, useState } from 'react';
import type { AgeGroup, Show, TimerState } from '../types';
import { parseYouTubeUrl, thumbUrl } from '../utils/youtubeParser';
import { fmtBytes, importFile, localVideoUsage } from '../utils/localStore';

const PALETTE = ['#2563EB', '#DC2626', '#16A34A', '#7C3AED', '#D97706', '#0891B2', '#DB2777', '#4F46E5', '#0D9488'];
const CATEGORIES = [
  ['songs-stories', 'Songs & Stories'],
  ['aleph-beis', 'Aleph-Beis'],
  ['puppets', 'Puppets'],
  ['stories', 'Stories'],
  ['yom-tov', 'Shabbos & Yom Tov'],
  ['niggunim', 'Niggunim'],
] as const;

interface Props {
  seedShows: Show[];
  parentShows: Show[];
  hidden: string[];
  timer: TimerState;
  onPlay: (show: Show) => void;
  onAdd: (show: Show) => void;
  onRemove: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onImport: (shows: Show[]) => void;
  onTimer: (t: TimerState) => void;
  onClose: () => void;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'show';

export default function ParentPanel(p: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [age, setAge] = useState<AgeGroup>('all');
  const [category, setCategory] = useState<string>('songs-stories');
  const [note, setNote] = useState('');
  const [find, setFind] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = parseYouTubeUrl(url);

  // Offline "My Videos" state
  const [picked, setPicked] = useState<File[]>([]);
  const [localTitle, setLocalTitle] = useState('');
  const [localAge, setLocalAge] = useState<AgeGroup>('all');
  const [localCategory, setLocalCategory] = useState<string>('songs-stories');
  const [busy, setBusy] = useState('');
  const [usage, setUsage] = useState<{ count: number; bytes: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const refreshUsage = () => localVideoUsage().then(setUsage).catch(() => {});
  useEffect(() => {
    refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveLocal = async () => {
    if (!picked.length || busy) return;
    setBusy('Reading videos…');
    try {
      // Ask the browser not to evict these videos when disk runs low.
      await navigator.storage?.persist?.().catch(() => false);
      const episodes = [];
      for (let i = 0; i < picked.length; i++) {
        setBusy(`Adding video ${i + 1} of ${picked.length}…`);
        episodes.push(await importFile(picked[i], i));
      }
      const name = localTitle.trim() || 'My Videos';
      const show: Show = {
        id: `${slug(name)}-${Date.now().toString(36)}`,
        title: name,
        ageGroup: localAge,
        category: localCategory,
        type: 'local',
        youtubeId: '',
        localEpisodes: episodes,
        thumbnail: episodes[0]?.thumb ?? '',
        accentColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        addedByParent: true,
      };
      p.onAdd(show);
      setPicked([]);
      setLocalTitle('');
      setNote(`Saved “${show.title}” (${episodes.length} video${episodes.length > 1 ? 's' : ''}). It plays with no internet.`);
      refreshUsage();
    } catch {
      setNote('Could not save those videos. This computer may be low on storage.');
    }
    setBusy('');
  };

  const buildShow = (): Show | null => {
    if (!parsed) return null;
    const isList = Boolean(parsed.playlistId);
    const name = title.trim() || (isList ? 'My Playlist' : 'My Video');
    return {
      id: `${slug(name)}-${Date.now().toString(36)}`,
      title: name,
      ageGroup: age,
      category,
      type: isList ? 'playlist' : 'video',
      youtubeId: (isList ? parsed.playlistId : parsed.videoId)!,
      ...(isList && parsed.videoId ? { startVideoId: parsed.videoId } : {}),
      thumbnail: parsed.videoId ? thumbUrl(parsed.videoId) : '',
      accentColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      addedByParent: true,
    };
  };

  const save = () => {
    const s = buildShow();
    if (!s) return;
    p.onAdd(s);
    setUrl('');
    setTitle('');
    setNote(`Saved “${s.title}”.`);
  };

  const exportJson = () => {
    // Offline ('local') shows are left out: their video files live on this device
    // and cannot travel inside a JSON file.
    const shows = [...p.seedShows.filter((s) => !p.hidden.includes(s.id)), ...p.parentShows]
      .filter((s) => s.type !== 'local')
      .map(({ addedByParent: _a, ...rest }) => rest);
    const blob = new Blob([JSON.stringify({ shows }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'catalog.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { shows?: Show[] };
      const seedIds = new Set(p.seedShows.map((s) => s.id));
      const incoming = (data.shows ?? []).filter(
        (s) => s && s.id && s.youtubeId && (s.type === 'video' || s.type === 'playlist' || (s.type === 'list' && Array.isArray(s.videoIds) && s.videoIds.length > 0)) && !seedIds.has(s.id),
      ); // 'local' shows are skipped: their video files are not in the JSON.
      p.onImport(incoming.map((s) => ({ ...s, addedByParent: true })));
      setNote(`Imported ${incoming.length} show(s).`);
    } catch {
      setNote('That file is not valid catalog JSON.');
    }
  };

  const setTimer = (mode: TimerState['mode'], limit: number) =>
    p.onTimer({ ...p.timer, mode, limit, startedAt: Date.now(), watched: 0 });

  const timerStatus =
    p.timer.mode === 'episodes'
      ? `${p.timer.watched} of ${p.timer.limit} episode(s) watched`
      : p.timer.mode === 'minutes'
        ? `${Math.max(0, Math.ceil(p.timer.limit - (Date.now() - p.timer.startedAt) / 60000))} min left`
        : 'No limit';

  const field = 'w-full rounded-xl border-2 border-slate-200 p-3 text-lg outline-none focus:border-blue-500';
  const chip = (on: boolean) =>
    `h-12 rounded-xl px-4 font-bold ${on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100">
      <div className="mx-auto max-w-3xl space-y-5 p-4 pb-16 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-800">🔓 Parent Mode</h2>
          <button onClick={p.onClose} className="h-12 rounded-xl bg-slate-800 px-6 text-lg font-bold text-white">
            Done
          </button>
        </div>
        {note && <p className="rounded-xl bg-emerald-100 p-3 font-semibold text-emerald-800">{note}</p>}

        <section className="space-y-3 rounded-2xl bg-white p-5 shadow">
          <h3 className="text-xl font-bold">Paste a YouTube link</h3>
          <input
            className={field}
            placeholder="youtube.com/watch?v=…  ·  youtu.be/…  ·  playlist?list=…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {url && !parsed && <p className="text-red-600">Couldn’t find a video or playlist ID in that link.</p>}
          {parsed && (
            <>
              <p className="text-sm text-slate-600">
                {parsed.playlistId && <>Playlist <code>{parsed.playlistId}</code> </>}
                {parsed.videoId && <>Video <code>{parsed.videoId}</code></>}
              </p>
              {parsed.videoId && (
                <img src={thumbUrl(parsed.videoId, 'mq')} alt="" className="h-28 rounded-xl object-cover" />
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <input className={`${field} sm:col-span-3`} placeholder="Name (e.g. Uncle Moishy Chanukah)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <select className={field} value={age} onChange={(e) => setAge(e.target.value as AgeGroup)}>
                  <option value="all">All ages</option>
                  <option value="2-3">Ages 2–3</option>
                  <option value="4-5">Ages 4–5</option>
                  <option value="7+">Ages 7+ (All only)</option>
                </select>
                <select className={`${field} sm:col-span-2`} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { const s = buildShow(); if (s) p.onPlay(s); }} className="h-12 rounded-xl bg-emerald-600 px-5 font-bold text-white">
                  ▶ Play now
                </button>
                <button onClick={save} className="h-12 rounded-xl bg-blue-600 px-5 font-bold text-white">
                  ＋ Save to kids’ shows
                </button>
              </div>
            </>
          )}
        </section>

        <section
          className={`space-y-3 rounded-2xl bg-white p-5 shadow ${dragging ? 'ring-4 ring-blue-400' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('video/'));
            if (files.length) setPicked((cur) => [...cur, ...files]);
          }}
        >
          <h3 className="text-xl font-bold">Videos saved on this computer (no internet needed)</h3>
          <p className="text-sm text-slate-600">
            Pick video files from this computer, or drag them onto this box. They are copied into the app and play
            offline, with their own thumbnails, in the same kids’ player. Use videos you made or are allowed to
            download — YouTube’s rules do not allow saving YouTube videos.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => videoRef.current?.click()} className="h-12 rounded-xl bg-slate-800 px-5 font-bold text-white">
              📁 Pick videos
            </button>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              multiple
              hidden
              onChange={(e) => setPicked(Array.from(e.target.files ?? []))}
            />
            {picked.length > 0 && (
              <span className="self-center font-semibold text-slate-700">
                {picked.length} video{picked.length > 1 ? 's' : ''} · {fmtBytes(picked.reduce((n, f) => n + f.size, 0))}
              </span>
            )}
          </div>
          {picked.length > 0 && (
            <>
              <ul className="max-h-40 divide-y overflow-y-auto rounded-xl border-2 border-slate-100">
                {picked.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="shrink-0 text-slate-400">{fmtBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-3 sm:grid-cols-3">
                <input className={`${field} sm:col-span-3`} placeholder="Name (e.g. Family Trip Videos)" value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} />
                <select className={field} value={localAge} onChange={(e) => setLocalAge(e.target.value as AgeGroup)}>
                  <option value="all">All ages</option>
                  <option value="2-3">Ages 2–3</option>
                  <option value="4-5">Ages 4–5</option>
                  <option value="7+">Ages 7+ (All only)</option>
                </select>
                <select className={`${field} sm:col-span-2`} value={localCategory} onChange={(e) => setLocalCategory(e.target.value)}>
                  {CATEGORIES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <button onClick={saveLocal} disabled={Boolean(busy)} className="h-12 rounded-xl bg-blue-600 px-5 font-bold text-white disabled:opacity-50">
                {busy || '＋ Save for offline watching'}
              </button>
            </>
          )}
          {usage && usage.count > 0 && (
            <p className="text-sm text-slate-500">
              Offline videos on this computer: {usage.count} file{usage.count > 1 ? 's' : ''} · {fmtBytes(usage.bytes)}
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 shadow">
          <h3 className="text-xl font-bold">Session timer</h3>
          <p className="text-slate-600">{timerStatus}</p>
          <div className="flex flex-wrap gap-2">
            <button className={chip(p.timer.mode === 'off')} onClick={() => setTimer('off', 0)}>Off</button>
            {[1, 2, 3].map((n) => (
              <button key={`e${n}`} className={chip(p.timer.mode === 'episodes' && p.timer.limit === n)} onClick={() => setTimer('episodes', n)}>
                {n} episode{n > 1 ? 's' : ''}
              </button>
            ))}
            {[10, 20, 30, 45].map((n) => (
              <button key={`m${n}`} className={chip(p.timer.mode === 'minutes' && p.timer.limit === n)} onClick={() => setTimer('minutes', n)}>
                {n} min
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="self-center text-slate-600">Ending screen:</span>
            <button className={chip(p.timer.message === 'bedtime')} onClick={() => p.onTimer({ ...p.timer, message: 'bedtime' })}>🌙 Bedtime</button>
            <button className={chip(p.timer.message === 'shabbos')} onClick={() => p.onTimer({ ...p.timer, message: 'shabbos' })}>🕯️ Shabbos</button>
          </div>
          <p className="text-sm text-slate-500">Choosing a limit starts counting from now.</p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-5 shadow">
          <h3 className="text-xl font-bold">Shows</h3>
          <input className={field} placeholder="Search shows…" value={find} onChange={(e) => setFind(e.target.value)} />
          <ul className="divide-y">
            {[...p.parentShows, ...p.seedShows].filter((s) => s.title.toLowerCase().includes(find.trim().toLowerCase())).map((s) => {
              const isHidden = p.hidden.includes(s.id);
              return (
                <li key={s.id} className="flex items-center gap-3 py-2">
                  <span className="h-6 w-6 shrink-0 rounded-full" style={{ background: s.accentColor }} />
                  <span className={`flex-1 ${isHidden ? 'text-slate-400 line-through' : ''}`}>
                    {s.title}
                    <span className="ml-2 text-xs text-slate-400">{s.type === 'local' ? 'offline' : s.type} · {s.ageGroup}{s.addedByParent ? ' · added' : ''}</span>
                  </span>
                  {s.addedByParent ? (
                    <button onClick={() => { p.onRemove(s.id); if (s.type === 'local') setTimeout(refreshUsage, 500); }} className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700">Remove</button>
                  ) : (
                    <button onClick={() => p.onToggleHidden(s.id)} className="rounded-lg bg-slate-100 px-3 py-2 font-semibold">
                      {isHidden ? 'Show' : 'Hide'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportJson} className="h-12 rounded-xl bg-slate-800 px-5 font-bold text-white">⬇ Export catalog.json</button>
            <button onClick={() => fileRef.current?.click()} className="h-12 rounded-xl bg-slate-200 px-5 font-bold">⬆ Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </div>
          <p className="text-sm text-slate-500">
            Added shows live in this browser. To make them permanent for every device, replace
            <code> src/data/catalog.json</code> with the export and redeploy.
          </p>
        </section>
      </div>
    </div>
  );
}
