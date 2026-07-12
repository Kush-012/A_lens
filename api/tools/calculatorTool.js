/**
 * tools/calculatorTool.js
 *
 * Arithmetic engine for financial computations.
 *
 * Why a dedicated calculator tool?
 * Groq should NEVER invent financial numbers. When the user asks
 * "Tesla PE minus Nvidia PE", the agent fetches both PE ratios from
 * financialMetricsTool and passes them to this calculator. The result
 * is deterministic and auditable — no LLM math involved.
 *
 * Supports: add, subtract, multiply, divide, percentage, average,
 *           median, max, min, difference, growthRate, cagr, ratio,
 *           portfolioAllocation
 */

import { round, percentChange, cagr as cagrFn } from "../utils/helpers.js";
import logger from "../utils/logger.js";

/**
 * Performs an arithmetic operation on one or more numeric values.
 *
 * @param {string} operation - Operation name (see OPERATIONS below)
 * @param {number[]} values  - Input values
 * @param {object} [options] - Additional parameters (e.g., years for CAGR)
 * @returns {object}
 */
export function calculatorTool(operation, values = [], options = {}) {
  logger.info(
    `[calculatorTool] op=${operation} values=${JSON.stringify(values)}`
  );

  const nums = values.map(Number).filter((n) => !isNaN(n));

  if (nums.length === 0) {
    return {
      success: false,
      operation,
      result: null,
      explanation: null,
      error: "No valid numeric values provided.",
    };
  }

  try {
    let result;
    let explanation;

    switch (operation.toLowerCase()) {
      case "add":
      case "addition":
      case "sum":
        result = round(nums.reduce((a, b) => a + b, 0), 4);
        explanation = `${nums.join(" + ")} = ${result}`;
        break;

      case "subtract":
      case "subtraction":
      case "difference":
        result = round(nums.reduce((a, b) => a - b), 4);
        explanation = `${nums.join(" - ")} = ${result}`;
        break;

      case "multiply":
      case "multiplication":
      case "product":
        result = round(nums.reduce((a, b) => a * b, 1), 4);
        explanation = `${nums.join(" × ")} = ${result}`;
        break;

      case "divide":
      case "division":
      case "ratio": {
        if (nums.length < 2 || nums[1] === 0) {
          return {
            success: false,
            operation,
            result: null,
            explanation: null,
            error: "Division requires two values and a non-zero divisor.",
          };
        }
        result = round(nums[0] / nums[1], 4);
        explanation = `${nums[0]} ÷ ${nums[1]} = ${result}`;
        break;
      }

      case "percent":
      case "percentage": {
        if (nums.length < 2) {
          return {
            success: false,
            operation,
            result: null,
            explanation: null,
            error: "Percentage requires two values: part and total.",
          };
        }
        result = round((nums[0] / nums[1]) * 100, 2);
        explanation = `(${nums[0]} / ${nums[1]}) × 100 = ${result}%`;
        break;
      }

      case "average":
      case "mean":
        result = round(nums.reduce((a, b) => a + b, 0) / nums.length, 4);
        explanation = `Average of [${nums.join(", ")}] = ${result}`;
        break;

      case "median": {
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        result =
          sorted.length % 2 === 0
            ? round((sorted[mid - 1] + sorted[mid]) / 2, 4)
            : round(sorted[mid], 4);
        explanation = `Median of [${nums.join(", ")}] = ${result}`;
        break;
      }

      case "max":
      case "maximum":
        result = Math.max(...nums);
        explanation = `Maximum of [${nums.join(", ")}] = ${result}`;
        break;

      case "min":
      case "minimum":
        result = Math.min(...nums);
        explanation = `Minimum of [${nums.join(", ")}] = ${result}`;
        break;

      case "percentchange":
      case "percent_change":
      case "growth_rate":
      case "growthrate": {
        if (nums.length < 2) {
          return {
            success: false,
            operation,
            result: null,
            explanation: null,
            error: "Percent change requires from and to values.",
          };
        }
        result = percentChange(nums[0], nums[1]);
        explanation = `((${nums[1]} - ${nums[0]}) / |${nums[0]}|) × 100 = ${result}%`;
        break;
      }

      case "cagr": {
        const years = options.years ?? nums[2];
        if (nums.length < 2 || !years) {
          return {
            success: false,
            operation,
            result: null,
            explanation: null,
            error: "CAGR requires start, end, and years values.",
          };
        }
        result = cagrFn(nums[0], nums[1], years);
        explanation = `CAGR from ${nums[0]} to ${nums[1]} over ${years} years = ${result}%`;
        break;
      }

      case "portfolio":
      case "portfolioallocation": {
        const total = nums.reduce((a, b) => a + b, 0);
        const allocations = nums.map((v) => round((v / total) * 100, 2));
        result = allocations;
        explanation =
          `Total investment: ${total}\n` +
          nums
            .map((v, i) => `  Asset ${i + 1}: ${v} (${allocations[i]}%)`)
            .join("\n");
        break;
      }

      default:
        return {
          success: false,
          operation,
          result: null,
          explanation: null,
          error: `Unknown operation: "${operation}". Supported: add, subtract, multiply, divide, percentage, average, median, max, min, growthRate, cagr, portfolioAllocation.`,
        };
    }

    return {
      success: true,
      operation,
      values: nums,
      result,
      explanation,
      error: null,
    };
  } catch (err) {
    logger.error(`[calculatorTool] Error: ${err.message}`);
    return {
      success: false,
      operation,
      result: null,
      explanation: null,
      error: `Calculation failed: ${err.message}`,
    };
  }
}

export default calculatorTool;
