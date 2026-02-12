import { safeGetItem, safeRemoveItem, safeSetItem } from './utils/safeStorage.js';
import { getStoredCountry, inferCountry } from './i18n/locale';

export const AUTH_TOKEN_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const normalizeBase = (base: string) => base.trim().replace(/\/+$/, '');

const rawBase = normalizeBase(String(import.meta.env.VITE_API_URL ?? ''));
// When using a full API URL (e.g. Render), ensure it ends with /api so paths like admin/login become /api/admin/login
let ENV_BASE =
  rawBase && (rawBase.startsWith('http://') || rawBase.startsWith('https://'))
    ? rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`
    : rawBase;
// בפרודקשן (לא localhost) אין /api – משתמשים ב-Render API
const RENDER_API = 'https://my-monorepo-1.onrender.com/api';
const origin = typeof window !== 'undefined' ? window.location.origin : '';
const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
const needsExternalApi = origin && !isLocalhost && (!ENV_BASE || ENV_BASE === '/api');
if (needsExternalApi) ENV_BASE = RENDER_API;
const FALLBACK_BASE = '/api';

export const getBuildingId = (): string => {
  const value = safeGetItem('buildingId');
  return (value ?? 'default').trim() || 'default';
};

export const setBuildingId = (buildingId: string): void => {
  const id = (buildingId ?? 'default').trim() || 'default';
  safeSetItem('buildingId', id);
};

/** תווית לתצוגה של מזהי בניין (משותף – ללא כפילות). */
export const buildingLabel = (buildingId: string): string =>
  buildingId === 'default' ? 'בניין ברירת מחדל' : buildingId;

const joinUrl = (base: string, path: string) => {
  const normalizedBase = normalizeBase(base || FALLBACK_BASE);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

/** Base URL used for API (e.g. /api or https://.../api). Use with getApiHeaders() for fetch. */
export function getApiBaseUrl(): string {
  return ENV_BASE || FALLBACK_BASE;
}

/** Full URL for an API path (no leading slash in path). */
export function getApiUrl(path: string): string {
  return joinUrl(ENV_BASE || FALLBACK_BASE, path);
}

/** Headers to send with non-JSON requests (e.g. blob): x-building-id, x-country-code, optionally Authorization. */
export function getApiHeaders(includeAuth = true): Record<string, string> {
  const h: Record<string, string> = { 'x-building-id': getBuildingId() };
  const country = getStoredCountry() ?? inferCountry();
  if (country && country !== 'default') h['x-country-code'] = country;
  if (includeAuth) {
    const token = safeGetItem(AUTH_TOKEN_KEY);
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;
  const text = await res.text();
  if (res.status === 204 || !text || text.trim() === '') return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function apiRequestJson<T>(
  path: string,
  init?: RequestInit
): Promise<{ response: Response; data: T | null; usedBase: string }> {
  const buildingId = getBuildingId();
  const headers = new Headers(init?.headers);
  if (!headers.has('x-building-id')) headers.set('x-building-id', buildingId);
  const country = getStoredCountry() ?? inferCountry();
  if (country && country !== 'default' && !headers.has('x-country-code')) headers.set('x-country-code', country);

  // Don't send Authorization on login/register/refresh
  const isAuthEndpoint = /^\/(admin\/login|admin\/register|login|signup|auth\/refresh)/.test(path.startsWith('/') ? path : `/${path}`);
  const token = safeGetItem(AUTH_TOKEN_KEY);
  if (token && !headers.has('Authorization') && !isAuthEndpoint) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const finalInit: RequestInit = {
    ...init,
    headers
  };

  const tryOnce = async (base: string, useRefresh = false): Promise<{ response: Response; data: T | null; usedBase: string }> => {
    const url = joinUrl(base, path);
    const response = await fetch(url, finalInit);
    const contentType = response.headers.get('content-type') ?? '';
    const looksJson = contentType.includes('application/json');
    const data = looksJson ? await readJsonSafe<T>(response) : null;

    if (response.status === 401 && !useRefresh && !isAuthEndpoint) {
      const refresh = safeGetItem(REFRESH_TOKEN_KEY);
      if (refresh) {
        const refreshRes = await fetch(joinUrl(base, 'auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-building-id': buildingId },
          body: JSON.stringify({ refreshToken: refresh })
        });
        const refreshData = await readJsonSafe<{ accessToken?: string; refreshToken?: string }>(refreshRes);
        if (refreshRes.ok && refreshData?.accessToken) {
          safeSetItem(AUTH_TOKEN_KEY, refreshData.accessToken);
          if (refreshData.refreshToken) safeSetItem(REFRESH_TOKEN_KEY, refreshData.refreshToken);
          const newHeaders = new Headers(finalInit.headers);
          newHeaders.set('Authorization', `Bearer ${refreshData.accessToken}`);
          const retryRes = await fetch(url, { ...finalInit, headers: newHeaders });
          const retryData = retryRes.headers.get('content-type')?.includes('application/json') ? await readJsonSafe<T>(retryRes) : null;
          return { response: retryRes, data: retryData, usedBase: base };
        }
        safeRemoveItem(AUTH_TOKEN_KEY);
        safeRemoveItem(REFRESH_TOKEN_KEY);
      }
    }
    return { response, data, usedBase: base };
  };

  try {
    const first = await tryOnce(ENV_BASE);
    const shouldFallback =
      !needsExternalApi &&
      ENV_BASE &&
      ENV_BASE !== FALLBACK_BASE &&
      (first.data === null || first.response.status === 404);
    if (shouldFallback) return await tryOnce(FALLBACK_BASE);
    return first;
  } catch {
    if (!needsExternalApi && ENV_BASE && ENV_BASE !== FALLBACK_BASE) return await tryOnce(FALLBACK_BASE);
    throw new Error('Network error');
  }
}

