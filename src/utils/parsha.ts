import calendar from '../data/parsha-calendar.json';
import videos from '../data/parsha-videos.json';

export interface ParshaEpisode {
  videoId: string;
  title: string;
  label: string;
  showId: string;
}

/** Hebcal (Sephardi) names -> the Ashkenazi spelling families here use. */
const DISPLAY: Record<string, string> = {
  Bereshit: 'Bereishis', 'Lech-Lecha': 'Lech Lecha', 'Chayei Sara': 'Chayei Sarah', Toldot: 'Toldos',
  Vayetzei: 'Vayeitzei', Miketz: 'Mikeitz', Shemot: 'Shemos', Yitro: 'Yisro', 'Ki Tisa': 'Ki Sisa',
  Shmini: 'Shemini', 'Achrei Mot': 'Acharei Mos', Bechukotai: 'Bechukosai', "Beha'alotcha": "Beha'aloscha",
  "Sh'lach": 'Shelach', Chukat: 'Chukas', Matot: 'Matos', Vaetchanan: "Va'eschanan", 'Ki Teitzei': 'Ki Seitzei',
  'Ki Tavo': 'Ki Savo', "Ha'azinu": 'Haazinu', 'Vezot Haberakhah': "V'zos Habracha",
};
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Live list from the site's server (new weekly episodes); null if unavailable. */
export async function fetchLiveEpisodes(names: string[]): Promise<ParshaEpisode[] | null> {
  try {
    const res = await fetch(`/api/parsha?names=${encodeURIComponent(names.join(','))}`);
    if (!res.ok || !res.headers.get('content-type')?.includes('json')) return null;
    const data = (await res.json()) as { episodes?: ParshaEpisode[] };
    return data.episodes?.length ? data.episodes : null;
  } catch {
    return null;
  }
}

/** This coming Shabbos's parsha (diaspora), skipping Yom Tov Shabbosim. */
export function thisWeeksParsha(now = new Date()): { names: string[]; display: string; episodes: ParshaEpisode[] } | null {
  const cal = calendar as Record<string, string[]>;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7)); // next Saturday (today if Shabbos)
  for (let i = 0; i < 4; i++, d.setDate(d.getDate() + 7)) {
    const names = cal[ymd(d)];
    if (!names) continue;
    const idx = videos as Record<string, ParshaEpisode[]>;
    const seen = new Set<string>();
    const episodes = names
      .flatMap((n) => idx[n] ?? [])
      .filter((e) => !seen.has(e.videoId) && seen.add(e.videoId));
    return { names, display: names.map((n) => DISPLAY[n] ?? n).join('–'), episodes };
  }
  return null;
}
