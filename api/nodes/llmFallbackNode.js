/**
 * nodes/llmFallbackNode.js
 *
 * LangGraph Node: LLM Fallback
 * Synthesizes a best-effort qualitative report when data APIs fail permanently.
 */

import { generateJsonContent } from "../config/llm.js";
import logger from "../utils/logger.js";

const FALLBACK_PROMPT = `You are an expert financial AI. 
The system encountered repeated failures when trying to fetch structured data from Finnhub.

Below you are given:
1. The user's original query.
2. The tools that FAILED (missing data).
3. The successfully retrieved data.

YOUR TASK:
Produce a professional, qualitative assessment based ONLY on the successfully retrieved data and your general market knowledge.

CRITICAL RULES:
1. Since real-time API data was partially or entirely unavailable, you MUST use your own expert financial knowledge and training data to answer the query to the best of your ability.
2. DO NOT simply state "Insufficient data" or "I couldn't retrieve enough data". Answer the user's question directly and thoroughly based on your internal knowledge.
3. You may add a brief disclaimer that the specific real-time data couldn't be fetched, but still provide the qualitative insights and estimates based on your own knowledge.
4. Output a JSON object representing the final report.

JSON Schema:
{
  "sections": [
    {
      "title": "<Section Title>",
      "content": "<Markdown formatted content>"
    }
  ]
}`;

export async function llmFallbackNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  emit({ type: "step", step: "Finnhub unavailable. Switching to AI fallback..." });
  logger.info("[llmFallbackNode] Generating qualitative fallback report");

  const missingNames = state.missingTools.map(t => t.tool).join(", ");
  const userPrompt = `USER QUERY: "${state.query}"\n\nFAILED TOOLS: ${missingNames}\n\nSUCCESSFUL DATA:\n${JSON.stringify(state.toolResults, null, 2)}`;

  try {
    const parsed = await generateJsonContent(FALLBACK_PROMPT, userPrompt, false);
    
    emit({ type: "step", step: "Fallback analysis generated." });

    return {
      report: parsed,
      llmFallbackTriggered: true,
      executionLog: [
        {
          node: "llmFallbackNode",
          status: "success",
          duration: Date.now() - startedAt,
        }
      ]
    };
  } catch (err) {
    logger.error(`[llmFallbackNode] Error: ${err.message}`);
    const basicReport = {
      sections: [
        {
          title: "System Error",
          content: "I couldn't retrieve enough verified market data to make an investment recommendation due to repeated API failures, and the fallback synthesis also encountered an error."
        }
      ]
    };

    return {
      report: basicReport,
      llmFallbackTriggered: true,
      errors: [{ node: "llmFallbackNode", error: err.message }],
      executionLog: [
        {
          node: "llmFallbackNode",
          status: "error",
          error: err.message,
          duration: Date.now() - startedAt,
        }
      ]
    };
  }
}
