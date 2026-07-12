import logger from "../utils/logger.js";
import config from "../config/index.js";

/**
 * Maps known error types to HTTP status codes.
 */
function resolveStatusCode(err) {
  if (err.status) return err.status;
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") return 503;
  if (err.name === "ValidationError") return 400;
  if (err.name === "UnauthorizedError") return 401;
  return 500;
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = resolveStatusCode(err);
  const requestId = req.id ?? "unknown";

  logger.error(`[errorHandler] ${err.message}`, {
    requestId,
    status,
    stack: config.server.isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(status).json({
    error: {
      message: err.message ?? "An unexpected error occurred.",
      code: err.code ?? "INTERNAL_ERROR",
      requestId,
      // Only expose stack traces in development
      ...(config.server.isDevelopment && { stack: err.stack }),
    },
  });
}

/**
 * 404 handler — register before errorHandler, after all routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    },
  });
}
