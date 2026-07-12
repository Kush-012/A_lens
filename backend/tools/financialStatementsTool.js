/**
 * tools/financialStatementsTool.js
 *
 * Fetches reported financial statements (income, balance sheet, cash flow).
 * Uses Finnhub's /financials/reported endpoint which returns actual filed data.
 */

import { finnhubGet, isFinnhubEmpty } from "../services/finnhubService.js";
import { formatCompact, round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * @param {string} symbol  - Ticker symbol
 * @param {string} [freq]  - "annual" or "quarterly" (default: "annual")
 * @returns {Promise<object>}
 */
export async function financialStatementsTool(symbol, freq = "annual") {
  logger.info(
    `[financialStatementsTool] Fetching ${freq} statements for ${symbol}`
  );

  try {
    const data = await finnhubGet("/financials/reported", {
      symbol,
      freq: freq === "quarterly" ? "quarterly" : "annual",
    });

    if (isFinnhubEmpty(data) || !data.data || data.data.length === 0) {
      return {
        success: false,
        symbol,
        data: null,
        error: `No financial statements available for "${symbol}".`,
      };
    }

    // Take the 4 most recent periods
    const periods = data.data.slice(0, 4).map((period) => {
      const ic = period.report?.ic ?? []; // Income statement
      const bs = period.report?.bs ?? []; // Balance sheet
      const cf = period.report?.cf ?? []; // Cash flow

      const findValue = (arr, concept) => {
        const item = arr.find(
          (i) =>
            i.concept === concept ||
            i.label?.toLowerCase().includes(concept.toLowerCase())
        );
        return item ? round(item.value, 2) : null;
      };

      // Income statement key items
      const revenue =
        findValue(ic, "Revenues") ??
        findValue(ic, "RevenueFromContractWithCustomerExcludingAssessedTax");
      const grossProfit = findValue(ic, "GrossProfit");
      const operatingIncome = findValue(ic, "OperatingIncomeLoss");
      const netIncome = findValue(ic, "NetIncomeLoss");
      const eps = findValue(ic, "EarningsPerShareBasic");
      const epsDiluted = findValue(ic, "EarningsPerShareDiluted");
      const ebitda =
        operatingIncome && findValue(cf, "DepreciationDepletionAndAmortization")
          ? round(
              operatingIncome +
                findValue(cf, "DepreciationDepletionAndAmortization"),
              2
            )
          : null;

      // Balance sheet key items
      const totalAssets = findValue(bs, "Assets");
      const totalLiabilities = findValue(bs, "Liabilities");
      const totalEquity = findValue(bs, "StockholdersEquity");
      const cash = findValue(bs, "CashAndCashEquivalentsAtCarryingValue");
      const totalDebt =
        (findValue(bs, "LongTermDebt") ?? 0) +
        (findValue(bs, "ShortTermBorrowings") ?? 0);

      // Cash flow key items
      const operatingCashFlow = findValue(
        cf,
        "NetCashProvidedByUsedInOperatingActivities"
      );
      const capex = findValue(
        cf,
        "PaymentsToAcquirePropertyPlantAndEquipment"
      );
      const freeCashFlow =
        operatingCashFlow && capex
          ? round(operatingCashFlow - Math.abs(capex), 2)
          : null;

      return {
        period: period.period,
        year: period.year,
        quarter: period.quarter,
        form: period.form,
        income_statement: {
          revenue: revenue,
          revenueFormatted: formatCompact(revenue),
          grossProfit: grossProfit,
          grossProfitFormatted: formatCompact(grossProfit),
          operatingIncome: operatingIncome,
          operatingIncomeFormatted: formatCompact(operatingIncome),
          ebitda: ebitda,
          ebitdaFormatted: formatCompact(ebitda),
          netIncome: netIncome,
          netIncomeFormatted: formatCompact(netIncome),
          epsBasic: eps,
          epsDiluted: epsDiluted,
        },
        balance_sheet: {
          totalAssets: totalAssets,
          totalAssetsFormatted: formatCompact(totalAssets),
          totalLiabilities: totalLiabilities,
          totalLiabilitiesFormatted: formatCompact(totalLiabilities),
          totalEquity: totalEquity,
          totalEquityFormatted: formatCompact(totalEquity),
          cash: cash,
          cashFormatted: formatCompact(cash),
          totalDebt: round(totalDebt, 2),
          totalDebtFormatted: formatCompact(totalDebt),
        },
        cash_flow: {
          operatingCashFlow: operatingCashFlow,
          operatingCashFlowFormatted: formatCompact(operatingCashFlow),
          capex: capex,
          capexFormatted: formatCompact(capex),
          freeCashFlow: freeCashFlow,
          freeCashFlowFormatted: formatCompact(freeCashFlow),
        },
      };
    });

    return {
      success: true,
      symbol,
      frequency: freq,
      data: periods,
      error: null,
    };
  } catch (err) {
    logger.error(
      `[financialStatementsTool] Error for ${symbol}: ${err.message}`
    );
    return {
      success: false,
      symbol,
      data: null,
      error: `Failed to fetch financial statements: ${err.message}`,
    };
  }
}

export default financialStatementsTool;
