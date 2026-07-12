/**
 * nodes/plannerNode.js
 *
 * LangGraph Node 3: Planner Node
 * Generates the missingTools array for the execution engine.
 */

import { generateJsonContent } from "../config/llm.js";
import { PLANNER_SYSTEM_PROMPT, buildPlannerPrompt } from "../prompts/plannerPrompt.js";
import logger from "../utils/logger.js";

function getFallbackPlan(companies, resolvedSymbols) {
  const tools = [];
  for (const c of companies) {
    const symbol = resolvedSymbols[c.toLowerCase()];
    if (symbol) {
      tools.push({ tool: "profile", args: { symbol }, reason: "Fallback overview" });
      tools.push({ tool: "financialMetrics", args: { symbol }, reason: "Fallback metrics" });
      tools.push({ tool: "quote", args: { symbol }, reason: "Fallback quote" });
    }
  }
  return tools;
}

export async function plannerNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  emit({ type: "step", step: "Planning execution..." });
  logger.info(`[plannerNode] Planning for query: "${state.query}"`);

  // If we already have a plan (e.g. Replanning), we skip this or generate missing ones
  // But for now, planner runs once to generate initial missingTools
  if (state.retryCount > 0) {
    return {}; // Skip planning if we are in a retry loop (handled by conditional edge)
  }

  try {
    const prompt = buildPlannerPrompt(state.query, state.intent, state.resolvedSymbols, state.conversationHistory);
    const parsed = await generateJsonContent(PLANNER_SYSTEM_PROMPT, prompt, false);

    const tools = parsed?.tools || [];
    
    if (tools.length === 0) {
      throw new Error("Empty plan generated");
    }

    emit({
      type: "plan",
      plan: { steps: [{ tools }] },
      duration: Date.now() - startedAt,
    });

    return {
      executionPlan: tools,
      missingTools: tools,
      executionLog: [
        {
          node: "plannerNode",
          status: "success",
          tools: tools.length,
          duration: Date.now() - startedAt,
        },
      ],
    };
  } catch (err) {
    logger.error(`[plannerNode] Error: ${err.message}`);
    const fallbackTools = getFallbackPlan(state.intent?.companies || [], state.resolvedSymbols);
    
    emit({ type: "warning", message: `Planning failed, using default tools` });
    emit({
      type: "plan",
      plan: { steps: [{ tools: fallbackTools }] },
      duration: Date.now() - startedAt,
    });

    return {
      executionPlan: fallbackTools,
      missingTools: fallbackTools,
      errors: [{ node: "plannerNode", error: err.message }],
      executionLog: [
        {
          node: "plannerNode",
          status: "fallback",
          duration: Date.now() - startedAt,
        },
      ],
    };
  }
}
