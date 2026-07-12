/**
 * utils/formatters.js
 *
 * Pure formatting utilities for the frontend.
 */

/**
 * Maps a tool name to a human-readable label for the execution panel.
 */
const TOOL_LABELS = {
  searchCompany: "Company Search",
  quote: "Stock Quote",
  profile: "Company Profile",
  financialMetrics: "Financial Metrics",
  financialStatements: "Financial Statements",
  earnings: "Earnings Data",
  recommendation: "Analyst Recommendations",
  priceTarget: "Price Targets",
  news: "Company News",
  peers: "Peer Companies",
  esg: "ESG Scores",
  insider: "Insider Transactions",
  calculator: "Calculator",
  comparison: "Comparison",
  trend: "Trend Analysis",
  risk: "Risk Assessment",
  investmentScoring: "Investment Score",
  geminiReasoning: "AI Analysis",
};

export function getToolLabel(toolName) {
  return TOOL_LABELS[toolName] ?? toolName;
}

/**
 * Maps recommendation strings to pill CSS classes.
 */
export function getRecommendationClass(rec) {
  if (!rec) return "bg-amber-900/30 text-amber-400 border-amber-700/30";
  const lower = rec.toLowerCase();
  if (lower.includes("strong buy") || lower.includes("buy"))
    return "bg-green-900/30 text-green-400 border-green-700/30";
  if (lower.includes("sell"))
    return "bg-red-900/30 text-red-400 border-red-700/30";
  return "bg-amber-900/30 text-amber-400 border-amber-700/30";
}

/**
 * Formats a number for display. Adds sign and colour hint.
 */
export function formatChange(value) {
  if (value === null || value === undefined) return { text: "N/A", cls: "" };
  const num = Number(value);
  if (isNaN(num)) return { text: "N/A", cls: "" };
  if (num > 0) return { text: `+${num.toFixed(2)}`, cls: "number-positive" };
  if (num < 0) return { text: num.toFixed(2), cls: "number-negative" };
  return { text: "0.00", cls: "number-neutral" };
}

/**
 * Formats execution time as a human-readable string.
 */
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(1)}s`;
}

/**
 * Returns a timestamp string for message display.
 */
export function formatTimestamp(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date));
}

export default {
  getToolLabel,
  getRecommendationClass,
  formatChange,
  formatDuration,
  formatTimestamp,
};
