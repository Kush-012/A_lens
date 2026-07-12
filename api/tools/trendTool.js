/**
 * tools/trendTool.js
 *
 * Analyses revenue, earnings, and price trends from historical statement data.
 * Computes growth rates and CAGR across periods.
 */

import { round, percentChange, cagr } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * Analyses trends from financial statement periods.
 *
 * @param {string} symbol       - Ticker symbol
 * @param {Array}  periods      - Array of financial statement period objects
 *                                (from financialStatementsTool)
 * @param {string} [metric]     - "revenue" | "netIncome" | "eps" | "ebitda"
 * @returns {object}
 */
export function trendTool(symbol, periods, metric = "revenue") {
  logger.info(
    `[trendTool] Analysing ${metric} trend for ${symbol}`
  );

  if (!Array.isArray(periods) || periods.length < 2) {
    return {
      success: false,
      symbol,
      metric,
      data: null,
      error:
        "Trend analysis requires at least 2 periods of financial data.",
    };
  }

  const METRIC_MAP = {
    revenue: (p) => p.income_statement?.revenue,
    netIncome: (p) => p.income_statement?.netIncome,
    eps: (p) => p.income_statement?.epsDiluted ?? p.income_statement?.epsBasic,
    ebitda: (p) => p.income_statement?.ebitda,
    operatingCashFlow: (p) => p.cash_flow?.operatingCashFlow,
    freeCashFlow: (p) => p.cash_flow?.freeCashFlow,
    totalDebt: (p) => p.balance_sheet?.totalDebt,
  };

  const extractor = METRIC_MAP[metric];
  if (!extractor) {
    return {
      success: false,
      symbol,
      metric,
      data: null,
      error: `Unknown metric: "${metric}". Supported: ${Object.keys(METRIC_MAP).join(", ")}`,
    };
  }

  // Periods from Finnhub are newest-first; reverse for chronological analysis
  const chronological = [...periods].reverse();
  const values = chronological.map((p) => ({
    period: p.period,
    year: p.year,
    value: extractor(p),
  }));

  // Compute YoY changes
  const withChanges = values.map((v, i) => {
    if (i === 0) return { ...v, yoyChange: null, yoyPct: null };
    const prev = values[i - 1].value;
    return {
      ...v,
      yoyChange:
        v.value !== null && prev !== null ? round(v.value - prev, 2) : null,
      yoyPct: percentChange(prev, v.value),
    };
  });

  // CAGR from first to last
  const first = values[0].value;
  const last = values[values.length - 1].value;
  const years = values.length - 1;
  const cagrValue = first && last && years > 0 ? cagr(first, last, years) : null;

  // Average YoY growth
  const yoyChanges = withChanges
    .filter((v) => v.yoyPct !== null)
    .map((v) => v.yoyPct);
  const avgYoyGrowth =
    yoyChanges.length > 0
      ? round(yoyChanges.reduce((a, b) => a + b, 0) / yoyChanges.length, 2)
      : null;

  // Trend direction
  let trend = "Stable";
  if (yoyChanges.length >= 2) {
    const positiveYears = yoyChanges.filter((c) => c > 0).length;
    if (positiveYears >= yoyChanges.length * 0.75) trend = "Growing";
    else if (positiveYears <= yoyChanges.length * 0.25) trend = "Declining";
  }

  return {
    success: true,
    symbol,
    metric,
    data: {
      periods: withChanges,
      cagr: cagrValue,
      averageYoyGrowth: avgYoyGrowth,
      trend,
      first,
      last,
      totalChange:
        first && last ? round(((last - first) / Math.abs(first)) * 100, 2) : null,
    },
    error: null,
  };
}

export default trendTool;
