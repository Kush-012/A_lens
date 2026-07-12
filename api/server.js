import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import { attachRequestId, httpLogger } from "./middleware/requestLogger.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express(); 

// ── Security ──────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: config.cors.origins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "X-Request-Id"],
    credentials: false,
  })
);

// ── Request Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// ── Logging ───────────────────────────────────────────────────────────────
app.use(attachRequestId);
app.use(httpLogger);

// ── Rate Limiting ─────────────────────────────────────────────────────────
app.use(apiRateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────
app.use(routes);

// ── Error Handling ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "production") {
  app.listen(config.server.port, () => {
    logger.info(`App running on port ${config.server.port}`);
  });
}

export default app;
