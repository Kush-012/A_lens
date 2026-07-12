/**
 * tools/quoteTool.js
 *
 * Fetches real-time quote data for a ticker symbol.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round, formatPercent } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol (e.g., "TSLA")
 * @returns {Promise<object>}
 */
export async function quoteTool(symbol) {
  logger.info(`[quoteTool] Fetching quote for ${symbol}`);

  try {
    const data = await finnhubGet("/quote", { symbol }, 60); // 1-min TTL for live prices

    if (isFinnhubEmpty(data) || data.c === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No quote data available for symbol "${symbol}". Verify the ticker.`,
      };
    }

    return {
      success: true,
      symbol,
      data: {
        currentPrice: round(data.c, 2),
        change: round(data.d, 2),
        changePercent: round(data.dp, 2),
        changePercentFormatted: formatPercent(data.dp),
        high: round(data.h, 2),
        low: round(data.l, 2),
        open: round(data.o, 2),
        previousClose: round(data.pc, 2),
        timestamp: new Date(data.t * 1000).toISOString(),
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[quoteTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch quote: ${err.message}`,
    };
  }
}

export default quoteTool;
