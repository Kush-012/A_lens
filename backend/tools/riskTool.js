/**
 * tools/riskTool.js
 *
 * Computes a multi-factor risk assessment from financial metrics.
 *
 * Risk factors evaluated:
 *   - Market risk   : Beta, 52-week volatility
 *   - Leverage risk : Debt/equity, interest coverage
 *   - Liquidity risk: Current ratio, quick ratio
 *   - Valuation risk: PE ratio vs sector average
 *   - Earnings risk : EPS surprise consistency
 */

import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol   - Ticker symbol
 * @param {object} metrics  - Output from financialMetricsTool (data field)
 * @param {object} [earnings] - Output from earningsTool (data field), optional
 * @returns {object}
 */
export function riskTool(symbol, metrics, earnings = null) {
  logger.info(`[riskTool] Computing risk profile for ${symbol}`);

  if (!metrics) {
    return {
      success: false,
      symbol,
      data: null,
      error: "Financial metrics required for risk assessment.",
    };
  }

  const scores = {};
  const flags = [];

  // ── Market Risk ──────────────────────────────────────────────────────────
  const beta = metrics.market?.beta;
  if (beta !== null && beta !== undefined) {
    if (beta > 2.0)      { scores.marketRisk = 10; flags.push(`High beta (${beta}) — very volatile`); }
    else if (beta > 1.5) { scores.marketRisk = 7;  flags.push(`Elevated beta (${beta}) — above-market volatility`); }
    else if (beta > 1.0) { scores.marketRisk = 5;  }
    else if (beta > 0.5) { scores.marketRisk = 3;  }
    else                 { scores.marketRisk = 1;  flags.push("Low beta — defensive stock"); }
  }

  const w52High = metrics.market?.week52High;
  const w52Low  = metrics.market?.week52Low;
  if (w52High && w52Low && w52High > 0) {
    const range = round(((w52High - w52Low) / w52High) * 100, 1);
    if (range > 60) { scores.priceVolatility = 9; flags.push(`Wide 52-week range (${range}%) — high price risk`); }
    else if (range > 40) { scores.priceVolatility = 6; }
    else if (range > 20) { scores.priceVolatility = 3; }
    else                 { scores.priceVolatility = 1; }
  }

  // ── Leverage Risk ────────────────────────────────────────────────────────
  const debtToEquity = parseFloat(metrics.financial_health?.debtToEquityAnnual);
  if (!isNaN(debtToEquity)) {
    if (debtToEquity > 3.0)      { scores.leverageRisk = 10; flags.push(`Very high debt/equity (${debtToEquity})`); }
    else if (debtToEquity > 2.0) { scores.leverageRisk = 7;  flags.push(`High debt/equity (${debtToEquity})`); }
    else if (debtToEquity > 1.0) { scores.leverageRisk = 5;  }
    else if (debtToEquity > 0.5) { scores.leverageRisk = 3;  }
    else                         { scores.leverageRisk = 1;  flags.push("Low leverage — conservative balance sheet"); }
  }

  const interestCoverage = metrics.financial_health?.interestCoverageAnnual;
  if (interestCoverage !== null && interestCoverage !== undefined) {
    if (interestCoverage < 1.5)  { scores.interestRisk = 10; flags.push(`Insufficient interest coverage (${interestCoverage}x)`); }
    else if (interestCoverage < 3)  { scores.interestRisk = 6;  }
    else if (interestCoverage < 5)  { scores.interestRisk = 3;  }
    else                             { scores.interestRisk = 1;  }
  }

  // ── Liquidity Risk ───────────────────────────────────────────────────────
  const currentRatio = metrics.financial_health?.currentRatioAnnual;
  if (currentRatio !== null && currentRatio !== undefined) {
    if (currentRatio < 0.5)      { scores.liquidityRisk = 10; flags.push(`Critical liquidity (current ratio: ${currentRatio})`); }
    else if (currentRatio < 1.0) { scores.liquidityRisk = 8;  flags.push(`Low liquidity (current ratio: ${currentRatio})`); }
    else if (currentRatio < 1.5) { scores.liquidityRisk = 5;  }
    else                         { scores.liquidityRisk = 2;  }
  }

  // ── Valuation Risk ───────────────────────────────────────────────────────
  const pe = metrics.valuation?.peRatioTTM;
  if (pe !== null && pe !== undefined) {
    if (pe > 100)      { scores.valuationRisk = 10; flags.push(`Extremely high PE ratio (${pe}) — significant valuation risk`); }
    else if (pe > 50)  { scores.valuationRisk = 7;  flags.push(`Elevated PE ratio (${pe})`); }
    else if (pe > 30)  { scores.valuationRisk = 5;  }
    else if (pe > 15)  { scores.valuationRisk = 3;  }
    else if (pe > 0)   { scores.valuationRisk = 1;  }
    else               { scores.valuationRisk = 6;  flags.push("Negative PE — company reporting losses"); }
  }

  // ── Earnings Risk ────────────────────────────────────────────────────────
  if (earnings?.summary) {
    const { beatRate, totalPeriods } = earnings.summary;
    if (totalPeriods >= 4) {
      if (beatRate < 50) { scores.earningsRisk = 8;  flags.push(`Low earnings beat rate (${beatRate}%)`); }
      else if (beatRate < 70) { scores.earningsRisk = 4; }
      else                    { scores.earningsRisk = 1; }
    }
  }

  // ── Composite Score ──────────────────────────────────────────────────────
  const scoreValues = Object.values(scores);
  const compositeScore =
    scoreValues.length > 0
      ? round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length, 1)
      : null;

  let riskLevel;
  if (compositeScore === null)     riskLevel = "Unknown";
  else if (compositeScore >= 8)    riskLevel = "Very High";
  else if (compositeScore >= 6)    riskLevel = "High";
  else if (compositeScore >= 4)    riskLevel = "Moderate";
  else if (compositeScore >= 2)    riskLevel = "Low";
  else                             riskLevel = "Very Low";

  return {
    success: true,
    symbol,
    data: {
      compositeRiskScore: compositeScore,
      riskLevel,
      individualScores: scores,
      flags,
      summary: `${symbol} has a ${riskLevel} risk profile (score: ${compositeScore}/10). ${flags.length > 0 ? flags[0] : ""}`,
    },
    error: null,
  };
}

export default riskTool;
