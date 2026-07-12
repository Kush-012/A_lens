// components/report/CompanyCard.jsx
// Light theme hero card.

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Building2 } from "lucide-react";

function ScoreRing({ score }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const color = pct >= 65 ? "#16A34A" : pct >= 45 ? "#D97706" : "#DC2626";
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg viewBox="0 0 56 56" className="w-16 h-16 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#F3F4F6" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-bold" style={{ color }}>{pct}</span>
        <span className="text-[9px] text-gray-500 font-medium leading-none">/ 100</span>
      </div>
    </div>
  );
}

function RecBadge({ rec }) {
  if (!rec || rec === "N/A") return null;
  const lower = rec.toLowerCase();
  const isBuy  = lower.includes("buy");
  const isSell = lower.includes("sell");
  const Icon   = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;
  const cls    = isBuy
    ? "badge-success"
    : isSell ? "badge-error" : "badge-warning";

  return (
    <span className={`badge ${cls} gap-1.5 text-[11px] px-3 py-1 shadow-sm`}>
      <Icon size={12} strokeWidth={2.5} />
      {rec}
    </span>
  );
}

export default function CompanyCard({ report }) {
  const companies = report?.companies ?? (report?.company ? [report.company] : []);
  const title = report?.title ?? "Financial Analysis";
  const score = report?.investmentScore;
  const rec   = report?.recommendation;
  const conf  = report?.confidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-5 mb-4"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <Building2 size={22} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-[17px] font-bold text-gray-900 leading-tight truncate">
            {title}
          </h3>
          {companies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {companies.map((c, i) => (
                <span key={i} className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {typeof c === "string" ? c : c.symbol ?? c.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {score != null && <ScoreRing score={score} />}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-gray-100">
        <RecBadge rec={rec} />
        {conf && conf !== "Low" && (
          <span className="badge badge-primary text-[10px] shadow-sm">{conf} confidence</span>
        )}
        {report?.generatedAt && (
          <span className="ml-auto text-[11px] text-gray-500 font-mono font-medium">
            {new Date(report.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
