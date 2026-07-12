/**
 * tools/esgTool.js
 *
 * Fetches ESG (Environmental, Social, Governance) scores.
 * Note: Requires Finnhub premium on some accounts. Gracefully degrades.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol
 * @returns {Promise<object>}
 */
export async function esgTool(symbol) {
  logger.info(`[esgTool] Fetching ESG scores for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/esg", { symbol });

    if (isFinnhubEmpty(data) || !data.environmentScore) {
      return {
        success: false,
        symbol,
        data: null,
        error: `ESG data not available for "${symbol}". This may require a premium Finnhub plan.`,
      };
    }

    const esgScore = round(
      (data.environmentScore + data.socialScore + data.governanceScore) / 3,
      1
    );

    function rateScore(score) {
      if (score >= 70) return "Excellent";
      if (score >= 55) return "Good";
      if (score >= 40) return "Average";
      if (score >= 25) return "Below Average";
      return "Poor";
    }

    return {
      success: true,
      symbol,
      data: {
        environmentScore: round(data.environmentScore, 1),
        socialScore: round(data.socialScore, 1),
        governanceScore: round(data.governanceScore, 1),
        esgScore,
        environmentRating: rateScore(data.environmentScore),
        socialRating: rateScore(data.socialScore),
        governanceRating: rateScore(data.governanceScore),
        overallRating: rateScore(esgScore),
        totalRatings: data.totalRatings,
        lastProcessedDate: data.lastProcessedDate,
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[esgTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch ESG data: ${err.message}`,
    };
  }
}

export default esgTool;
