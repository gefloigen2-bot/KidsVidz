import { useId, type ReactNode } from 'react';
import type { Show } from '../types';

/**
 * Illustrated card art (inline SVG, no network). Used when a show has no real
 * thumbnail yet. Deliberately contains no animals.
 */
export type ArtKind =
  | 'guitar' | 'drum' | 'notes' | 'letters' | 'siddur' | 'puppet' | 'puppet-hat'
  | 'paris' | 'menorah' | 'matzah' | 'candles' | 'book' | 'crown';

const CATEGORY_ART: Record<string, ArtKind> = {
  'songs-stories': 'notes',
  'aleph-beis': 'letters',
  puppets: 'puppet',
  stories: 'book',
  'yom-tov': 'candles',
  niggunim: 'notes',
  shabbos: 'candles',
};

const GOLD = '#FBBF24';
const GOLD_DARK = '#B45309';
const NAVY = '#1E3A8A';
const HEBREW_FONT = "'Arial Hebrew','Noto Sans Hebrew','Arial',sans-serif";

/* ---------- small helpers ---------- */

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
}

function starPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

const Note = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
    <ellipse rx="8" ry="6" transform="rotate(-20)" />
    <rect x="5.5" y="-30" width="3" height="30" rx="1" />
    <path d="M8.5 -30 q13 5 9 19 q-2 -9 -9 -11z" />
  </g>
);

const Flame = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy="-7" r="11" fill="#FDE68A" opacity=".45" />
    <path d="M0 -16 Q7 -5 0 0 Q-7 -5 0 -16Z" fill="#F97316" />
    <path d="M0 -9 Q3.5 -3 0 0 Q-3.5 -3 0 -9Z" fill="#FDE047" />
  </g>
);

const Sparkle = ({ x, y, r = 6 }: { x: number; y: number; r?: number }) => (
  <path
    d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`}
    fill="#FEF9C3"
  />
);

function OpenBook({ cover, children }: { cover: string; children?: ReactNode }) {
  return (
    <g>
      <path d="M160 76 Q122 62 84 70 V146 Q122 138 160 150 Q198 138 236 146 V70 Q198 62 160 76Z" fill={cover} transform="translate(0 6)" />
      <path d="M160 74 Q124 60 90 66 V138 Q124 132 160 144Z" fill="#FFFBEB" />
      <path d="M160 74 Q196 60 230 66 V138 Q196 132 160 144Z" fill="#FFF7E0" />
      <path d="M160 74 V144" stroke="#E7D7B5" strokeWidth="2" />
      {children}
    </g>
  );
}

const PageLines = ({ x1, x2, ys }: { x1: number; x2: number; ys: number[] }) => (
  <g stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round">
    {ys.map((y, i) => <line key={y} x1={x1} y1={y} x2={x2 - (i % 2) * 10} y2={y} />)}
  </g>
);

/* ---------- motifs (viewBox 320 x 180) ---------- */

function Guitar() {
  return (
    <>
      <g transform="translate(160 104) rotate(-28)">
        <rect x="-9" y="-96" width="18" height="22" rx="4" fill="#7C2D12" />
        {[-88, -79].map((y) => [-12, 12].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#FDE68A" />))}
        <rect x="-5.5" y="-76" width="11" height="62" fill="#92400E" />
        <circle cy="-14" r="23" fill="#F59E0B" />
        <circle cy="16" r="31" fill="#F59E0B" />
        <circle cy="10" r="22" fill="#FBBF24" opacity=".6" />
        <circle cy="0" r="9.5" fill="#451A03" />
        <rect x="-14" y="26" width="28" height="6" rx="2" fill="#7C2D12" />
        {[-3, 0, 3].map((x) => <line key={x} x1={x} y1="-92" x2={x} y2="29" stroke="#FEF3C7" strokeWidth="0.9" />)}
      </g>
      <Note x={88} y={70} /> <Note x={238} y={58} s={1.2} /> <Note x={262} y={100} s={0.85} /> <Note x={70} y={128} s={0.8} />
    </>
  );
}

function Drum() {
  return (
    <>
      <g strokeLinecap="round">
        <line x1="112" y1="38" x2="162" y2="76" stroke="#92400E" strokeWidth="6" />
        <line x1="210" y1="36" x2="166" y2="76" stroke="#92400E" strokeWidth="6" />
        <circle cx="110" cy="36" r="8" fill="#FDE68A" />
        <circle cx="212" cy="34" r="8" fill="#FDE68A" />
      </g>
      <rect x="104" y="84" width="112" height="56" fill="#FEF3C7" />
      <path d="M104 92 L132 132 L160 92 L188 132 L216 92" stroke={GOLD_DARK} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <rect x="100" y="80" width="120" height="12" rx="4" fill="#2563EB" />
      <rect x="100" y="132" width="120" height="12" rx="4" fill="#2563EB" />
      <ellipse cx="160" cy="80" rx="60" ry="15" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4" />
      <Note x={70} y={78} /> <Note x={252} y={84} s={1.15} /> <Note x={62} y={132} s={0.8} />
    </>
  );
}

function Notes() {
  return (
    <>
      <g fill="#fff">
        <ellipse cx="136" cy="128" rx="16" ry="11" transform="rotate(-20 136 128)" />
        <ellipse cx="196" cy="116" rx="16" ry="11" transform="rotate(-20 196 116)" />
        <rect x="146" y="54" width="7" height="72" rx="2" />
        <rect x="206" y="42" width="7" height="72" rx="2" />
        <path d="M146 54 L213 42 V60 L146 72Z" />
      </g>
      <Note x={84} y={74} s={0.9} /> <Note x={264} y={92} s={0.8} />
      <Sparkle x={244} y={52} r={9} /> <Sparkle x={96} y={126} r={7} /> <Sparkle x={178} y={30} r={6} />
    </>
  );
}

function Letters({ letters }: { letters: string[] }) {
  const blocks = [
    { x: 100, y: 112, r: -10, c: '#EF4444' },
    { x: 160, y: 90, r: 6, c: '#F59E0B' },
    { x: 220, y: 114, r: -5, c: '#3B82F6' },
  ];
  return (
    <>
      {blocks.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`}>
          <rect x="-29" y="-25" width="62" height="62" rx="11" fill="#000" opacity=".18" />
          <rect x="-31" y="-31" width="62" height="62" rx="11" fill={b.c} />
          <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#fff" />
          <text
            y="3"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={HEBREW_FONT}
            fontWeight="900"
            fontSize="36"
            fill={b.c}
            direction="rtl"
          >
            {letters[i] ?? ''}
          </text>
        </g>
      ))}
      <Sparkle x={262} y={46} r={9} /> <Sparkle x={58} y={58} r={7} />
    </>
  );
}

function Siddur() {
  return (
    <>
      <g opacity=".35" fill="#fff">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="157" y="-2" width="6" height="56" rx="3" transform={`rotate(${i * 30} 160 96) translate(0 -6)`} />
        ))}
      </g>
      <OpenBook cover={NAVY}>
        <text x="196" y="88" textAnchor="middle" fontFamily={HEBREW_FONT} fontWeight="900" fontSize="22" fill={NAVY}>
          שְׁמַע
        </text>
        <PageLines x1={176} x2={218} ys={[104, 116, 128]} />
        <PageLines x1={102} x2={146} ys={[84, 96, 108, 120, 132]} />
      </OpenBook>
    </>
  );
}

function Puppet({ hat }: { hat: boolean }) {
  return (
    <>
      <rect x="66" y="22" width="188" height="140" rx="10" fill="#7C2D12" />
      <rect x="80" y="42" width="160" height="96" fill="#FEF3C7" />
      <path d="M80 42 H124 Q108 92 120 138 H80Z" fill="#DC2626" />
      <path d="M240 42 H196 Q212 92 200 138 H240Z" fill="#DC2626" />
      <path d="M96 46 Q90 92 98 136 M110 46 Q104 92 110 136 M224 46 Q230 92 222 136 M210 46 Q216 92 210 136" stroke="#991B1B" strokeWidth="2.5" fill="none" />
      <rect x="66" y="22" width="188" height="18" fill="#B91C1C" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={80 + i * 20} cy="40" r="10" fill="#B91C1C" />)}
      {/* puppet */}
      <path d="M134 140 Q136 112 160 110 Q184 112 186 140Z" fill="#22C55E" />
      <path d="M140 120 Q124 108 122 92" stroke="#22C55E" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="121" cy="88" r="7" fill="#FDDCB5" />
      <circle cx="136" cy="88" r="6" fill="#FDDCB5" />
      <circle cx="184" cy="88" r="6" fill="#FDDCB5" />
      <circle cx="160" cy="88" r="25" fill="#FDDCB5" />
      <ellipse cx="151" cy="85" rx="4" ry="5" fill="#1F2937" />
      <ellipse cx="169" cy="85" rx="4" ry="5" fill="#1F2937" />
      <circle cx="152.5" cy="83" r="1.5" fill="#fff" />
      <circle cx="170.5" cy="83" r="1.5" fill="#fff" />
      <circle cx="145" cy="95" r="4.5" fill="#FDA4AF" opacity=".8" />
      <circle cx="175" cy="95" r="4.5" fill="#FDA4AF" opacity=".8" />
      <path d="M150 97 Q160 107 170 97" stroke="#7C2D12" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {hat ? (
        <g fill="#111827">
          <rect x="132" y="66" width="56" height="7" rx="3" />
          <rect x="143" y="46" width="34" height="23" rx="6" />
          <rect x="143" y="61" width="34" height="5" fill="#374151" />
        </g>
      ) : (
        <path d="M143 70 Q160 54 177 70Z" fill={NAVY} />
      )}
      <rect x="66" y="132" width="188" height="30" rx="4" fill="#92400E" />
      <rect x="66" y="132" width="188" height="5" fill="#B45309" />
    </>
  );
}

function Paris() {
  return (
    <>
      <circle cx="246" cy="52" r="20" fill="#FDE047" />
      <g fill="#fff" opacity=".9">
        <ellipse cx="86" cy="54" rx="22" ry="10" /> <ellipse cx="102" cy="48" rx="16" ry="10" />
      </g>
      <g fill="#1E293B">
        <path d="M160 24 L165 66 L176 106 L194 148 H175 Q160 120 145 148 H126 L144 106 L155 66Z" />
        <rect x="149" y="64" width="22" height="6" rx="1" />
        <rect x="138" y="102" width="44" height="7" rx="1" />
        <rect x="158" y="14" width="4" height="12" />
      </g>
      <g transform="translate(222 118)">
        <rect x="-4" y="-34" width="8" height="34" rx="2" fill="#94A3B8" />
        <rect x="-28" y="-14" width="56" height="40" rx="8" fill="#F59E0B" />
        <rect x="-28" y="0" width="56" height="6" fill="#B45309" />
        <rect x="-12" y="-22" width="24" height="10" rx="4" fill="none" stroke="#B45309" strokeWidth="4" />
      </g>
      <g transform="translate(96 124)">
        <rect x="-26" y="-14" width="18" height="30" fill="#2563EB" />
        <rect x="-8" y="-14" width="18" height="30" fill="#fff" />
        <rect x="10" y="-14" width="18" height="30" fill="#DC2626" />
      </g>
    </>
  );
}

function Menorah() {
  const xs = [-64, -48, -32, -16, 16, 32, 48, 64];
  return (
    <>
      <g stroke={GOLD} strokeWidth="5" fill="none" strokeLinecap="round">
        {[16, 32, 48, 64].map((dx) => (
          <path key={dx} d={`M${160 - dx} 84 Q${160 - dx} ${84 + dx * 0.8} 160 ${84 + dx * 0.8} Q${160 + dx} ${84 + dx * 0.8} ${160 + dx} 84`} />
        ))}
      </g>
      <rect x="156" y="70" width="8" height="74" fill={GOLD} />
      <path d="M136 152 Q160 138 184 152Z" fill={GOLD} />
      <rect x="132" y="150" width="56" height="6" rx="3" fill={GOLD_DARK} />
      {xs.map((dx, i) => (
        <g key={dx}>
          <rect x={160 + dx - 6} y="82" width="12" height="5" rx="2" fill={GOLD_DARK} />
          <rect x={160 + dx - 3.5} y="64" width="7" height="18" rx="1.5" fill={i % 2 ? '#fff' : '#60A5FA'} />
          <Flame x={160 + dx} y={63} s={0.8} />
        </g>
      ))}
      <rect x="153" y="66" width="14" height="5" rx="2" fill={GOLD_DARK} />
      <rect x="156.5" y="46" width="7" height="20" rx="1.5" fill="#fff" />
      <Flame x={160} y={45} s={0.85} />
      <g transform="translate(250 96) rotate(14)">
        <rect x="-3" y="-34" width="6" height="12" rx="2" fill="#64748B" />
        <path d="M-17 -22 H17 V6 L0 22 L-17 6Z" fill="#3B82F6" />
        <text y="-4" textAnchor="middle" dominantBaseline="central" fontFamily={HEBREW_FONT} fontWeight="900" fontSize="20" fill="#fff">
          ג
        </text>
      </g>
    </>
  );
}

function Matzah() {
  return (
    <>
      <g transform="translate(128 102) rotate(-8)">
        <rect x="-50" y="-48" width="100" height="96" rx="8" fill="#F5D9A8" />
        {[-30, -10, 10, 30].map((y) => <line key={y} x1="-44" y1={y} x2="44" y2={y} stroke="#D6A35C" strokeWidth="2.5" />)}
        {[-38, -20, 0, 20, 38].flatMap((x) => [-40, -20, 0, 20, 40].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" fill="#A16207" />))}
        <circle cx="-22" cy="-14" r="6" fill="#B45309" opacity=".35" />
        <circle cx="24" cy="26" r="8" fill="#B45309" opacity=".3" />
      </g>
      <g>
        <path d="M200 64 H252 Q250 106 226 110 Q202 106 200 64Z" fill="#E5E7EB" />
        <path d="M203 76 H249 Q246 104 226 107 Q206 104 203 76Z" fill="#7E22CE" />
        <rect x="222" y="108" width="8" height="26" fill="#D1D5DB" />
        <ellipse cx="226" cy="136" rx="20" ry="6" fill="#D1D5DB" />
        <path d="M206 70 Q209 90 216 100" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" strokeLinecap="round" />
      </g>
      <Sparkle x={262} y={50} r={8} />
    </>
  );
}

function Candles() {
  return (
    <>
      {[128, 192].map((x) => (
        <g key={x}>
          <circle cx={x} cy="44" r="22" fill="#FEF3C7" opacity=".35" />
          <rect x={x - 8} y="50" width="16" height="48" rx="3" fill="#fff" />
          <Flame x={x} y={49} s={1.1} />
          <rect x={x - 13} y="96" width="26" height="8" rx="3" fill="#E5E7EB" />
          <rect x={x - 4} y="104" width="8" height="22" fill="#D1D5DB" />
          <ellipse cx={x} cy="128" rx="17" ry="5" fill="#E5E7EB" />
        </g>
      ))}
      <g transform="translate(160 148)">
        <ellipse rx="70" ry="9" fill="#fff" opacity=".85" />
        {[-36, -18, 0, 18, 36].map((x, i) => (
          <ellipse key={x} cx={x} cy="-8" rx="16" ry="11" fill={i % 2 ? '#D97706' : '#F59E0B'} transform={`rotate(${i % 2 ? 18 : -18} ${x} -8)`} />
        ))}
      </g>
    </>
  );
}

function Book() {
  return (
    <>
      <OpenBook cover="#DC2626">
        <PageLines x1={102} x2={146} ys={[86, 98, 110, 122]} />
        <PageLines x1={174} x2={218} ys={[86, 98, 110, 122]} />
      </OpenBook>
      {[[118, 40, 10], [160, 28, 13], [204, 42, 10], [250, 70, 8], [72, 74, 8]].map(([x, y, r]) => (
        <polygon key={`${x}`} points={starPoints(x, y, r)} fill="#FDE047" />
      ))}
    </>
  );
}

function Crown() {
  const gems = ['#EF4444', '#3B82F6', '#22C55E', '#3B82F6', '#EF4444'];
  return (
    <>
      <path d="M96 128 L88 62 L124 92 L160 46 L196 92 L232 62 L224 128Z" fill={GOLD} />
      <path d="M96 128 L88 62 L124 92 L160 46 L196 92 L232 62 L224 128Z" fill="none" stroke={GOLD_DARK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="92" y="122" width="136" height="20" rx="6" fill={GOLD_DARK} />
      {[88, 160, 232].map((x, i) => <circle key={x} cx={x} cy={[62, 46, 62][i]} r="8" fill="#FDE68A" />)}
      {gems.map((c, i) => <circle key={i} cx={112 + i * 24} cy="132" r="5.5" fill={c} />)}
      <circle cx="160" cy="100" r="11" fill="#A855F7" />
      <circle cx="157" cy="97" r="3" fill="#fff" opacity=".7" />
      <Sparkle x={250} y={44} r={9} /> <Sparkle x={70} y={110} r={7} /> <Sparkle x={200} y={40} r={5} />
    </>
  );
}

/* ---------- main ---------- */

export function artFor(show: Show): { kind: ArtKind; letters: string[]; badge?: string } {
  return {
    kind: (show.art as ArtKind) ?? CATEGORY_ART[show.category] ?? 'notes',
    letters: (show.artText ?? 'א ב ג').split(/\s+/),
    badge: show.artBadge,
  };
}

export default function ShowArt({ show }: { show: Show }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { kind, letters, badge } = artFor(show);
  const rand = rng(show.id);
  const confetti = Array.from({ length: 16 }, (_, i) => ({
    x: rand() * 320,
    y: rand() * 140,
    r: 2 + rand() * 4,
    o: 0.25 + rand() * 0.35,
    star: i % 4 === 0,
  }));

  const motif: Record<ArtKind, ReactNode> = {
    guitar: <Guitar />,
    drum: <Drum />,
    notes: <Notes />,
    letters: <Letters letters={letters} />,
    siddur: <Siddur />,
    puppet: <Puppet hat={false} />,
    'puppet-hat': <Puppet hat />,
    paris: <Paris />,
    menorah: <Menorah />,
    matzah: <Matzah />,
    candles: <Candles />,
    book: <Book />,
    crown: <Crown />,
  };

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label={show.title}>
      <defs>
        <radialGradient id={`g${id}`} cx="25%" cy="15%" r="95%">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".65" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`s${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity=".25" />
        </filter>
      </defs>
      <rect width="320" height="180" fill={show.accentColor} />
      <rect width="320" height="180" fill={`url(#g${id})`} />
      {confetti.map((c, i) =>
        c.star ? (
          <polygon key={i} points={starPoints(c.x, c.y, c.r * 1.8)} fill="#fff" opacity={c.o} />
        ) : (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#fff" opacity={c.o} />
        ),
      )}
      <path d="M0 152 Q80 134 160 148 T320 140 V180 H0Z" fill="#000" opacity=".12" />
      <g filter={`url(#s${id})`}>{motif[kind]}</g>
      {badge && (
        <g filter={`url(#s${id})`}>
          <circle cx="286" cy="34" r="22" fill="#fff" />
          <text x="286" y="35" textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="20" fill={show.accentColor}>
            {badge}
          </text>
        </g>
      )}
    </svg>
  );
}
