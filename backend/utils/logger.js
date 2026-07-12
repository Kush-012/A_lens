/**
 * utils/logger.js
 *
 * Lightweight structured logger using morgan-compatible format.
 * Writes JSON lines in production and coloured text in development.
 *
 * Why not Winston/Pino?
 * Adding heavyweight loggers introduces transitive dependencies.
 * For a stateless REST service this simple wrapper is sufficient and
 * keeps the bundle lean. Swap to Pino if log ingestion (Datadog, GCP)
 * is added later.
 */

import config from "../config/index.js";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = config.server.isDevelopment ? LEVELS.debug : LEVELS.info;

const COLOURS = {
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m",  // green
  warn: "\x1b[33m",  // yellow
  error: "\x1b[31m", // red
  reset: "\x1b[0m",
};

function log(level, message, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const ts = new Date().toISOString();

  if (config.server.isDevelopment) {
    const colour = COLOURS[level] ?? "";
    const metaStr = Object.keys(meta).length
      ? " " + JSON.stringify(meta)
      : "";
    console.log(
      `${colour}[${ts}] [${level.toUpperCase()}]${COLOURS.reset} ${message}${metaStr}`
    );
  } else {
    // Structured JSON for log aggregators
    console.log(JSON.stringify({ ts, level, message, ...meta }));
  }
}

const logger = {
  debug: (message, meta) => log("debug", message, meta),
  info:  (message, meta) => log("info",  message, meta),
  warn:  (message, meta) => log("warn",  message, meta),
  error: (message, meta) => log("error", message, meta),
};

export default logger;
