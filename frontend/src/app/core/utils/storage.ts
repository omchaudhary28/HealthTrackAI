export function storageAvailable(): boolean {
  return resolveStorage() !== null;
}

export function readStorageText(key: string): string | null {
  const storage = resolveStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn(`[MindTrack] Unable to read storage key "${key}"`, error);
    return null;
  }
}

export function readStorageJson<T>(key: string): T | null {
  const raw = readStorageText(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[MindTrack] Unable to parse storage key "${key}"`, error);
    removeStorageItem(key);
    return null;
  }
}

export function writeStorageText(key: string, value: string): boolean {
  const storage = resolveStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[MindTrack] Unable to write storage key "${key}"`, error);
    return false;
  }
}

export function writeStorageJson(key: string, value: unknown): boolean {
  return writeStorageText(key, JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  const storage = resolveStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`[MindTrack] Unable to remove storage key "${key}"`, error);
  }
}

function resolveStorage(): Storage | null {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage;
  } catch {
    return null;
  }
}
