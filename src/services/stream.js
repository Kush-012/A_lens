/**
 * services/stream.js
 *
 * SSE stream parser.
 * Reads the fetch Response body as a text stream and yields parsed JSON events.
 *
 * Why a manual SSE parser instead of EventSource?
 * EventSource only supports GET. Our chat endpoint is POST (it sends
 * a JSON body). Using fetch + ReadableStream gives us POST support
 * while still processing events as they arrive.
 */

/**
 * Parses an SSE response body, calling `onEvent` for each parsed event.
 *
 * @param {Response}  response  - fetch Response with body stream
 * @param {Function}  onEvent   - (event: object) => void
 * @returns {Promise<void>}     - Resolves when stream ends
 */
export async function parseSSEStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const parts = buffer.split("\n\n");
      // The last part may be incomplete — keep it in the buffer
      buffer = parts.pop() || "";

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        // Each SSE line is "data: <json>"
        for (const line of trimmed.split("\n")) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);
              onEvent(event);
            } catch {
              // Malformed JSON — skip this event
              console.warn("[stream] Failed to parse SSE event:", jsonStr);
            }
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      for (const line of buffer.trim().split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            onEvent(JSON.parse(line.slice(6)));
          } catch {
            // ignore
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export default parseSSEStream;
