/**
 * edges/conditionalEdges.js
 *
 * Defines dynamic routing logic for the LangGraph application.
 */

import { Send } from "@langchain/langgraph";
import logger from "../utils/logger.js";

/**
 * Maps the missingTools array into parallel executorNode instances.
 */
export function mapToExecution(state) {
  const tools = state.missingTools || [];
  if (tools.length === 0) {
    logger.info("[Routing] No tools to execute, routing to reportNode directly");
    return "reportNode";
  }
  return tools.map(tool => new Send("executorNode", { activeTool: tool }));
}

/**
 * Routes based on validation status and retry count.
 */
export function validateAndRoute(state) {
  const { validationStatus, retryCount } = state;

  if (validationStatus === "success") {
    logger.info("[Routing] Validation successful, routing to reportNode");
    return "reportNode";
  }

  if (validationStatus === "failed") {
    if (retryCount >= 3) {
      logger.warn(`[Routing] Validation failed after ${retryCount} retries, routing to llmFallbackNode`);
      return "llmFallbackNode";
    } else {
      logger.info(`[Routing] Validation failed, initiating retry ${retryCount + 1}/3`);
      return mapToExecution(state);
    }
  }

  return "reportNode"; // Fallback
}
