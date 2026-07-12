// components/report/ProsConsCard.jsx
// Light theme pros/cons layout.

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Check, X } from "lucide-react";

function Block({ title, items, icon: Icon, isPro }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg border shadow-sm ${
          isPro ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"
        }`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
        <span className="text-[13px] font-bold text-gray-900 tracking-wide">
          {title}
        </span>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 group">
            <span className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors ${
              isPro
                ? "bg-white border-green-200 text-green-500 group-hover:bg-green-50"
                : "bg-white border-red-200 text-red-500 group-hover:bg-red-50"
            }`}>
              {isPro ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
            </span>
            <span className="text-[13.5px] text-gray-600 leading-relaxed font-medium">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProsConsCard({ report }) {
  const pros = report?.pros ?? report?.bullCase ?? [];
  const cons = report?.cons ?? report?.bearCase ?? [];
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="card p-5 mb-4"
    >
      <div className="flex flex-wrap gap-6 md:gap-10">
        <Block title="Bull Case" items={pros} icon={ThumbsUp} isPro={true} />
        <Block title="Bear Case" items={cons} icon={ThumbsDown} isPro={false} />
      </div>
    </motion.div>
  );
}
