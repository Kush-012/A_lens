import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";
import config from "../config/index.js";

/**
 * Attaches a unique request ID to every incoming request.
 * Useful for correlating logs to a specific request lifecycle.
 */
export function attachRequestId(req, res, next) {
  req.id = uuidv4();
  res.setHeader("X-Request-Id", req.id);
  next();
}

/**
 * Morgan HTTP logger. Uses 'dev' format in development, 'short' in production.
 */
export const httpLogger = morgan(
  config.server.isDevelopment ? "dev" : "short",
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
    // Skip health check endpoints to reduce noise
    skip: (req) => req.path === "/api/health",
  }
);
