/**
 * services/finnhubService.js
 *
 * Base Finnhub HTTP client with caching, error handling, and retry logic.
 *
 * Why a service layer instead of calling axios directly in tools?
 * Tools should not know about HTTP details. The service layer handles:
 *   - Authentication (token injection)
 *   - Caching (avoids redundant API calls)
 *   - Retry with back-off (Finnhub occasionally returns 429)
 *   - Normalised error objects
 *
 * Every tool imports this service and calls `finnhubGet(endpoint, params)`.
 */

import axios from "axios";
import config from "../config/index.js";
import { cacheGet, cacheSet } from "../utils/cache.js";
import logger from "../utils/logger.js";
import { withRetry } from "../utils/helpers.js";
import { traceContext } from "../utils/asyncContext.js";

const client = axios.create({
  baseURL: config.finnhub.baseUrl,
  timeout: config.finnhub.timeout,
  params: {
    token: config.finnhub.apiKey,
  },
});

/**
 * Makes a GET request to a Finnhub endpoint.
 * Automatically caches responses and retries on transient failures.
 *
 * @param {string} endpoint - Finnhub endpoint path (e.g., "/quote")
 * @param {object} params   - Query parameters (excluding token)
 * @param {number} [ttl]    - Override cache TTL in seconds
 * @returns {Promise<object>} Parsed response data
 */
export async function finnhubGet(endpoint, params = {}, ttl) {
  // Build a deterministic cache key from the endpoint + sorted params
  const paramStr = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const cacheKey = `finnhub:${endpoint}:${paramStr}`;

  // Return cached value if available
  const cached = cacheGet(cacheKey);
  if (cached !== null) return cached;

  // Fetch from Finnhub with retry
  const data = await withRetry(async () => {
    logger.debug(`[finnhub] GET ${endpoint}`, { params });
    const startTime = Date.now();
    let response;
    try {
      response = await client.get(endpoint, { params });
    } catch (err) {
      const store = traceContext.getStore();
      if (store?.emit) {
        store.emit({
          type: "http_request",
          method: "GET",
          url: config.finnhub.baseUrl + endpoint,
          query: params,
          headers: { Authorization: "Bearer ***" },
          status: err.response?.status || 500,
          duration: Date.now() - startTime,
          error: err.message
        });
      }
      throw err;
    }

    const store = traceContext.getStore();
    if (store?.emit) {
      store.emit({
        type: "http_request",
        method: "GET",
        url: config.finnhub.baseUrl + endpoint,
        query: params,
        headers: { Authorization: "Bearer ***" },
        status: response.status,
        duration: Date.now() - startTime,
        response: response.data
      });
    }

    if (response.status !== 200) {
      const err = new Error(`Finnhub returned HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }

    return response.data;
  }, 2, 500);

  // Cache the result
  cacheSet(cacheKey, data, ttl);

  return data;
}

/**
 * Checks if a Finnhub response is empty/null.
 * Finnhub returns {} or null for invalid symbols on some endpoints.
 */
export function isFinnhubEmpty(data) {
  if (data === null || data === undefined) return true;
  if (typeof data === "object" && !Array.isArray(data)) {
    return Object.keys(data).length === 0;
  }
  if (Array.isArray(data)) return data.length === 0;
  return false;
}

export default { get: finnhubGet, isEmpty: isFinnhubEmpty };
