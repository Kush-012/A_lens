/**
 * services/api.js
 *
 * HTTP client configuration and API service.
 * Uses the Vite dev proxy ("/api" → localhost:3001) so no CORS issues in dev.
 */

const API_BASE = "/api";

/**
 * Sends a chat query via SSE POST.
 * Returns a ReadableStream of SSE events for real-time parsing.
 *
 * @param {string}  query               - User's natural-language question
 * @param {Array}   conversationHistory  - Previous messages [{role, content}]
 * @param {AbortSignal} [signal]         - Cancellation signal
 * @returns {Promise<Response>}
 */
export async function sendChatQuery(query, conversationHistory = [], signal) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message ?? `Server error: ${response.status}`
    );
  }

  return response;
}

/**
 * Health check.
 */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export default { sendChatQuery, checkHealth };
