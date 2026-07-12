/**
 * tools/comparisonTool.js
 *
 * Side-by-side comparison of financial metrics for two or more companies.
 * Produces a structured comparison table with winner annotations.
 */

import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * Higher = better metrics (e.g., ROE, margins)
 * Lower = better metrics (e.g., PE ratio, debt)
 */
const HIGHER_IS_BETTER = new Set([
  "roeTTM", "roeAnnual", "roaTTM", "roaAnnual", "roicAnnual",
  "grossMarginTTM", "netProfitMarginTTM", "operatingMarginTTM",
  "revenueGrowthTTMYoy", "epsGrowthTTMYoy", "currentRatioAnnual",
  "freeCashFlowPerShareTTM", "dividendPerShareAnnual",
  "epsTTM", "epsAnnual", "bookValuePerShareAnnual",
]);

const LOWER_IS_BETTER = new Set([
  "peRatioTTM", "pbRatioAnnual", "psRatioTTM", "evToEbitdaAnnual",
  "debtToEquityAnnual", "totalDebtToTotalAssetsAnnual",
]);

/**
 * Compares financial metrics for multiple companies.
 *
 * @param {Array<{symbol: string, metrics: object}>} companies
 *   Each element has a symbol and a flat metrics object with numeric values.
 * @param {string[]} [metricKeys] - Optional subset of metrics to compare.
 *   If empty, compares all numeric metrics.
 * @returns {object} Structured comparison result.
 */
export function comparisonTool(companies, metricKeys = []) {
  logger.info(
    `[comparisonTool] Comparing ${companies.map((c) => c.symbol).join(" vs ")}`
  );

  if (!companies || companies.length < 2) {
    return {
      success: false,
      data: null,
      error: "Comparison requires at least two companies.",
    };
  }

  // Flatten nested metrics into a single level
  function flattenMetrics(metricsData) {
    const flat = {};
    function recurse(obj, prefix = "") {
      for (const [key, val] of Object.entries(obj ?? {})) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === "number" || val === null) {
          flat[fullKey] = val;
        } else if (typeof val === "object" && val !== null) {
          recurse(val, fullKey);
        }
      }
    }
    recurse(metricsData);
    return flat;
  }

  const flattened = companies.map((c) => ({
    symbol: c.symbol,
    name: c.name ?? c.symbol,
    metrics: flattenMetrics(c.metrics),
  }));

  // Determine which metrics to compare
  const allKeys = metricKeys.length > 0
    ? metricKeys
    : Object.keys(flattened[0].metrics).filter((k) =>
        flattened.every((c) => c.metrics[k] !== null && c.metrics[k] !== undefined)
      );

  const rows = allKeys.map((key) => {
    const values = flattened.map((c) => ({
      symbol: c.symbol,
      value: c.metrics[key] ?? null,
    }));

    const numericValues = values.filter((v) => typeof v.value === "number");
    let winner = null;

    if (numericValues.length >= 2) {
      const shortKey = key.split(".").pop();
      if (HIGHER_IS_BETTER.has(shortKey)) {
        winner = numericValues.reduce((best, v) =>
          v.value > best.value ? v : best
        ).symbol;
      } else if (LOWER_IS_BETTER.has(shortKey)) {
        winner = numericValues.reduce((best, v) =>
          v.value < best.value ? v : best
        ).symbol;
      }
    }

    return {
      metric: key,
      values,
      winner,
    };
  });

  // Score each company by wins
  const scorecard = companies.reduce((acc, c) => {
    acc[c.symbol] = 0;
    return acc;
  }, {});

  rows.forEach((row) => {
    if (row.winner && scorecard[row.winner] !== undefined) {
      scorecard[row.winner]++;
    }
  });

  const overallWinner = Object.entries(scorecard).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  return {
    success: true,
    data: {
      companies: flattened.map((c) => c.symbol),
      rows,
      scorecard,
      overallWinner,
      totalMetricsCompared: rows.length,
    },
    error: null,
  };
}

export default comparisonTool;
