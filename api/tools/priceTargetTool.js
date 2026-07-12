/**
 * tools/priceTargetTool.js
 *
 * Fetches analyst consensus price target (high, low, mean).
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol
 * @returns {Promise<object>}
 */
export async function priceTargetTool(symbol) {
  logger.info(`[priceTargetTool] Fetching price target for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/price-target", { symbol });

    if (isFinnhubEmpty(data) || !data.targetMean) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No price target data available for "${symbol}".`,
      };
    }

    return {
      success: true,
      symbol,
      data: {
        targetHigh: round(data.targetHigh, 2),
        targetLow: round(data.targetLow, 2),
        targetMean: round(data.targetMean, 2),
        targetMedian: round(data.targetMedian, 2),
        numberOfAnalysts: data.numberOfAnalysts,
        lastUpdated: data.lastUpdated,
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[priceTargetTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch price target: ${err.message}`,
    };
  }
}

export default priceTargetTool;
