/**
 * config/llm.js
 *
 * Groq LLM Client configuration.
 * Exposes methods to generate JSON-formatted output via Groq.
 */

import Groq from "groq-sdk";
import config from "./index.js";
import { traceContext } from "../utils/asyncContext.js";

const groq = new Groq({ apiKey: config.groq.apiKey });

/**
 * Returns JSON-formatted content from the LLM.
 */
export async function generateJsonContent(systemInstruction, userPrompt, useHighTemp = false) {
  const modelName = config.groq.model;
  const startTime = Date.now();
  const temperature = useHighTemp ? config.groq.temperatureHigh : config.groq.temperatureLow;
  
  const requestPayload = {
    model: modelName,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ],
    temperature: temperature,
    response_format: { type: "json_object" }
  };

  try {
    const chatCompletion = await groq.chat.completions.create(requestPayload);
    
    const rawResponse = chatCompletion.choices[0]?.message?.content || "{}";
    let parsedJson = null;
    
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch (e) {
      console.error("[LLM] Failed to parse JSON response:", e);
    }

    const store = traceContext.getStore();
    if (store?.emit) {
      store.emit({
        type: "llm_request",
        modelName: modelName,
        request: requestPayload,
        rawResponse,
        parsedJson,
        tokenUsage: chatCompletion.usage,
        duration: Date.now() - startTime
      });
    }

    return parsedJson;
  } catch (err) {
    const store = traceContext.getStore();
    if (store?.emit) {
      store.emit({
        type: "llm_request",
        modelName: modelName,
        request: requestPayload,
        duration: Date.now() - startTime,
        error: err.message
      });
    }
    throw err;
  }
}

export default groq;
