// components/ui/FollowUpSuggestions.jsx
// Light theme pill buttons.

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function FollowUpSuggestions({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex flex-wrap items-center gap-2 mt-2"
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(s)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-[12px] text-gray-600 hover:text-primary hover:border-gray-200 hover:bg-gray-50 rounded-full transition-all shadow-sm"
        >
          <MessageCircle size={12} className="opacity-70" />
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
}
