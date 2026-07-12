/**
 * nodes/validatorNode.js
 *
 * LangGraph Node 5: Data Validator
 * Validates executed tools. Determines retry logic by updating missingTools.
 */

import logger from "../utils/logger.js";

export async function validatorNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  emit({ type: "step", step: "Validating data quality..." });
  logger.info("[validatorNode] Validating tool results");

  const toolResults = state.toolResults ?? {};
  const currentMissing = state.missingTools ?? [];
  const newMissing = [];

  for (const toolDef of currentMissing) {
    const resultKey = toolDef.args?.symbol ? `${toolDef.tool}_${toolDef.args.symbol}` : toolDef.tool;
    const result = toolResults[resultKey];

    // If it failed with 403, it's a premium endpoint (e.g. priceTarget) and retrying won't help. Ignore it.
    if (result && !result.success && result.error && result.error.includes("403")) {
      logger.warn(`[validatorNode] Tool failed with 403 (Forbidden), skipping retry: ${toolDef.tool}`);
      continue;
    }

    // If it failed or has no data, it needs to be retried
    if (!result || !result.success || !result.data || (Array.isArray(result.data) && result.data.length === 0) || (typeof result.data === 'object' && Object.keys(result.data).length === 0)) {
      newMissing.push(toolDef);
      logger.warn(`[validatorNode] Tool failed validation: ${toolDef.tool}`);
    } else {
      logger.info(`[validatorNode] Tool passed validation: ${toolDef.tool}`);
    }
  }

  const status = newMissing.length === 0 ? "success" : "failed";
  const nextRetryCount = status === "failed" ? (state.retryCount || 0) + 1 : state.retryCount;

  emit({
    type: "validation_complete",
    status,
    missingCount: newMissing.length,
    retryCount: nextRetryCount
  });

  return {
    missingTools: newMissing,
    validationStatus: status,
    retryCount: nextRetryCount,
    executionLog: [
      {
        node: "validatorNode",
        status,
        missingRemaining: newMissing.length,
        retryCount: nextRetryCount,
        duration: Date.now() - startedAt,
      },
    ],
  };
}
