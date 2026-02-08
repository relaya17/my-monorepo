/**
 * Safe localStorage wrapper for environments where storage is blocked
 * (e.g. Safari Tracking Prevention, private mode). Never throws.
 * We avoid touching localStorage at module load so Tracking Prevention doesn't break the app.
 */

let storageOk: boolean | null = null;

function checkStorage(): boolean {
  if (storageOk !== null) return storageOk;
  if (typeof window === 'undefined') {
    storageOk = false;
    return false;
  }
  try {
    const key = '__safe_storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    storageOk = true;
  } catch {
    storageOk = false;
  }
  return storageOk;
}

export function safeGetItem(key: string): string | null {
  if (!checkStorage()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  if (!checkStorage()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function safeRemoveItem(key: string): void {
  if (!checkStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
