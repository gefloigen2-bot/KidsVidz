import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'ktk:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — app still works for this session */
  }
}

/** useState that persists to localStorage. */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load(key, initial));
  useEffect(() => save(key, value), [key, value]);
  const update = useCallback((v: T | ((prev: T) => T)) => setValue(v), []);
  return [value, update] as const;
}
