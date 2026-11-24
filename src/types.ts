/** '7+' shows appear only under the "All" filter. */
export type AgeGroup = 'all' | '2-3' | '4-5' | '7+';

export interface Show {
  id: string;
  title: string;
  ageGroup: AgeGroup;
  category: string;
  /** 'list' = a hand-picked, pinned set of videoIds (no one else can add to it).
      'local' = offline video files stored on this device (see utils/localStore). */
  type: 'video' | 'playlist' | 'list' | 'local';
  videoIds?: string[];
  /** 11-char video ID or playlist ID, depending on `type`. */
  youtubeId: string;
  thumbnail: string;
  accentColor: string;
  /** For playlists pasted as watch?v=X&list=Y — start on video X. */
  startVideoId?: string;
  addedByParent?: boolean;
  /** Shown with a NEW badge (used while reviewing new additions). */
  isNew?: boolean;
  /** Reviewer notes, e.g. 'female vocals'. */
  flags?: string[];
  /** Illustrated fallback art: guitar, drum, notes, letters, siddur, puppet, puppet-hat, paris, menorah, matzah, candles, book, crown. */
  art?: string;
  /** Space-separated Hebrew letters for the `letters` art. */
  artText?: string;
  /** Short badge on the art, e.g. a volume number. */
  artBadge?: string;
  /** For type 'local': episodes whose files live on this device. */
  localEpisodes?: LocalEpisode[];
}

export interface LocalEpisode {
  /** Storage key in IndexedDB (utils/localStore). */
  id: string;
  title: string;
  /** JPEG data URL captured from the video frame; works offline. */
  thumb?: string;
}

export interface Episode {
  videoId: string;
  title?: string;
  /** Offline thumbnail (local shows); otherwise the YouTube thumb is used. */
  thumb?: string;
}

export interface TimerState {
  mode: 'off' | 'episodes' | 'minutes';
  limit: number;
  startedAt: number;
  watched: number;
  message: 'bedtime' | 'shabbos';
}
