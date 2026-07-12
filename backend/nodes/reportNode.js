/**
 * nodes/reportNode.js
 *
 * LangGraph Node: Report Node
 * Synthesizes data and generates the structured financial report on the happy path.
 */

import { generateJsonContent } from "../config/llm.js";
import { buildReportPrompt, REPORT_SYSTEM_PROMPT } from "../prompts/reportPrompt.js";
import { round } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export async function reportNode(state, config) {
  const emit = config?.configurable?.emit ?? (() => {});
  const startedAt = Date.now();

  emit({ type: "step", step: "Analyzing data and generating report..." });
  logger.info("[reportNode] Synthesizing data and building structured report");

  const toolResults = state.toolResults ?? {};
  
  const cleanedResults = Object.entries(toolResults).reduce(
    (acc, [key, val]) => {
      if (val?.success && val?.data) acc[key] = val.data;
      else if (val?.success) acc[key] = val;
      return acc;
    },
    {}
  );

  try {
    const prompt = buildReportPrompt(state.query, state.intent, cleanedResults);
    const report = await generateJsonContent(REPORT_SYSTEM_PROMPT, prompt, true);

    const executionTime = round((Date.now() - state.startTime) / 1000, 2);

    if (!report) {
      throw new Error("Failed to parse LLM response into a valid JSON report.");
    }

    const finalReport = {
      ...report,
      executionTime,
      rawReasoning: report.sections?.[0]?.content ?? report.summary,
    };

    logger.info(`[reportNode] Report complete in ${executionTime}s`);
    emit({ type: "complete", executionTime });

    return {
      report: finalReport,
      executionLog: [
        {
          node: "reportNode",
          status: "success",
          executionTime,
          duration: Date.now() - startedAt,
        },
      ],
    };
  } catch (err) {
    logger.error(`[reportNode] Error: ${err.message}`);
    const executionTime = round((Date.now() - state.startTime) / 1000, 2);

    const errorReport = {
      title: `Financial Analysis: ${state.query}`,
      summary: "Report generation encountered an error.",
      companies: state.intent?.companies ?? [],
      sections: [
        {
          id: "analysis",
          title: "Analysis",
          content: `An error occurred during analysis synthesis. Raw data has been collected. Error details: ${err.message}`,
          type: "text",
        },
      ],
      investmentScore: null,
      recommendation: "N/A",
      confidence: "Low",
      keyPositives: [],
      keyNegatives: [],
      followUpQuestions: [],
      outputFormat: "markdown",
      executionTime,
      generatedAt: new Date().toISOString(),
    };

    emit({ type: "complete", executionTime });

    return {
      report: errorReport,
      errors: [{ node: "reportNode", error: err.message }],
      executionLog: [
        {
          node: "reportNode",
          status: "error",
          error: err.message,
          duration: Date.now() - startedAt,
        },
      ],
    };
  }
}
