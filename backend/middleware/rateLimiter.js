/**
 * middleware/rateLimiter.js
 *
 * Request rate limiter using express-rate-limit.
 *
 * Why rate limiting?
 * The Finnhub free tier allows 60 requests/minute. Without rate limiting, a
 * single burst of user messages can exhaust the quota instantly. This
 * middleware limits abuse at the Express layer before it reaches Finnhub.
 */

import rateLimit from "express-rate-limit";
import config from "../config/index.js";

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,   // Include RateLimit-* headers in responses
  legacyHeaders: false,     // Disable X-RateLimit-* headers (deprecated)
  message: {
    error: {
      message: "Too many requests. Please wait before sending another query.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  // Skip rate limiting in test environments
  skip: () => process.env.NODE_ENV === "test",
});

// Stricter limiter for the chat endpoint specifically
export const chatRateLimiter = rateLimit({
  windowMs: 60_000,          // 1 minute
  max: 15,                   // 15 AI queries per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message:
        "You are sending queries too quickly. Please wait a moment and try again.",
      code: "CHAT_RATE_LIMIT_EXCEEDED",
    },
  },
  skip: () => process.env.NODE_ENV === "test",
});
