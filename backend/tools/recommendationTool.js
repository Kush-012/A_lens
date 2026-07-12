/**
 * tools/recommendationTool.js
 *
 * Fetches analyst recommendation trends (Strong Buy / Buy / Hold / Sell / Strong Sell).
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol
 * @returns {Promise<object>}
 */
export async function recommendationTool(symbol) {
  logger.info(`[recommendationTool] Fetching recommendations for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/recommendation", { symbol });

    if (isFinnhubEmpty(data) || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No recommendation data available for "${symbol}".`,
      };
    }

    // Most recent period
    const latest = data[0];
    const total =
      (latest.strongBuy ?? 0) +
      (latest.buy ?? 0) +
      (latest.hold ?? 0) +
      (latest.sell ?? 0) +
      (latest.strongSell ?? 0);

    const bullish = (latest.strongBuy ?? 0) + (latest.buy ?? 0);
    const bearish = (latest.sell ?? 0) + (latest.strongSell ?? 0);

    let consensus = "Hold";
    if (total > 0) {
      const bullishPct = bullish / total;
      const bearishPct = bearish / total;
      if (bullishPct >= 0.6) consensus = "Buy";
      else if (bullishPct >= 0.75) consensus = "Strong Buy";
      else if (bearishPct >= 0.6) consensus = "Sell";
      else if (bearishPct >= 0.75) consensus = "Strong Sell";
    }

    return {
      success: true,
      symbol,
      data: {
        period: latest.period,
        strongBuy: latest.strongBuy,
        buy: latest.buy,
        hold: latest.hold,
        sell: latest.sell,
        strongSell: latest.strongSell,
        total,
        consensus,
        bullishPercent: total ? round((bullish / total) * 100, 1) : null,
        bearishPercent: total ? round((bearish / total) * 100, 1) : null,
        history: data.slice(0, 6).map((d) => ({
          period: d.period,
          strongBuy: d.strongBuy,
          buy: d.buy,
          hold: d.hold,
          sell: d.sell,
          strongSell: d.strongSell,
        })),
      },
      error: null,
    };
  } catch (err) {
    logger.error(
      `[recommendationTool] Error for ${symbol}: ${err.message}`
    );
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch recommendations: ${err.message}`,
    };
  }
}

export default recommendationTool;
