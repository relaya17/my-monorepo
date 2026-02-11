/**
 * Redis client and cache helpers. TECHNICAL_SPECIFICATION §8.1
 * When REDIS_URL is not set, all cache operations no-op (app runs without Redis).
 */
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
const CACHE_PREFIX = 'cache:';
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

let client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!REDIS_URL?.trim()) return null;
  if (client) return client;
  try {
    client = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });
    client.on('error', () => {});
    return client;
  } catch {
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return !!getRedisClient();
}

export async function cacheGet<T = string>(key: string): Promise<T | null> {
  const c = getRedisClient();
  if (!c) return null;
  try {
    const fullKey = CACHE_PREFIX + key;
    const raw = await c.get(fullKey);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  const c = getRedisClient();
  if (!c) return;
  try {
    const fullKey = CACHE_PREFIX + key;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds > 0) {
      await c.setex(fullKey, ttlSeconds, serialized);
    } else {
      await c.set(fullKey, serialized);
    }
  } catch {
    // ignore
  }
}

export async function cacheDel(key: string): Promise<void> {
  const c = getRedisClient();
  if (!c) return;
  try {
    await c.del(CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

/** Cache key for building apartments list (for-sale or for-rent). */
export function buildingApartmentsKey(buildingId: string, list: 'for-sale' | 'for-rent'): string {
  return `building:${buildingId}:apartments:${list}`;
}
