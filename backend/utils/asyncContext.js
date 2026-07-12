/**
 * utils/asyncContext.js
 *
 * AsyncLocalStorage provides a way to pass context (like the SSE emit function)
 * down the call stack without having to thread it explicitly through every
 * function signature.
 */

import { AsyncLocalStorage } from "node:async_hooks";

export const traceContext = new AsyncLocalStorage();
