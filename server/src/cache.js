import { LRUCache } from 'lru-cache';

const TEN_MINUTES = 1000 * 60 * 10;
const MAX_ENTRIES = 120;

export const responseCache = new LRUCache({
  max: MAX_ENTRIES,
  ttl: TEN_MINUTES,
  ttlAutopurge: true,
  allowStale: false,
  updateAgeOnGet: true,
});

export const getCached = (key) => responseCache.get(key);
export const setCached = (key, value) => responseCache.set(key, value);
export const cacheStats = () => ({
  size: responseCache.size,
  maxSize: responseCache.max,
  ttl: responseCache.ttl,
});
