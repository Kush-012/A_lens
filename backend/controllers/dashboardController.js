/**
 * controllers/dashboardController.js
 *
 * Handles fetching live data from Finnhub for the dashboard:
 * - Insight of the day (latest general news)
 * - Top movers (Trending, Growing, Declining)
 */

import axios from "axios";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

// Hardcoded list of major stocks to track for movers
const WATCH_SYMBOLS = [
  "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", 
  "META", "GOOGL", "NFLX", "AMD", "INTC", 
  "JPM", "V", "WMT", "JNJ", "DIS"
];

export const getDashboardData = async (req, res, next) => {
  try {
    const apiKey = config.finnhub.apiKey;
    
    // 1. Fetch Insight of the Day (Latest General News)
    let insight = null;
    try {
      const newsRes = await axios.get(`${FINNHUB_BASE}/news?category=general&token=${apiKey}`);
      if (newsRes.data && newsRes.data.length > 0) {
        // Pick the most recent relevant news
        const topNews = newsRes.data[0];
        insight = {
          headline: topNews.headline,
          summary: topNews.summary || "No detailed summary available.",
          url: topNews.url,
          source: topNews.source,
          time: new Date(topNews.datetime * 1000).toISOString()
        };
      }
    } catch (err) {
      logger.warn("Failed to fetch Finnhub news for dashboard", { error: err.message });
    }

    // 2. Fetch Quotes for all watch symbols to calculate movers
    const quotePromises = WATCH_SYMBOLS.map(async (sym) => {
      try {
        const qRes = await axios.get(`${FINNHUB_BASE}/quote?symbol=${sym}&token=${apiKey}`);
        const data = qRes.data;
        return {
          symbol: sym,
          price: data.c,
          change: data.d,
          percentChange: data.dp
        };
      } catch (err) {
        return null; // Ignore failed quotes
      }
    });

    const quotesRaw = await Promise.all(quotePromises);
    const quotes = quotesRaw.filter(q => q !== null && q.price > 0 && q.percentChange !== undefined);

    // Sort by percent change descending
    const sorted = [...quotes].sort((a, b) => b.percentChange - a.percentChange);
    
    // Growing: Top 4 positive changes
    const growing = sorted.filter(q => q.percentChange > 0).slice(0, 4);
    
    // Declining: Top 4 negative changes (lowest percentChange)
    const declining = sorted.filter(q => q.percentChange < 0).slice(-4).reverse();
    
    // Trending: Top 4 by absolute percent change (highest volatility)
    const trending = [...quotes].sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)).slice(0, 4);

    res.json({
      insight,
      growing,
      declining,
      trending,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Dashboard data fetch failed", { error: error.message });
    next(error);
  }
};
