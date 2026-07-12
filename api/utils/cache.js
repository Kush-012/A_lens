/**
 * utils/cache.js
 *
 * In-memory cache powered by node-cache.
 *
 * Why in-memory and not Redis?
 * The brief explicitly excludes Redis. node-cache is a zero-dependency,
 * zero-config LRU-capable store that lives in the process.
 *
 * Tradeoff: cache is not shared across multiple Node processes / pods.
 * For a single-instance deployment this is fine; add Redis if you
 * horizontally scale later.
 *
 * Cache key conventions:
 *   finnhub:<endpoint>:<symbol>  — Finnhub API response
 *   search:<query>               — Company search results
 */

import NodeCache from "node-cache";
import config from "../config/index.js";
import logger from "./logger.js";

const cache = new NodeCache({
  stdTTL: config.cache.ttlSeconds,
  checkperiod: 60,          // Prune expired keys every 60 s
  useClones: false,         // Return references; consumers must not mutate
  maxKeys: 1000,            // Guard against unbounded growth
});

cache.on("expired", (key) => {
  logger.debug(`[cache] Expired: ${key}`);
});

export function cacheGet(key) {
  const value = cache.get(key);
  if (value !== undefined) {
    logger.debug(`[cache] HIT  ${key}`);
  }
  return value ?? null;
}

export function cacheSet(key, value, ttl) {
  const effectiveTtl = ttl ?? config.cache.ttlSeconds;
  cache.set(key, value, effectiveTtl);
  logger.debug(`[cache] SET  ${key} (ttl=${effectiveTtl}s)`);
}

export function cacheDelete(key) {
  cache.del(key);
}

export function cacheClear() {
  cache.flushAll();
  logger.info("[cache] Flushed all keys");
}

export function cacheStats() {
  return cache.getStats();
}

export default { get: cacheGet, set: cacheSet, delete: cacheDelete };
