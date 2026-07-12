/**
 * tools/newsTool.js
 *
 * Fetches recent company news articles from Finnhub.
 * Used for news analysis, "why did the stock move" queries, and SWOT.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { daysAgo, todayUtc, limitArray } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol   - Ticker symbol
 * @param {number} [days]   - How many days back to look (default: 30)
 * @param {number} [limit]  - Max articles to return (default: 15)
 * @returns {Promise<object>}
 */
export async function newsTool(symbol, days = 30, limit = 15) {
  logger.info(`[newsTool] Fetching news for ${symbol} (last ${days} days)`);

  try {
    const from = daysAgo(days);
    const to = todayUtc();

    const data = await finnhubGet(
      "/company-news",
      { symbol, from, to },
      300 // 5-min cache for news
    );

    if (isFinnhubEmpty(data) || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No news found for "${symbol}" in the last ${days} days.`,
      };
    }

    const articles = limitArray(data, limit).map((article) => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary?.slice(0, 500) ?? "",
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: new Date(article.datetime * 1000).toISOString(),
      date: new Date(article.datetime * 1000).toISOString().split("T")[0],
      category: article.category,
      sentiment: article.sentiment ?? null,
    }));

    // Group by date for easy rendering
    const byDate = articles.reduce((acc, article) => {
      const d = article.date;
      if (!acc[d]) acc[d] = [];
      acc[d].push(article);
      return acc;
    }, {});

    return {
      success: true,
      symbol,
      data: {
        articles,
        byDate,
        totalFound: data.length,
        returned: articles.length,
        dateRange: { from, to },
      },
      error: null,
    };
  } catch (err) {
    logger.error(`[newsTool] Error for ${symbol}: ${err.message}`);
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch news: ${err.message}`,
    };
  }
}

export default newsTool;
