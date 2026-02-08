/**
 * Safe localStorage wrapper for environments where storage is blocked
 * (e.g. Safari Tracking Prevention, private mode, or strict privacy settings).
 * Never throws; returns default values when storage is unavailable.
 */

function isStorageAvailable(): boolean {
  try {
    const key = '__safe_storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

let storageOk = false;
if (typeof window !== 'undefined') {
  try {
    storageOk = isStorageAvailable();
  } catch {
    storageOk = false;
  }
}

export function safeGetItem(key: string): string | null {
  if (!storageOk) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  if (!storageOk) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveItem(key: string): void {
  if (!storageOk) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
