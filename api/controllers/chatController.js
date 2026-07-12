/**
 * controllers/chatController.js
 *
 * Handles all chat-related HTTP requests.
 *
 * Why SSE instead of a regular JSON response?
 * The agent can take 10–30 seconds to run (multiple Finnhub calls + Groq).
 * SSE allows the frontend to show live progress without polling.
 * The final response arrives as the last SSE event before the connection closes.
 *
 * SSE Event types emitted:
 *   { type: "step",            step: string }
 *   { type: "intent",          intent: object }
 *   { type: "plan",            plan: object }
 *   { type: "symbol_resolved", name, symbol, fullName }
 *   { type: "tool_start",      tool, symbol, stepId }
 *   { type: "tool_complete",   tool, symbol, success, stepId }
 *   { type: "tool_error",      tool, error, stepId }
 *   { type: "tools_complete",  total, succeeded, failed }
 *   { type: "validation_complete", quality }
 *   { type: "validation_warnings", warnings[] }
 *   { type: "complete",        executionTime }
 *   { type: "result",          report: object }
 *   { type: "error",           message: string }
 */

import { runAgent } from "../langgraph/graph.js";
import logger from "../utils/logger.js";

export async function chatStream(req, res) {
  const { query, conversationHistory = [] } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: "Query is required and must be a non-empty string.",
        code: "INVALID_QUERY",
      },
    });
  }

  if (query.trim().length > 2000) {
    return res.status(400).json({
      error: {
        message: "Query must not exceed 2000 characters.",
        code: "QUERY_TOO_LONG",
      },
    });
  }

  // ── Setup SSE ──────────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();



  // Emit a single SSE event
  function emit(event) {
    if (res.writableEnded || res.destroyed) return;
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (err) {
      logger.error(`[chatController] SSE write error: ${err.message}`);
    }
  }

  emit({ type: "step", step: "Initialising AI research agent..." });

  try {
    const finalState = await runAgent(
      query.trim(),
      Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [],
      emit
    );

    if (!res.writableEnded && !res.destroyed) {
      emit({ type: "result", report: finalState.report });
    }
  } catch (err) {
    logger.error(`[chatController] Agent error: ${err.message}`);
    if (!res.writableEnded && !res.destroyed) {
      emit({
        type: "error",
        message: `The research agent encountered an error: ${err.message}`,
      });
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}

/**
 * Health check endpoint.
 */
export function healthCheck(req, res) {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
