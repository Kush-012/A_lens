/**
 * tools/index.js
 *
 * Central export for all tools.
 * Provides a tool registry that the Tool Selector node uses to resolve
 * tool names from the execution plan to their actual implementations.
 */

export { searchCompanyTool }    from "./searchCompanyTool.js";
export { quoteTool }            from "./quoteTool.js";
export { profileTool }          from "./profileTool.js";
export { financialMetricsTool } from "./financialMetricsTool.js";
export { financialStatementsTool } from "./financialStatementsTool.js";
export { earningsTool }         from "./earningsTool.js";
export { recommendationTool }   from "./recommendationTool.js";
export { priceTargetTool }      from "./priceTargetTool.js";
export { newsTool }             from "./newsTool.js";
export { peersTool }            from "./peersTool.js";
export { esgTool }              from "./esgTool.js";
export { insiderTool }          from "./insiderTool.js";
export { calculatorTool }       from "./calculatorTool.js";
export { comparisonTool }       from "./comparisonTool.js";
export { trendTool }            from "./trendTool.js";
export { riskTool }             from "./riskTool.js";
export { investmentScoringTool } from "./investmentScoringTool.js";

/**
 * Tool registry: maps tool name strings (used in execution plans)
 * to their implementations. This allows the executor to call tools
 * dynamically without a giant switch statement.
 */
export const TOOL_REGISTRY = {
  searchCompany:        (await import("./searchCompanyTool.js")).default,
  quote:                (await import("./quoteTool.js")).default,
  profile:              (await import("./profileTool.js")).default,
  financialMetrics:     (await import("./financialMetricsTool.js")).default,
  financialStatements:  (await import("./financialStatementsTool.js")).default,
  earnings:             (await import("./earningsTool.js")).default,
  recommendation:       (await import("./recommendationTool.js")).default,
  priceTarget:          (await import("./priceTargetTool.js")).default,
  news:                 (await import("./newsTool.js")).default,
  peers:                (await import("./peersTool.js")).default,
  esg:                  (await import("./esgTool.js")).default,
  insider:              (await import("./insiderTool.js")).default,
  calculator:           (await import("./calculatorTool.js")).default,
  comparison:           (await import("./comparisonTool.js")).default,
  trend:                (await import("./trendTool.js")).default,
  risk:                 (await import("./riskTool.js")).default,
  investmentScoring:    (await import("./investmentScoringTool.js")).default,
};
