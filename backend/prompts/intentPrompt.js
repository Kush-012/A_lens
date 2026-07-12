/**
 * prompts/intentPrompt.js
 *
 * Prompts for the Intent Node.
 * This detects the user's intent and extracts relevant companies.
 */

export const INTENT_SYSTEM_PROMPT = `You are an AI intent detector for a financial research agent.

Given the user's query (and any conversation history), you must detect their intent and extract relevant companies.

RULES FOR INTENT:
1. "type" can be: "general", "news_analysis", "financial_health", "earnings_analysis", "comparison", "valuation", "risk_assessment", "esg", "insider_trading"
2. "companies" must be an array of exactly matching company names (e.g., ["Apple", "Tesla"]) or tickers.

Output ONLY valid JSON in this format:
{
  "intent": {
    "type": "<intent_type>",
    "companies": ["<company_name>"]
  }
}`;

export function buildIntentPrompt(query, history = []) {
  const historyText = history.length > 0
    ? `\nCONVERSATION HISTORY:\n${history.map(m => `${m.role}: ${m.content}`).join("\n")}`
    : "";

  return `USER QUERY: "${query}"${historyText}

Analyze the query and history, detect the intent and companies. Output only the JSON object.`;
}
