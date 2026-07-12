/**
 * utils/helpers.js
 *
 * Pure utility functions shared across the entire backend.
 * No side effects, no imports from internal modules.
 */

/**
 * Safely parses a JSON string. Returns null on failure instead of throwing.
 * Useful for LLM outputs that may occasionally malform.
 */
export function safeJsonParse(text) {
  try {
    // Strip markdown code fences that LLMs sometimes wrap JSON in
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Rounds a number to N decimal places.
 */
export function round(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return null;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formats a number as a compact financial string (e.g., 1.2T, 345.6B, 1.2M).
 */
export function formatCompact(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${round(value / 1e12, 2)}T`;
  if (abs >= 1e9)  return `${round(value / 1e9,  2)}B`;
  if (abs >= 1e6)  return `${round(value / 1e6,  2)}M`;
  if (abs >= 1e3)  return `${round(value / 1e3,  2)}K`;
  return String(round(value, 2));
}

/**
 * Formats a value as a percentage string.
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${round(value, 2)}%`;
}

/**
 * Computes percentage change from `from` to `to`.
 */
export function percentChange(from, to) {
  if (!from || from === 0) return null;
  return round(((to - from) / Math.abs(from)) * 100, 2);
}

/**
 * Computes Compound Annual Growth Rate.
 * @param {number} start - Starting value
 * @param {number} end   - Ending value
 * @param {number} years - Number of years
 */
export function cagr(start, end, years) {
  if (!start || start <= 0 || !years || years <= 0) return null;
  return round((Math.pow(end / start, 1 / years) - 1) * 100, 2);
}

/**
 * Returns the current UTC date as a YYYY-MM-DD string.
 */
export function todayUtc() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns a date N days ago as a YYYY-MM-DD string.
 */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

/**
 * Trims an array of objects to at most `limit` items.
 */
export function limitArray(arr, limit = 10) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, limit);
}

/**
 * Converts a snake_case or camelCase key to a human-readable label.
 */
export function humanizeKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Extracts a nested value from an object by dot-notation path.
 * E.g., getPath(obj, "metric.pe") → obj.metric.pe
 */
export function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/**
 * Sleeps for `ms` milliseconds. Useful for retry back-off.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true only for errors that are worth retrying (transient).
 * DNS failures, connection refused, and auth errors should NOT be retried.
 */
export function isRetryable(err) {
  // Network-level errors that won't go away on retry
  const permanentCodes = ["ENOTFOUND", "ECONNREFUSED", "EAI_AGAIN", "ECONNABORTED"];
  if (err.code && permanentCodes.includes(err.code)) return false;
  // Auth / bad-request errors
  if (err.status && [400, 401, 403, 404].includes(err.status)) return false;
  // Otherwise (429, 5xx, timeout) — retryable
  return true;
}

/**
 * Retries an async function up to `maxRetries` times with exponential back-off.
 * Skips retries immediately for non-retryable errors (e.g., DNS failure).
 */
export async function withRetry(fn, maxRetries = 2, baseDelayMs = 500) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't waste time retrying permanent failures
      if (!isRetryable(err)) throw err;
      if (attempt < maxRetries) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}
