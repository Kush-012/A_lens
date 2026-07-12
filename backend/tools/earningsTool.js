/**
 * tools/earningsTool.js
 *
 * Fetches quarterly EPS actual vs. estimate surprises.
 * Critical for earnings analysis and trend queries.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol  - Ticker symbol
 * @param {number} [limit] - Number of quarters to return (default: 8)
 * @returns {Promise<object>}
 */
export async function earningsTool(symbol, limit = 8) {
  logger.info(`[earningsTool] Fetching earnings for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/earnings", { symbol });

    if (isFinnhubEmpty(data) || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No earnings data available for "${symbol}".`,
      };
    }

    const earnings = data.slice(0, limit).map((q) => {
      const surprise =
        q.actual !== null && q.estimate !== null
          ? round(q.actual - q.estimate, 4)
          : null;
      const surprisePct =
        q.estimate && q.estimate !== 0
          ? round(((q.actual - q.estimate) / Math.abs(q.estimate)) * 100, 2)
          : null;

      return {
        period: q.period,
        year: q.period ? parseInt(q.period.split("-")[0]) : null,
        quarter: q.quarter,
        actual: round(q.actual, 4),
        estimate: round(q.estimate, 4),
        surprise: surprise,
        surprisePercent: surprisePct,
        beat: surprise !== null ? surprise >= 0 : null,
      };
    });

    const beatsCount = earnings.filter((e) => e.beat === true).length;
    const missCount = earnings.filter((e) => e.beat === false).length;

    return {
      success: true,
      symbol,
      data: {
        quarters: earnings,
        summary: {
          totalPeriods: earnings.length,
          beats: beatsCount,
          misses: missCount,
          beatRate: earnings.length
            ? round((beatsCount / earnings.length) * 100, 1)
            : null,
          averageSurprisePct: earnings.length
            ? round(
                earnings
                  .filter((e) => e.surprisePercent !== null)
                  .reduce((sum, e) => sum + e.surprisePercent, 0) /
                  earnings.filter((e) => e.surprisePercent !== null).length,
                2
              )
            : null,
        },
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[earningsTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch earnings: ${err.message}`,
    };
  }
}

export default earningsTool;
