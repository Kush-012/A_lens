import { generateJsonContent } from "../config/llm.js";
import { INTENT_SYSTEM_PROMPT, buildIntentPrompt } from "../prompts/intentPrompt.js";
import logger from "../utils/logger.js";

export async function intentNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  emit({ type: "step", step: "Understanding your request..." });
  logger.info(`[intentNode] Detecting intent for query: "${state.query}"`);

  try {
    const prompt = buildIntentPrompt(state.query, state.conversationHistory);
    const parsed = await generateJsonContent(INTENT_SYSTEM_PROMPT, prompt, false);

    const intent = parsed?.intent || { type: "general", companies: [] };
    
    emit({ type: "intent", intent });

    return {
      intent,
      executionLog: [
        {
          node: "intentNode",
          status: "success",
          duration: Date.now() - startedAt,
        },
      ],
    };
  } catch (err) {
    logger.error(`[intentNode] Error: ${err.message}`);
    const fallbackIntent = { type: "general", companies: [state.query] };
    emit({ type: "intent", intent: fallbackIntent });

    return {
      intent: fallbackIntent,
      errors: [{ node: "intentNode", error: err.message }],
      executionLog: [
        {
          node: "intentNode",
          status: "error",
          error: err.message,
          duration: Date.now() - startedAt,
        },
      ],
    };
  }
}
