/**
 * nodes/executorNode.js
 *
 * LangGraph Node 4: Executor Node
 * Executes a single tool. Scaled horizontally via LangGraph Send().
 */

import logger from "../utils/logger.js";
import {
  quoteTool,
  profileTool,
  financialMetricsTool,
  financialStatementsTool,
  earningsTool,
  recommendationTool,
  priceTargetTool,
  newsTool,
  peersTool,
  esgTool,
  insiderTool,
  calculatorTool,
  comparisonTool,
  trendTool,
  riskTool,
  investmentScoringTool,
} from "../tools/index.js";

async function dispatchTool(toolName, args, currentResults) {
  switch (toolName) {
    case "quote": return quoteTool(args.symbol);
    case "profile": return profileTool(args.symbol);
    case "financialMetrics": return financialMetricsTool(args.symbol);
    case "financialStatements": return financialStatementsTool(args.symbol, args.freq ?? "annual");
    case "earnings": return earningsTool(args.symbol, args.limit ?? 8);
    case "recommendation": return recommendationTool(args.symbol);
    case "priceTarget": return priceTargetTool(args.symbol);
    case "news": return newsTool(args.symbol, args.days ?? 30, args.limit ?? 15);
    case "peers": return peersTool(args.symbol);
    case "esg": return esgTool(args.symbol);
    case "insider": return insiderTool(args.symbol, args.limit ?? 20);
    
    // Internal tools that depend on previous results
    case "calculator": {
      const values = Array.isArray(args.values) ? args.values : Object.values(args.values ?? {});
      return calculatorTool(args.operation, values, args.options ?? {});
    }
    case "comparison": {
      const companies = (args.companies ?? []).map((symbol) => {
        const metricsKey = `financialMetrics_${symbol}`;
        const metrics = currentResults[metricsKey]?.data ?? {};
        return { symbol, name: symbol, metrics };
      });
      return comparisonTool(companies, args.metricKeys ?? []);
    }
    case "trend": {
      const symbol = args.symbol;
      const statementsKey = `financialStatements_${symbol}`;
      if (!currentResults[statementsKey]?.data) throw new Error("Missing financialStatements dependency");
      return trendTool(symbol, currentResults[statementsKey].data, args.metric ?? "revenue");
    }
    case "risk": {
      const symbol = args.symbol;
      const metricsKey = `financialMetrics_${symbol}`;
      const earningsKey = `earnings_${symbol}`;
      if (!currentResults[metricsKey]?.data) throw new Error("Missing financialMetrics dependency");
      return riskTool(symbol, currentResults[metricsKey].data, currentResults[earningsKey]?.data);
    }
    case "investmentScoring": {
      const symbol = args.symbol;
      const metricsKey = `financialMetrics_${symbol}`;
      const recKey = `recommendation_${symbol}`;
      if (!currentResults[metricsKey]?.data) throw new Error("Missing financialMetrics dependency");
      return investmentScoringTool(symbol, currentResults[metricsKey].data, currentResults[recKey]?.data);
    }
    default:
      return { success: false, error: `Unknown tool: "${toolName}"` };
  }
}

export async function executorNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();
  
  const toolDef = state.activeTool;
  if (!toolDef) return {}; // Failsafe

  const resultKey = toolDef.args?.symbol ? `${toolDef.tool}_${toolDef.args.symbol}` : toolDef.tool;
  
  emit({
    type: "tool_start",
    tool: toolDef.tool,
    symbol: toolDef.args?.symbol,
    input: toolDef.args,
  });

  let result;
  try {
    result = await dispatchTool(toolDef.tool, toolDef.args, state.toolResults || {});
    
    emit({
      type: "tool_complete",
      tool: toolDef.tool,
      symbol: toolDef.args?.symbol,
      success: result.success,
      input: toolDef.args,
      output: result,
      duration: Date.now() - startedAt,
    });
    
    if (!result.success) {
      logger.warn(`[executorNode] Tool "${toolDef.tool}" returned failure: ${result.error}`);
    } else {
      logger.info(`[executorNode] Tool "${toolDef.tool}" succeeded.`);
    }
  } catch (err) {
    logger.error(`[executorNode] Tool "${toolDef.tool}" threw: ${err.message}`);
    result = { success: false, error: err.message };
    
    emit({
      type: "tool_error",
      tool: toolDef.tool,
      error: err.message,
      input: toolDef.args,
      duration: Date.now() - startedAt,
    });
  }

  return {
    toolResults: { [resultKey]: result },
    executionLog: [
      {
        node: "executorNode",
        tool: toolDef.tool,
        status: result.success ? "success" : "error",
        duration: Date.now() - startedAt,
      }
    ]
  };
}
