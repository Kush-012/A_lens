/**
 * langgraph/graph.js
 *
 * The LangGraph Agent Graph — compiled once at module load time.
 * Redesigned to utilize advanced features: Parallel Send(), Conditional Routing, Cycles, Checkpoints.
 */

import { StateGraph, END, START, MemorySaver } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { intentNode } from "../nodes/intentNode.js";
import { resolverNode } from "../nodes/resolverNode.js";
import { plannerNode } from "../nodes/plannerNode.js";
import { executorNode } from "../nodes/executorNode.js";
import { validatorNode } from "../nodes/validatorNode.js";
import { llmFallbackNode } from "../nodes/llmFallbackNode.js";
import { reportNode } from "../nodes/reportNode.js";
import { mapToExecution, validateAndRoute } from "../edges/conditionalEdges.js";
import { traceContext } from "../utils/asyncContext.js";
import logger from "../utils/logger.js";

function withTrace(nodeName, nodeFn) {
  return async (state, config) => {
    const emit = config?.configurable?.emit ?? (() => {});
    const startTime = Date.now();
    
    emit({ 
      type: "node_start", 
      nodeName, 
      timestamp: startTime, 
      stateBefore: { ...state } 
    });
    
    try {
      const result = await nodeFn(state, config);
      const duration = Date.now() - startTime;
      emit({ 
        type: "node_complete", 
        nodeName, 
        timestamp: Date.now(), 
        duration, 
        stateAfter: { ...state, ...result } 
      });
      return result;
    } catch (err) {
      emit({ 
        type: "node_error", 
        nodeName, 
        timestamp: Date.now(), 
        duration: Date.now() - startTime, 
        error: err.message 
      });
      throw err;
    }
  };
}

const graph = new StateGraph(AgentState)
  .addNode("intentNode", withTrace("intentNode", intentNode))
  .addNode("resolverNode", withTrace("resolverNode", resolverNode))
  .addNode("plannerNode", withTrace("plannerNode", plannerNode))
  .addNode("executorNode", withTrace("executorNode", executorNode))
  .addNode("validatorNode", withTrace("validatorNode", validatorNode))
  .addNode("llmFallbackNode", withTrace("llmFallbackNode", llmFallbackNode))
  .addNode("reportNode", withTrace("reportNode", reportNode))

  // Graph flow
  .addEdge(START, "intentNode")
  .addEdge("intentNode", "resolverNode")
  .addEdge("resolverNode", "plannerNode")
  
  // Dynamic Map-Reduce (Parallel Send)
  .addConditionalEdges("plannerNode", mapToExecution)
  
  // Each parallel branch returns to validatorNode
  .addEdge("executorNode", "validatorNode")
  
  // Conditional Routing (Retries, Fallback, Happy Path)
  .addConditionalEdges("validatorNode", validateAndRoute)
  
  // Terminals
  .addEdge("reportNode", END)
  .addEdge("llmFallbackNode", END);

const checkpointer = new MemorySaver();

export const agentGraph = graph.compile({ checkpointer });

/**
 * Runs the agent graph for a single user query.
 */
export async function runAgent(query, conversationHistory, emit) {
  logger.info(`[agentGraph] Running agent for query: "${query}"`);

  const threadId = Date.now().toString(); // unique thread per request for checkpointer
  const initialState = {
    query,
    conversationHistory,
    startTime: Date.now(),
    toolResults: {},
    resolvedSymbols: {},
    errors: [],
    executionLog: [],
    missingTools: [],
    retryCount: 0,
    validationStatus: "pending",
    llmFallbackTriggered: false
  };

  try {
    const finalState = await traceContext.run({ emit }, async () => {
      return await agentGraph.invoke(initialState, {
        configurable: { emit, thread_id: threadId },
        recursionLimit: 50,
      });
    });

    logger.info(
      `[agentGraph] Completed in ${(Date.now() - initialState.startTime)}ms`
    );

    return finalState;
  } catch (err) {
    logger.error(`[agentGraph] Fatal error: ${err.message}`);
    throw err;
  }
}

export default agentGraph;
