/**
 * tools/profileTool.js
 *
 * Fetches the company profile: business description, sector, industry,
 * country, market cap, employee count, and logo.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { formatCompact } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol - Ticker symbol (e.g., "AAPL")
 * @returns {Promise<object>}
 */
export async function profileTool(symbol) {
  logger.info(`[profileTool] Fetching profile for ${symbol}`);

  try {
    const data = await finnhubGet("/stock/profile2", { symbol });

    if (isFinnhubEmpty(data) || !data.name) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No profile data available for "${symbol}".`,
      };
    }

    return {
      success: true,
      symbol,
      data: {
        name: data.name,
        ticker: data.ticker,
        exchange: data.exchange,
        country: data.country,
        currency: data.currency,
        sector: data.finnhubIndustry,
        industry: data.finnhubIndustry,
        marketCapRaw: data.marketCapitalization * 1e6, // Finnhub returns in millions
        marketCap: formatCompact(data.marketCapitalization * 1e6),
        employees: data.employeeTotal
          ? Number(data.employeeTotal).toLocaleString()
          : "N/A",
        ipo: data.ipo,
        logo: data.logo,
        webUrl: data.weburl,
        phone: data.phone,
        description: `${data.name} (${data.ticker}) is listed on the ${data.exchange} exchange. It operates in the ${data.finnhubIndustry} sector.`,
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[profileTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch profile: ${err.message}`,
    };
  }
}

export default profileTool;
