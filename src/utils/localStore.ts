import type { LocalEpisode } from '../types';

/**
 * Offline "My Videos": video files picked by the parent live in IndexedDB on this
 * device, so the kids can watch with no internet at all. Only files the parent
 * owns or is allowed to download should be added (YouTube terms do not allow
 * downloading its videos).
 */

const DB_NAME = 'ktk-local-videos';
const STORE = 'videos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
        t.onerror = () => reject(t.error);
      }),
  );
}

export const saveVideo = (id: string, blob: Blob) =>
  tx('readwrite', (s) => s.put(blob, id)).then(() => undefined);

export const getVideo = (id: string): Promise<Blob | null> =>
  tx('readonly', (s) => s.get(id)).then((r) => (r instanceof Blob ? r : null));

export const deleteVideos = (ids: string[]) =>
  Promise.all(ids.map((id) => tx('readwrite', (s) => s.delete(id)))).then(() => undefined);

/** Total bytes used by stored videos (for the parent panel). */
export function localVideoUsage(): Promise<{ count: number; bytes: number }> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, 'readonly');
        const req = t.objectStore(STORE).getAll();
        req.onsuccess = () => {
          const blobs = (req.result as unknown[]).filter((b): b is Blob => b instanceof Blob);
          resolve({ count: blobs.length, bytes: blobs.reduce((n, b) => n + b.size, 0) });
        };
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

/** "Uncle Moishy - 01.mp4" -> "Uncle Moishy - 01" */
export function titleFromFilename(name: string): string {
  const base = name.replace(/\.[a-z0-9]+$/i, '').trim();
  return base || 'Video';
}

export const fmtBytes = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(0)} MB` : `${Math.ceil(n / 1e3)} KB`;

/**
 * Grabs a frame from a video blob as a small JPEG data URL (for show cards and
 * the episode strip). Resolves to null if the frame can't be read.
 */
export function makeThumbnail(blob: Blob, width = 480): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    const fail = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    const timer = setTimeout(fail, 15000);
    video.onerror = fail;
    video.onloadedmetadata = () => {
      // A frame a little way in usually beats frame 0 (often black).
      video.currentTime = Math.min(2, (video.duration || 2) / 4);
    };
    video.onseeked = () => {
      try {
        const scale = video.videoWidth ? width / video.videoWidth : 1;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        fail();
      }
    };
    video.src = url;
  });
}

let counter = 0;
export const newEpisodeId = () => `lv-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Saves one picked file: blob into IndexedDB, thumbnail into the episode record. */
export async function importFile(file: File, index: number): Promise<LocalEpisode> {
  const id = newEpisodeId();
  await saveVideo(id, file);
  const thumb = (await makeThumbnail(file)) ?? undefined;
  return { id, title: `${index + 1}. ${titleFromFilename(file.name)}`, ...(thumb ? { thumb } : {}) };
}
