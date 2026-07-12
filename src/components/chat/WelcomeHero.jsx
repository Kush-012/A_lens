// components/chat/WelcomeHero.jsx
// Light theme empty-state hero.

import { motion } from "framer-motion";
import { LogoIcon } from "../layout/Logo.jsx";

const PROMPTS = [
  { icon: "⚖️", text: "Compare Tesla and Nvidia" },
  { icon: "🍎", text: "Is Apple undervalued right now?" },
  { icon: "📊", text: "Show Nvidia's earnings trend" },
  { icon: "📈", text: "Amazon vs Microsoft valuation" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function WelcomeHero({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-10 pt-4 relative overflow-hidden">
      {/* Subtle Red Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-gray-900 mb-3">
          Alpha <span className="text-red-500">Lens</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
          Ask anything about any public company.
          <br />
          Real-time data · Professional analysis · Instant reports.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
      >
        {PROMPTS.map((p) => (
          <motion.button
            key={p.text}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.text)}
            className="card p-4 text-left flex items-center gap-3 cursor-pointer group transition-all duration-200"
          >
            <span className="text-xl flex-shrink-0">{p.icon}</span>
            <span className="text-[13px] font-medium text-gray-700 group-hover:text-red-600 transition-colors leading-snug">
              {p.text}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
