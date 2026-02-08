import { safeGetItem, safeSetItem } from './utils/safeStorage.js';

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

const joinUrl = (base: string, path: string) => {
  const normalizedBase = normalizeBase(base || FALLBACK_BASE);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
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

  const finalInit: RequestInit = init ? { ...init, headers } : { headers };

  const tryOnce = async (base: string) => {
    const url = joinUrl(base, path);
    const response = await fetch(url, finalInit);

    const contentType = response.headers.get('content-type') ?? '';
    const looksJson = contentType.includes('application/json');
    const data = looksJson ? await readJsonSafe<T>(response) : null;

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

