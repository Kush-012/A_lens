/**
 * tools/insiderTool.js
 *
 * Fetches insider transaction data (executive/director buy/sell activity).
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { round, formatCompact } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol  - Ticker symbol
 * @param {number} [limit] - Max transactions to return (default: 20)
 * @returns {Promise<object>}
 */
export async function insiderTool(symbol, limit = 20) {
  logger.info(`[insiderTool] Fetching insider transactions for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/insider-transactions", { symbol });

    if (
      isFinnhubEmpty(data) ||
      !data.data ||
      !Array.isArray(data.data) ||
      data.data.length === 0
    ) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No insider transaction data available for "${symbol}".`,
      };
    }

    const transactions = data.data.slice(0, limit).map((tx) => ({
      name: tx.name,
      share: tx.share,
      shareFormatted: formatCompact(tx.share),
      change: tx.change,
      changeFormatted: formatCompact(tx.change),
      filingDate: tx.filingDate,
      transactionDate: tx.transactionDate,
      transactionPrice: round(tx.transactionPrice, 2),
      transactionValue: formatCompact(
        tx.transactionPrice * Math.abs(tx.change)
      ),
      action: tx.change > 0 ? "Buy" : "Sell",
    }));

    const buys = transactions.filter((t) => t.action === "Buy");
    const sells = transactions.filter((t) => t.action === "Sell");

    return {
      success: true,
      symbol,
      data: {
        transactions,
        summary: {
          totalTransactions: transactions.length,
          buys: buys.length,
          sells: sells.length,
          insiderSentiment: buys.length > sells.length ? "Bullish" : "Bearish",
        },
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[insiderTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch insider transactions: ${err.message}`,
    };
  }
}

export default insiderTool;
