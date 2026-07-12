// components/ui/ExportControls.jsx
// Light theme export buttons.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Printer } from "lucide-react";
import { exportPDF, copyToClipboard } from "../../utils/exportUtils.js";

export default function ExportControls({ report, reasoning }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(reasoning ?? report?.rawReasoning ?? report?.summary ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!report && !reasoning) return null;

  const btnCls = "flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100"
    >
      <button onClick={handleCopy} className={btnCls} title="Copy to clipboard">
        <AnimatePresence mode="wait">
          {copied
            ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={13} className="text-success" /></motion.span>
            : <motion.span key="copy"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={13} /></motion.span>
          }
        </AnimatePresence>
        {copied ? "Copied" : "Copy"}
      </button>

      {report && (
        <>
          <button onClick={() => exportPDF(report)} className={btnCls} title="Print / PDF">
            <Printer size={13} /> PDF
          </button>
        </>
      )}
    </motion.div>
  );
}
