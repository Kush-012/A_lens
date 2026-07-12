// components/report/SummaryCard.jsx
// Light theme executive summary.

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="card p-5 mb-4 flex gap-3.5"
      style={{ borderLeft: "4px solid #111827" }}
    >
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FileText size={16} className="text-primary" />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-primary mb-1.5">
          Executive Summary
        </p>
        <p className="text-[14.5px] text-gray-900 leading-relaxed font-medium">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}
