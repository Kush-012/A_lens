// components/report/ReportView.jsx
// Main orchestrator for AI reports — light theme.

import { memo } from "react";
import CompanyCard from "./CompanyCard.jsx";
import SummaryCard from "./SummaryCard.jsx";
import MetricsGrid from "./MetricsGrid.jsx";
import ProsConsCard from "./ProsConsCard.jsx";
import NewsCard from "./NewsCard.jsx";
import FinancialCharts from "../charts/FinancialCharts.jsx";
import FollowUpSuggestions from "../ui/FollowUpSuggestions.jsx";
import ExportControls from "../ui/ExportControls.jsx";

// ── Inline formatter: **bold**, *italic*, `code` ───────────────────────────
function InlineText({ text }) {
  const parts = [];
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={`t${last}`}>{text.slice(last, m.index)}</span>);
    if (m[2] !== undefined)
      parts.push(<strong key={`b${m.index}`} className="text-gray-900 font-semibold">{m[2]}</strong>);
    else if (m[3] !== undefined)
      parts.push(<em key={`i${m.index}`} className="text-gray-500">{m[3]}</em>);
    else if (m[4] !== undefined)
      parts.push(
        <code key={`c${m.index}`} className="font-mono text-[0.82em] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">
          {m[4]}
        </code>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={`t${last}`}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

// ── Line-by-line markdown renderer ────────────────────────────────────────
function ProseMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const elements = [];
  let listItems = [];
  let listType = null; // "bullet" | "number"
  let k = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={k++} className="my-3 space-y-2 pl-1">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-gray-700 text-[0.9375rem] leading-relaxed list-none">
            <span className="mt-[0.45rem] w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span><InlineText text={item} /></span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Final Decision special formatting
    const decisionMatch = trimmed.match(/^\*\*Final Decision\*\*:\s*(.+)$/i);
    if (decisionMatch) {
      flushList();
      const decisionText = decisionMatch[1].trim();
      const isInvest = decisionText.toLowerCase().includes("invest");
      const isPass = decisionText.toLowerCase().includes("pass");
      
      let colorClass = "text-gray-900";
      if (isInvest) colorClass = "text-green-600 font-bold text-lg";
      else if (isPass) colorClass = "text-red-600 font-bold text-lg";

      elements.push(
        <p key={k++} className="text-[1.05rem] leading-[1.8] mt-4 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 shadow-sm">
          <strong className="text-gray-900">Final Decision:</strong> 
          <span className={colorClass}>{decisionText}</span>
        </p>
      );
      continue;
    }

    // h3
    if (/^### (.+)/.test(trimmed)) {
      flushList();
      elements.push(
        <h3 key={k++} className="text-[0.975rem] font-semibold text-gray-800 mt-5 mb-1.5">
          <InlineText text={trimmed.slice(4)} />
        </h3>
      );
      continue;
    }
    // h2
    if (/^## (.+)/.test(trimmed)) {
      flushList();
      elements.push(
        <h2 key={k++} className="text-[1.05rem] font-bold text-gray-900 mt-6 mb-2 pb-2 border-b border-gray-200">
          <InlineText text={trimmed.slice(3)} />
        </h2>
      );
      continue;
    }
    // h1
    if (/^# (.+)/.test(trimmed)) {
      flushList();
      elements.push(
        <h1 key={k++} className="text-[1.25rem] font-extrabold text-gray-900 mt-6 mb-3">
          <InlineText text={trimmed.slice(2)} />
        </h1>
      );
      continue;
    }

    // Horizontal rule
    if (/^[-*]{3,}$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={k++} className="border-t border-gray-200 my-4" />);
      continue;
    }

    // Bullet list: *, -, +
    const bulletMatch = trimmed.match(/^[*\-+] (.+)/);
    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      listType = "bullet";
      continue;
    }

    // Numbered list: 1. 2. etc.
    const numMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (numMatch) {
      listItems.push(numMatch[1]);
      listType = "number";
      continue;
    }

    // Blank line
    if (trimmed === "") {
      flushList();
      elements.push(<div key={k++} className="my-1.5" />);
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={k++} className="text-gray-700 text-[0.9375rem] leading-[1.8] my-1.5">
        <InlineText text={trimmed} />
      </p>
    );
  }

  flushList();
  return <div className="prose-ai">{elements}</div>;
}

// ── Main ReportView ────────────────────────────────────────────────────────
function ReportView({ message, onFollowUp }) {
  const report = message.report;
  const content = message.content || "";

  // Structured report: render full component layout
  if (report && (report.summary || (report.sections && report.sections.length > 0))) {
    return (
      <div className="w-full">
        <div className="animate-fade-in flex flex-col gap-4">
          <CompanyCard report={report} />
          <SummaryCard summary={report.summary} />
          <MetricsGrid report={report} />
          <FinancialCharts chartData={report.chartData} />
          <ProsConsCard report={report} />
          <NewsCard news={report.news || report.recentNews} />

          {/* Render each section as a formatted card */}
          {report.sections && report.sections.length > 0 && (
            <div className="space-y-4">
              {report.sections.map((section, idx) => (
                <div key={idx} className="card p-5 shadow-sm">
                  {section.title && (
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2.5">
                      <span className="w-[3px] h-4 bg-red-500 rounded-full shrink-0" />
                      {section.title}
                    </h2>
                  )}
                  <ProseMarkdown text={section.content} />
                </div>
              ))}
            </div>
          )}

          {/* Raw reasoning collapsible */}
          {report.rawReasoning && !report.sections?.length && (
            <div className="card p-5 shadow-sm">
              <ProseMarkdown text={report.rawReasoning} />
            </div>
          )}

          <ExportControls report={report} />
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 pl-1">
            <FollowUpSuggestions suggestions={message.suggestions} onSelect={onFollowUp} />
          </div>
        )}
      </div>
    );
  }

  // Fallback: render raw markdown content string
  return (
    <div className="w-full">
      <div className="card p-5 animate-fade-in shadow-sm">
        <ProseMarkdown text={content} />
        <ExportControls reasoning={content} />
      </div>
      {message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-4 pl-1">
          <FollowUpSuggestions suggestions={message.suggestions} onSelect={onFollowUp} />
        </div>
      )}
    </div>
  );
}

export default memo(ReportView);
