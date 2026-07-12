/**
 * langgraph/state.js
 *
 * Defines the LangGraph state annotation for the investment research agent.
 *
 * Why use Annotation.Root?
 * LangGraph requires a typed state definition so the graph can manage
 * state transitions safely. Annotation.Root with reducers ensures that
 * node updates are merged correctly — not overwritten — when nodes
 * return partial state updates.
 *
 * Design decision: toolResults uses a merge reducer so multiple tool
 * outputs can accumulate without each node needing to read and re-write
 * the entire toolResults object.
 */

import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  // ── Input ─────────────────────────────────────────────────────────────
  query: Annotation({
    reducer: (_, b) => b,
    default: () => "",
  }),

  conversationHistory: Annotation({
    reducer: (a, b) => (b !== undefined ? b : a),
    default: () => [],
  }),

  // ── Intent Detection ──────────────────────────────────────────────────
  intent: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ── Execution Planning ────────────────────────────────────────────────
  executionPlan: Annotation({
    reducer: (_, b) => b,
    default: () => [],
  }),

  // ── Tool Selection ────────────────────────────────────────────────────
  selectedTools: Annotation({
    reducer: (_, b) => b,
    default: () => [],
  }),

  resolvedSymbols: Annotation({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),

  // ── Tool Results ──────────────────────────────────────────────────────
  // Merge reducer: each tool appends its result to the map
  toolResults: Annotation({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),

  // ── Validation ────────────────────────────────────────────────────────
  validationReport: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ── Reasoning ────────────────────────────────────────────────────────
  reasoning: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ── Report ────────────────────────────────────────────────────────────
  report: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ── Execution Metadata ────────────────────────────────────────────────
  executionLog: Annotation({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  startTime: Annotation({
    reducer: (a, b) => b ?? a,
    default: () => Date.now(),
  }),

  // ── Error Tracking ────────────────────────────────────────────────────
  errors: Annotation({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),

  // ── Dynamic Execution & Retry Logic ────────────────────────────────────
  missingTools: Annotation({
    reducer: (_, b) => b,
    default: () => [],
  }),
  
  activeTool: Annotation({
    reducer: (_, b) => b,
    default: () => null,
  }),

  retryCount: Annotation({
    reducer: (_, b) => b,
    default: () => 0,
  }),

  validationStatus: Annotation({
    reducer: (_, b) => b,
    default: () => "pending", // pending, partial, success, failed
  }),

  llmFallbackTriggered: Annotation({
    reducer: (_, b) => b,
    default: () => false,
  }),
});

export default AgentState;
