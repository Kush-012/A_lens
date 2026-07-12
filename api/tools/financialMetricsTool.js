/**
 * tools/financialMetricsTool.js
 *
 * Fetches 60+ key financial metrics from Finnhub's /stock/metric endpoint.
 * This is the most commonly used tool — it powers valuation, profitability,
 * and growth analyses.
 *
 * Metrics are grouped into logical categories so the reasoning node can
 * reference them by group rather than hunting through a flat object.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round, formatPercent, formatCompact } from "../utils/helpers.js";
import logger from "../utils/logger.js";

function r(v) { return round(v, 2); }

/**
 * @param {string} symbol - Ticker symbol
 * @returns {Promise<object>}
 */
export async function financialMetricsTool(symbol) {
  logger.info(`[financialMetricsTool] Fetching metrics for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/metric", {
      symbol,
      metric: "all",
    });

    if (isFinnhubEmpty(data) || !data.metric || Object.keys(data.metric).length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No financial metrics available for "${symbol}".`,
      };
    }

    const m = data.metric;

    return {
      success: true,
      symbol,
      data: {
        valuation: {
          peRatioTTM: r(m["peTTM"]),
          peRatioAnnual: r(m["peAnnual"]),
          pbRatioAnnual: r(m["pbAnnual"]),
          psRatioTTM: r(m["psTTM"]),
          evToEbitdaAnnual: r(m["ev/ebitdaAnnual"]),
          evToEbitdaTTM: r(m["ev/ebitdaTTM"]),
          priceToSalesRatioAnnual: r(m["psAnnual"]),
          priceToCashFlowTTM: r(m["ptbvAnnual"]),
        },
        profitability: {
          grossMarginTTM: formatPercent(m["grossMarginTTM"]),
          grossMarginAnnual: formatPercent(m["grossMarginAnnual"]),
          ebitdaMarginTTM: formatPercent(m["ebitdaMarginTTM"]),
          netProfitMarginTTM: formatPercent(m["netProfitMarginTTM"]),
          netProfitMarginAnnual: formatPercent(m["netProfitMarginAnnual"]),
          operatingMarginTTM: formatPercent(m["operatingMarginTTM"]),
          roeTTM: formatPercent(m["roeTTM"]),
          roeAnnual: formatPercent(m["roeAnnual"]),
          roaTTM: formatPercent(m["roaTTM"]),
          roaAnnual: formatPercent(m["roaAnnual"]),
          roicAnnual: formatPercent(m["roicAnnual"]),
        },
        growth: {
          revenueGrowthTTMYoy: formatPercent(m["revenueGrowthTTMYoy"]),
          revenueGrowth3Y: formatPercent(m["revenueGrowth3Y"]),
          revenueGrowth5Y: formatPercent(m["revenueGrowth5Y"]),
          epsGrowthTTMYoy: formatPercent(m["epsGrowthTTMYoy"]),
          epsGrowth3Y: formatPercent(m["epsGrowth3Y"]),
          epsGrowth5Y: formatPercent(m["epsGrowth5Y"]),
          revenuePerShareAnnual: r(m["revenuePerShareAnnual"]),
        },
        financial_health: {
          currentRatioAnnual: r(m["currentRatioAnnual"]),
          currentRatioQuarterly: r(m["currentRatioQuarterly"]),
          quickRatioAnnual: r(m["quickRatioAnnual"]),
          debtToEquityAnnual: r(m["totalDebt/totalEquityAnnual"]),
          debtToEquityQuarterly: r(m["totalDebt/totalEquityQuarterly"]),
          longTermDebtToEquityAnnual: r(m["longTermDebt/equityAnnual"]),
          netDebtAnnual: formatCompact(m["netDebtAnnual"]),
          totalDebtToTotalAssetsAnnual: r(m["totalDebt/totalAssetsAnnual"]),
          interestCoverageAnnual: r(m["interestCoverageAnnual"]),
        },
        per_share: {
          epsAnnual: r(m["epsAnnual"]),
          epsTTM: r(m["epsTTM"]),
          bookValuePerShareAnnual: r(m["bookValuePerShareAnnual"]),
          cashPerShareAnnual: r(m["cashPerShareAnnual"]),
          dividendPerShareAnnual: r(m["dividendPerShareAnnual"]),
          freeCashFlowPerShareTTM: r(m["freeCashFlowPerShareTTM"]),
        },
        market: {
          marketCapitalization: formatCompact(
            (m["marketCapitalization"] ?? 0) * 1e6
          ),
          week52High: r(m["52WeekHigh"]),
          week52Low: r(m["52WeekLow"]),
          week52HighDate: m["52WeekHighDate"],
          week52LowDate: m["52WeekLowDate"],
          beta: r(m["beta"]),
          dividendYieldIndicatedAnnual: formatPercent(
            m["dividendYieldIndicatedAnnual"]
          ),
          payoutRatioAnnual: formatPercent(m["payoutRatioAnnual"]),
        },
        raw: m, // Expose raw metrics for calculator tool
      },
      error: null,
    };
  } catch (err) {
    logger.error(
      `[financialMetricsTool] Error for ${symbol}: ${err.message}`
    );
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch financial metrics: ${err.message}`,
    };
  }
}

export default financialMetricsTool;
