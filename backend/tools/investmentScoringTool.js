/**
 * tools/investmentScoringTool.js
 *
 * Computes a composite Investment Score (0–100) from multiple financial factors.
 *
 * Score breakdown:
 *   Profitability  25 pts  (ROE, ROA, net margin)
 *   Growth         25 pts  (revenue growth, EPS growth)
 *   Valuation      20 pts  (PE, PB, EV/EBITDA — lower = better)
 *   Financial Health 20 pts (current ratio, debt/equity)
 *   Analyst Opinion 10 pts  (recommendation consensus)
 *
 * Score bands:
 *   80–100  Strong Buy
 *   65–79   Buy
 *   50–64   Hold
 *   35–49   Underperform
 *   0–34    Sell
 */

import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export function investmentScoringTool(
  symbol,
  metrics,
  recommendations = null
) {
  logger.info(`[investmentScoringTool] Scoring ${symbol}`);

  if (!metrics) {
    return {
      success: false,
      symbol,
      data: null,
      error: "Financial metrics required for investment scoring.",
    };
  }

  const breakdown = {};

  // ── Profitability (25 pts) ───────────────────────────────────────────────
  let profScore = 0;
  const roe = parseFloat(metrics.profitability?.roeTTM);
  const roa = parseFloat(metrics.profitability?.roaTTM);
  const netMargin = parseFloat(metrics.profitability?.netProfitMarginTTM);

  if (!isNaN(roe)) {
    if (roe > 30) profScore += 10;
    else if (roe > 20) profScore += 8;
    else if (roe > 15) profScore += 6;
    else if (roe > 10) profScore += 4;
    else if (roe > 0)  profScore += 2;
  }
  if (!isNaN(roa)) {
    if (roa > 15) profScore += 8;
    else if (roa > 10) profScore += 6;
    else if (roa > 5)  profScore += 4;
    else if (roa > 0)  profScore += 2;
  }
  if (!isNaN(netMargin)) {
    if (netMargin > 25) profScore += 7;
    else if (netMargin > 15) profScore += 5;
    else if (netMargin > 8)  profScore += 3;
    else if (netMargin > 0)  profScore += 1;
  }
  breakdown.profitability = { score: Math.min(profScore, 25), maxScore: 25 };

  // ── Growth (25 pts) ──────────────────────────────────────────────────────
  let growthScore = 0;
  const revGrowth = parseFloat(metrics.growth?.revenueGrowthTTMYoy);
  const epsGrowth = parseFloat(metrics.growth?.epsGrowthTTMYoy);

  if (!isNaN(revGrowth)) {
    if (revGrowth > 25)     growthScore += 13;
    else if (revGrowth > 15) growthScore += 10;
    else if (revGrowth > 10) growthScore += 7;
    else if (revGrowth > 5)  growthScore += 4;
    else if (revGrowth > 0)  growthScore += 2;
    else growthScore -= 3;
  }
  if (!isNaN(epsGrowth)) {
    if (epsGrowth > 25)     growthScore += 12;
    else if (epsGrowth > 15) growthScore += 9;
    else if (epsGrowth > 10) growthScore += 6;
    else if (epsGrowth > 5)  growthScore += 3;
    else if (epsGrowth > 0)  growthScore += 1;
    else growthScore -= 3;
  }
  breakdown.growth = {
    score: Math.min(Math.max(growthScore, 0), 25),
    maxScore: 25,
  };

  // ── Valuation (20 pts) ───────────────────────────────────────────────────
  let valScore = 0;
  const pe  = metrics.valuation?.peRatioTTM;
  const pb  = metrics.valuation?.pbRatioAnnual;
  const evEbitda = metrics.valuation?.evToEbitdaTTM;

  if (pe !== null && pe !== undefined && pe > 0) {
    if (pe < 10)       valScore += 8;
    else if (pe < 15)  valScore += 6;
    else if (pe < 25)  valScore += 4;
    else if (pe < 40)  valScore += 2;
  }
  if (pb !== null && pb !== undefined && pb > 0) {
    if (pb < 1)        valScore += 6;
    else if (pb < 2)   valScore += 4;
    else if (pb < 5)   valScore += 2;
    else if (pb < 10)  valScore += 1;
  }
  if (evEbitda !== null && evEbitda !== undefined && evEbitda > 0) {
    if (evEbitda < 10)      valScore += 6;
    else if (evEbitda < 15) valScore += 4;
    else if (evEbitda < 25) valScore += 2;
    else if (evEbitda < 40) valScore += 1;
  }
  breakdown.valuation = {
    score: Math.min(valScore, 20),
    maxScore: 20,
  };

  // ── Financial Health (20 pts) ────────────────────────────────────────────
  let healthScore = 0;
  const currentRatio = metrics.financial_health?.currentRatioAnnual;
  const debtToEquity = parseFloat(metrics.financial_health?.debtToEquityAnnual);

  if (currentRatio !== null && currentRatio !== undefined) {
    if (currentRatio > 3)      healthScore += 10;
    else if (currentRatio > 2) healthScore += 8;
    else if (currentRatio > 1.5) healthScore += 6;
    else if (currentRatio > 1)   healthScore += 3;
  }
  if (!isNaN(debtToEquity)) {
    if (debtToEquity < 0.2)      healthScore += 10;
    else if (debtToEquity < 0.5) healthScore += 8;
    else if (debtToEquity < 1.0) healthScore += 5;
    else if (debtToEquity < 2.0) healthScore += 2;
  }
  breakdown.financialHealth = {
    score: Math.min(healthScore, 20),
    maxScore: 20,
  };

  // ── Analyst Opinion (10 pts) ─────────────────────────────────────────────
  let analystScore = 0;
  if (recommendations) {
    const { bullishPercent, consensus } = recommendations;
    if (consensus === "Strong Buy" || bullishPercent > 80) analystScore = 10;
    else if (consensus === "Buy"   || bullishPercent > 65) analystScore = 7;
    else if (consensus === "Hold"  || bullishPercent > 50) analystScore = 5;
    else analystScore = 2;
  }
  breakdown.analystOpinion = { score: analystScore, maxScore: 10 };

  // ── Total Score ──────────────────────────────────────────────────────────
  const totalScore = round(
    breakdown.profitability.score +
      breakdown.growth.score +
      breakdown.valuation.score +
      breakdown.financialHealth.score +
      breakdown.analystOpinion.score,
    1
  );

  let recommendation;
  let confidence;
  if (totalScore >= 80)      { recommendation = "Strong Buy"; confidence = "High"; }
  else if (totalScore >= 65) { recommendation = "Buy";        confidence = "High"; }
  else if (totalScore >= 50) { recommendation = "Hold";       confidence = "Moderate"; }
  else if (totalScore >= 35) { recommendation = "Underperform"; confidence = "Moderate"; }
  else                       { recommendation = "Sell";       confidence = "High"; }

  return {
    success: true,
    symbol,
    data: {
      investmentScore: totalScore,
      recommendation,
      confidence,
      breakdown,
      interpretation: `${symbol} scored ${totalScore}/100. ${recommendation} — ${confidence} confidence.`,
    },
    error: null,
  };
}

export default investmentScoringTool;
