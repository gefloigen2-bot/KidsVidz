import { useEffect, useRef } from 'react';
import type { Episode } from '../types';
import { thumbUrl } from '../utils/youtubeParser';

interface Props {
  episodes: Episode[];
  current: number;
  accent: string;
  onPick: (i: number) => void;
}

export default function EpisodeStrip({ episodes, current, accent, onPick }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 640) return; // phone grid: don't yank the page away from the player
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-ep="${current}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [current]);

  return (
    <div ref={stripRef} className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-1 py-2 max-sm:grid max-sm:grid-cols-2 max-sm:overflow-visible">
      {episodes.map((ep, i) => {
        const active = i === current;
        return (
          <button
            key={`${ep.videoId}-${i}`}
            data-ep={i}
            onClick={() => onPick(i)}
            aria-label={ep.title || `Episode ${i + 1}`}
            className={`relative h-24 w-40 shrink-0 snap-center overflow-hidden rounded-2xl bg-slate-700 shadow-lg transition active:scale-95 max-sm:aspect-video max-sm:h-auto max-sm:w-full sm:h-28 sm:w-48 ${
              active ? 'scale-105 ring-[6px]' : 'opacity-85'
            }`}
            style={active ? ({ '--tw-ring-color': accent } as React.CSSProperties) : undefined}
          >
            <img
              src={ep.thumb ?? thumbUrl(ep.videoId, 'mq')}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
            <span
              className="absolute bottom-1 left-1 flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-lg font-black text-white shadow"
              style={{ background: accent }}
            >
              {active ? '▶' : i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
