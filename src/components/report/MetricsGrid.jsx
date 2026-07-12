// components/report/MetricsGrid.jsx
// Light theme metrics grid.

import { motion } from "framer-motion";
import { Heart, DollarSign, TrendingUp, PieChart, Shield } from "lucide-react";

const METRIC_GROUPS = [
  { key: "financialHealth",  label: "Financial Health",  icon: Heart,       color: "#16A34A", bg: "#DCFCE7" },
  { key: "valuation",        label: "Valuation",         icon: DollarSign,  color: "#111827", bg: "#F3F4F6" },
  { key: "growth",           label: "Growth",            icon: TrendingUp,  color: "#374151", bg: "#E5E7EB" },
  { key: "profitability",    label: "Profitability",     icon: PieChart,    color: "#D97706", bg: "#FEF3C7" },
  { key: "risk",             label: "Risk",              icon: Shield,      color: "#DC2626", bg: "#FEE2E2" },
];

function MetricItem({ label, value }) {
  if (value === null || value === undefined || value === "N/A" || value === "") return null;
  const numVal = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  const isNum = !isNaN(numVal);
  const cls = isNum
    ? numVal > 0 ? "num-up" : numVal < 0 ? "num-down" : "num-flat"
    : "text-gray-900";

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-[12px] text-gray-600 font-medium">{label}</span>
      <span className={`text-[12px] font-mono font-bold ${cls}`}>{value}</span>
    </div>
  );
}

function MetricCard({ group, data, index }) {
  const Icon = group.icon;
  const entries = data ? Object.entries(data) : [];
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.06 * index }}
      className="card p-4"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border"
          style={{ background: group.bg, borderColor: `${group.color}20` }}
        >
          <Icon size={14} style={{ color: group.color }} strokeWidth={2.5} />
        </div>
        <span className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">
          {group.label}
        </span>
      </div>
      <div>
        {entries.slice(0, 8).map(([k, v]) => (
          <MetricItem
            key={k}
            label={k.replace(/([A-Z])/g, " $1").trim()}
            value={v}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function MetricsGrid({ report }) {
  const groups = METRIC_GROUPS.filter(g => report?.[g.key] && Object.keys(report[g.key]).length > 0);
  if (groups.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-3 ml-1">
        Financial Metrics
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <MetricCard key={g.key} group={g} data={report[g.key]} index={i} />
        ))}
      </div>
    </div>
  );
}
