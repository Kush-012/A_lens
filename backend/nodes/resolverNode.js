/**
 * nodes/resolverNode.js
 *
 * LangGraph Node 2: Resolver Node
 * Resolves company names from the intent to ticker symbols.
 */

import { searchCompanyTool } from "../tools/searchCompanyTool.js";
import logger from "../utils/logger.js";

export async function resolverNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  const companies = state.intent?.companies || [];
  
  if (companies.length === 0) {
    return {
      resolvedSymbols: {},
      executionLog: [
        { node: "resolverNode", status: "skipped", duration: Date.now() - startedAt }
      ]
    };
  }

  emit({ type: "step", step: `Resolving symbols for ${companies.join(", ")}...` });
  logger.info(`[resolverNode] Resolving symbols for: ${companies.join(", ")}`);

  const resolvedSymbols = { ...state.resolvedSymbols };
  const searches = companies.filter(c => !resolvedSymbols[c.toLowerCase()]);

  if (searches.length > 0) {
    const results = await Promise.allSettled(searches.map(name => searchCompanyTool(name)));

    results.forEach((result, i) => {
      const name = searches[i];
      if (result.status === "fulfilled" && result.value.success) {
        const { symbol, name: fullName } = result.value;
        resolvedSymbols[name.toLowerCase()] = symbol;
        resolvedSymbols[symbol.toLowerCase()] = symbol;
        
        emit({ type: "symbol_resolved", name, symbol, fullName });
        logger.info(`[resolverNode] Resolved "${name}" → ${symbol}`);
      } else {
        logger.warn(`[resolverNode] Could not resolve "${name}"`);
      }
    });
  }

  const count = Object.keys(resolvedSymbols).length / 2;
  emit({ type: "symbols_ready", resolvedSymbols, count: Math.ceil(count) });

  return {
    resolvedSymbols,
    executionLog: [
      {
        node: "resolverNode",
        status: "success",
        resolvedCount: Math.ceil(count),
        duration: Date.now() - startedAt,
      },
    ],
  };
}
