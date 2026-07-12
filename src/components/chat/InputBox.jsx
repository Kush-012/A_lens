// components/chat/InputBox.jsx
// Floating input bar — light theme, white surface, subtle shadow.

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Square, Paperclip, Mic, ArrowUp } from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";

export default function InputBox() {
  const { sendMessage, isLoading, cancelQuery } = useChat();
  const [value, setValue]       = useState("");
  const [focused, setFocused]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const [showInvestForm, setShowInvestForm] = useState(false);
  const [investCompany, setInvestCompany] = useState("");
  const [investAmount, setInvestAmount] = useState("");

  const submit = () => {
    const q = value.trim();
    if (!q || isLoading) return;
    sendMessage(q);
    setValue("");
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <div className="flex-shrink-0 px-4 pb-5 pt-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 mb-2 justify-end">
          {showInvestForm ? (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm transition-all">
              <input
                type="text"
                placeholder="Company Name (e.g. Apple)"
                value={investCompany}
                onChange={e => setInvestCompany(e.target.value)}
                className="text-sm outline-none border-b border-gray-200 focus:border-red-500 w-36 px-1 text-gray-700 bg-transparent"
              />
              <span className="text-gray-400 font-medium">$</span>
              <input
                type="number"
                placeholder="Amount"
                value={investAmount}
                onChange={e => setInvestAmount(e.target.value)}
                className="text-sm outline-none border-b border-gray-200 focus:border-red-500 w-24 px-1 text-gray-700 bg-transparent"
              />
              <button
                onClick={() => {
                  if(investCompany && investAmount) {
                     sendMessage(`should I invest $${investAmount} in ${investCompany}?`);
                     setShowInvestForm(false);
                     setInvestCompany("");
                     setInvestAmount("");
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors ml-1 shadow-sm"
              >
                Send
              </button>
              <button
                onClick={() => setShowInvestForm(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInvestForm(true)}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-100 shadow-sm"
              title="Ask if you should invest"
            >
              Should I Invest?
            </button>
          )}
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-4 transition-all duration-200 bg-white"
          style={{
            minHeight: "60px",
            border: focused
              ? "1px solid rgba(239,68,68,0.3)"
              : "1px solid #F3F4F6",
            boxShadow: focused
              ? "0 0 0 3px rgba(239,68,68,0.08), 0 4px 20px rgba(0,0,0,0.04)"
              : "0 2px 10px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.01)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask, What you want to know?"
            disabled={isLoading}
            style={{ outline: "none", boxShadow: "none", border: "none", background: "transparent", color: "black" }}
            className="flex-1 text-[15px] placeholder:text-gray-400 disabled:opacity-50 py-4 font-medium"
            aria-label="Ask a financial question"
          />

          {value.length > 100 && (
            <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
              {value.length}
            </span>
          )}

          <button
            className="p-1.5 text-gray-400 hover:text-black transition-colors flex-shrink-0 rounded-lg hover:bg-gray-100"
            title="Voice input"
            tabIndex={-1}
          >
            <Mic size={24} strokeWidth={2} />
          </button>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.button
                key="cancel"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={cancelQuery}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-red-600 transition-all"
                style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}
                title="Cancel"
              >
                <Square size={14} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={value.trim() ? { scale: 1.05 } : {}}
                whileTap={value.trim() ? { scale: 0.95 } : {}}
                onClick={submit}
                disabled={!value.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-red-500 hover:bg-red-600 text-white disabled:opacity-40"
                title="Send (Enter)"
              >
                <ArrowUp size={24} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-2.5 font-medium">
          Alpha Lens can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
