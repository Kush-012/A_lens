/**
 * tools/searchCompanyTool.js
 *
 * Resolves a company name or partial symbol to a canonical ticker symbol.
 * This is the FIRST tool called in almost every query — all other tools
 * depend on a verified ticker.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import logger from "../utils/logger.js";

/**
 * Searches for a company by name or symbol.
 *
 * @param {string} query - Company name or ticker (e.g., "Tesla", "TSLA")
 * @returns {Promise<{
 *   success: boolean,
 *   symbol: string|null,
 *   name: string|null,
 *   type: string|null,
 *   candidates: Array,
 *   error: string|null
 * }>}
 */
export async function searchCompanyTool(query) {
  logger.info(`[searchCompanyTool] Searching: "${query}"`);

  try {
    const data = await finnhubGet("/search", { q: query });

    if (isFinnhubEmpty(data) || !data.result || data.result.length === 0) {
      return {
        success: false,
        symbol: null,
        name: null,
        type: null,
        candidates: [],
        error: `No company found matching "${query}". Try the official ticker symbol.`,
      };
    }

    const pool = data.result;

    // Score each result: name match scores higher than symbol match
    const q = query.toLowerCase();
    const scored = pool.map((r) => {
      const nameLower = (r.description || "").toLowerCase();
      const symLower = (r.symbol || "").toLowerCase();
      let score = 0;
      if (nameLower === q) score += 100;                          // exact name
      else if (nameLower.startsWith(q)) score += 80;             // name starts with query
      else if (nameLower.includes(q)) score += 60;               // name contains query
      if (symLower === q) score += 50;                           // exact symbol
      else if (symLower.startsWith(q)) score += 30;              // symbol starts with query
      
      // Slight bump for US stocks to resolve ties
      if (!r.symbol.includes(".")) score += 10;
      
      return { ...r, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    return {
      success: true,
      symbol: best.symbol,
      name: best.description,
      type: best.type,
      candidates: scored.slice(0, 12).map((r) => ({
        symbol: r.symbol,
        name: r.description,
        type: r.type,
      })),
      error: null,
    };
  } catch (err) {
    logger.error(`[searchCompanyTool] Error: ${err.message}`);
    return {
      success: false,
      symbol: null,
      name: null,
      type: null,
      candidates: [],
      error: `Search failed: ${err.message}`,
    };
  }
}

export default searchCompanyTool;
