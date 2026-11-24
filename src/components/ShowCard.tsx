import { useState } from 'react';
import type { Show } from '../types';
import ShowArt from './ShowArt';
import { PlayIcon } from './Icons';

interface Props {
  show: Show;
  /** Real thumbnail, or null to use the illustrated art. */
  image: string | null;
  onPlay: () => void;
}

export default function ShowCard({ show, image, onPlay }: Props) {
  const [broken, setBroken] = useState(false);

  return (
    <button
      onClick={onPlay}
      aria-label={show.title}
      className="group flex min-h-20 flex-col overflow-hidden rounded-[2rem] text-left shadow-xl transition active:scale-95 hover:-translate-y-1"
      style={{ background: show.accentColor }}
    >
      <div className="relative m-2 mb-0 aspect-video overflow-hidden rounded-[1.5rem] bg-white/20">
        {show.isNew && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-yellow-300 px-3 py-1 text-sm font-black text-slate-900 shadow">NEW</span>
        )}
        {image && !broken ? (
          <img src={image} alt="" draggable={false} onError={() => setBroken(true)} className="h-full w-full object-cover" />
        ) : (
          <ShowArt show={show} />
        )}
        <PlayIcon
          color={show.accentColor}
          className="absolute bottom-2 right-2 h-14 w-14 drop-shadow-lg transition group-hover:scale-110"
        />
      </div>
      <div className="flex min-h-16 items-center px-4 py-3 text-xl font-black leading-tight text-white drop-shadow sm:text-2xl">
        <span className="line-clamp-2">{show.title}</span>
      </div>
    </button>
  );
}
