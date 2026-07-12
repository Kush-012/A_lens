/**
 * tools/peersTool.js
 *
 * Fetches the list of peer/competitor companies for a given ticker.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol
 * @returns {Promise<object>}
 */
export async function peersTool(symbol) {
  logger.info(`[peersTool] Fetching peers for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/peers", { symbol });

    if (isFinnhubEmpty(data) || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No peer data available for "${symbol}".`,
      };
    }

    // Filter out the symbol itself and limit to 8 peers
    const peers = data.filter((s) => s !== symbol).slice(0, 8);

    return {
      success: true,
      symbol,
      data: {
        peers,
        count: peers.length,
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[peersTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch peers: ${err.message}`,
    };
  }
}

export default peersTool;
