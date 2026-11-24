import { useCallback, useEffect, useMemo, useState } from 'react';
import catalog from './data/catalog.json';
import type { Show, TimerState } from './types';
import { useStored } from './utils/storage';
import { deleteVideos } from './utils/localStore';
import Home from './components/Home';
import Player from './components/Player';
import LocalPlayer from './components/LocalPlayer';
import ParentGate from './components/ParentGate';
import ParentPanel from './components/ParentPanel';
import TimeUp from './components/TimeUp';

const SEED = catalog.shows as Show[];
const DEFAULT_TIMER: TimerState = { mode: 'off', limit: 0, startedAt: 0, watched: 0, message: 'bedtime' };

const isTimeUp = (t: TimerState, now: number) =>
  (t.mode === 'episodes' && t.watched >= t.limit) ||
  (t.mode === 'minutes' && now - t.startedAt >= t.limit * 60_000);

export default function App() {
  const [parentShows, setParentShows] = useStored<Show[]>('parentShows', []);
  const [hidden, setHidden] = useStored<string[]>('hidden', []);
  const [timer, setTimer] = useStored<TimerState>('timer', DEFAULT_TIMER);
  const [playing, setPlayingRaw] = useState<Show | null>(null);
  const [recent, setRecent] = useStored<string[]>('recent', []);
  const setPlaying = useCallback(
    (s: Show | null) => {
      setPlayingRaw(s);
      if (s) setRecent((r) => [s.id, ...r.filter((x) => x !== s.id)].slice(0, 12));
    },
    [setRecent],
  );
  const [gate, setGate] = useState<null | 'panel' | 'unlock'>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (timer.mode !== 'minutes') return;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [timer.mode]);

  const shows = useMemo(
    () => [...parentShows, ...SEED.filter((s) => !hidden.includes(s.id))],
    [parentShows, hidden],
  );
  const timeUp = isTimeUp(timer, now);

  // Keep a toddler from leaving with the browser back button: back = "home".
  useEffect(() => {
    history.pushState(null, '', location.href);
    const onPop = () => {
      history.pushState(null, '', location.href);
      setPlaying(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const onEpisodeEnded = useCallback(() => {
    if (timer.mode === 'episodes') {
      const watched = timer.watched + 1;
      setTimer({ ...timer, watched });
      return watched < timer.limit;
    }
    setNow(Date.now());
    return !isTimeUp(timer, Date.now());
  }, [setTimer, timer]);

  const passGate = () => {
    if (gate === 'unlock') {
      setTimer({ ...DEFAULT_TIMER, message: timer.message }); // unlock = limit off
      setPlaying(null);
    } else {
      setPanelOpen(true);
    }
    setGate(null);
  };

  return (
    <div className="select-none" onContextMenu={(e) => e.preventDefault()}>
      {playing && !timeUp ? (
        playing.type === 'local' ? (
          <LocalPlayer key={playing.id} show={playing} onBack={() => setPlaying(null)} onEpisodeEnded={onEpisodeEnded} />
        ) : (
          <Player key={playing.id} show={playing} onBack={() => setPlaying(null)} onEpisodeEnded={onEpisodeEnded} />
        )
      ) : (
        <Home shows={shows} recent={recent} onPlay={setPlaying} onLock={() => setGate('panel')} />
      )}

      {timeUp && !panelOpen && <TimeUp message={timer.message} onUnlock={() => setGate('unlock')} />}

      {panelOpen && (
        <ParentPanel
          seedShows={SEED}
          parentShows={parentShows}
          hidden={hidden}
          timer={timer}
          onPlay={(s) => {
            setPanelOpen(false);
            setPlaying(s);
          }}
          onAdd={(s) => setParentShows((list) => [s, ...list])}
          onRemove={(id) =>
            setParentShows((list) => {
              const gone = list.find((s) => s.id === id);
              if (gone?.type === 'local' && gone.localEpisodes?.length)
                deleteVideos(gone.localEpisodes.map((e) => e.id)).catch(() => {});
              return list.filter((s) => s.id !== id);
            })
          }
          onToggleHidden={(id) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))}
          onImport={(incoming) =>
            setParentShows((list) => [...incoming.filter((s) => !list.some((x) => x.id === s.id)), ...list])
          }
          onTimer={(t) => {
            setTimer(t);
            setNow(Date.now());
          }}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {gate && <ParentGate onPass={passGate} onCancel={() => setGate(null)} />}
    </div>
  );
}

