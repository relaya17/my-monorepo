/**
 * Cache-Aside helper for Redis. Enterprise: getOrSetCache with TTL.
 */
import { cacheGet, cacheSet } from '../config/redis.js';

const DEFAULT_TTL = 300;

export async function getOrSetCache<T>(key: string, fetchFn: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached != null) return cached;
  const fresh = await fetchFn();
  await cacheSet(key, fresh, ttl);
  return fresh;
}
