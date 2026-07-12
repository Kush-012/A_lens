/**
 * controllers/marketController.js
 *
 * Exposes endpoints for the frontend (Landing Page, Company Page, Extended Dashboard)
 */

import { searchCompanyTool } from "../tools/searchCompanyTool.js";
import { profileTool } from "../tools/profileTool.js";
import axios from "axios";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

/** Returns true when the error is a network/connectivity failure */
function isNetworkError(err) {
  const networkCodes = ["ENOTFOUND", "ECONNREFUSED", "EAI_AGAIN", "ECONNRESET"];
  return !!err.code && networkCodes.includes(err.code);
}


// 1. Autocomplete Search
export const searchCompany = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ success: true, candidates: [] });

    const result = await searchCompanyTool(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// 2. Company Overview
export const getCompanyOverview = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const apiKey = config.finnhub.apiKey;

    // Fetch profile, quote, and CEO in parallel
    const [profileData, quoteRes, execRes] = await Promise.allSettled([
      profileTool(symbol),
      axios.get(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`),
      axios.get(`${FINNHUB_BASE}/stock/executive?symbol=${symbol}&token=${apiKey}`),
    ]);

    let profile = profileData.value;
    if (!profile?.success) {
      // Fallback for international/restricted symbols so user can still access the AI chat
      profile = {
        success: true,
        data: {
          name: symbol,
          ticker: symbol,
          exchange: "International/Restricted",
          description: "Profile data is restricted for this international symbol on the free data tier. However, you can still click 'Ask AI' above to generate a comprehensive analysis!",
        }
      };
    }

    // Extract CEO from executives list
    let ceo = null;
    if (execRes.status === "fulfilled" && execRes.value?.data?.executive) {
      const executives = execRes.value.data.executive;
      const ceoEntry = executives.find(
        (e) => e.title && (e.title.toLowerCase().includes("chief executive") || e.title.toLowerCase() === "ceo")
      );
      ceo = ceoEntry ? ceoEntry.name : (executives[0]?.name ?? null);
    }

    const quoteData = quoteRes.status === "fulfilled" ? quoteRes.value?.data : null;

    res.json({
      profile: { ...profile.data, ceo },
      quote: quoteData ? {
        price: quoteData.c,
        change: quoteData.d,
        percentChange: quoteData.dp,
        high: quoteData.h,
        low: quoteData.l,
        open: quoteData.o,
        prevClose: quoteData.pc
      } : null
    });

  } catch (err) {
    if (isNetworkError(err)) {
      return res.status(503).json({
        error: "Market data service is temporarily unavailable. Please check your internet connection and try again.",
        code: "SERVICE_UNAVAILABLE"
      });
    }
    if (err.message && err.message.includes("timeout")) {
      return res.status(503).json({
        error: "Request timed out while fetching market data. Please try again in a moment.",
        code: "TIMEOUT"
      });
    }
    next(err);
  }
};

// 3. Extended Dashboard Data
export const getExtendedDashboard = async (req, res, next) => {
  try {
    const apiKey = config.finnhub.apiKey;

    // Mock Indices (SPY, QQQ, DIA fetched; Nifty, Sensex mocked)
    const indexSymbols = ["SPY", "QQQ", "DIA"];
    const indexPromises = indexSymbols.map(async (sym) => {
      try {
        const qRes = await axios.get(`${FINNHUB_BASE}/quote?symbol=${sym}&token=${apiKey}`);
        return { symbol: sym, price: qRes.data.c, percentChange: qRes.data.dp };
      } catch (e) {
        return { symbol: sym, price: 0, percentChange: 0 };
      }
    });

    const indexResults = await Promise.all(indexPromises);
    
    // Mocks for Indian markets and Fear/Greed
    const mockNifty = { symbol: "NIFTY 50", price: 24350.50 + (Math.random() * 100 - 50), percentChange: (Math.random() * 2 - 1) };
    const mockSensex = { symbol: "SENSEX", price: 80100.20 + (Math.random() * 200 - 100), percentChange: (Math.random() * 2 - 1) };
    
    const marketOverview = [...indexResults, mockNifty, mockSensex];
    
    const fearGreed = Math.floor(Math.random() * 20) + 60; // Random value between 60-80 (Greed)

    // Earnings Calendar (Finnhub)
    let earnings = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const eRes = await axios.get(`${FINNHUB_BASE}/calendar/earnings?from=${today}&to=${nextWeek}&token=${apiKey}`);
      if (eRes.data && eRes.data.earningsCalendar) {
        // Filter out empty symbols and get top 5
        earnings = eRes.data.earningsCalendar.filter(e => e.symbol).slice(0, 5);
      }
    } catch (e) {
      logger.warn("Failed to fetch earnings calendar");
    }

    res.json({
      marketOverview,
      fearGreed,
      earnings,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
};
