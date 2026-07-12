// components/chat/ChatMessage.jsx
// Light theme chat bubble and report card rendering.

import { memo } from "react";
import { motion } from "framer-motion";
import { LogoIcon } from "../layout/Logo.jsx";
import ReportView from "../report/ReportView.jsx";
import { formatTimestamp } from "../../utils/formatters.js";

function UserMessage({ message }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-end mb-6 px-2"
    >
      <div className="max-w-[72%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-br-md text-[14px] text-gray-900 leading-relaxed shadow-sm"
          style={{
            background: "#F3F4F6", // Light gray bubble
            border: "1px solid #E5E7EB",
          }}
        >
          {message.content}
        </div>
        <p className="text-right text-[10px] text-gray-500 mt-1.5 pr-1 font-medium">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

function AiMessage({ message, onFollowUp }) {
  const isError = message.content?.startsWith("⚠️");
  
  // Clean up ugly JSON payloads from Google API errors (they start with {"@type" or [{"@type")
  // The full raw error is visible in the Developer Trace panel, so we keep the chat UI clean.
  const cleanError = isError 
    ? message.content.replace(/\s*\[?\{"@type"[\s\S]*/, '')
    : message.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, x: -16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-start mb-6 px-2"
    >
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-bold text-gray-900 tracking-tight">
            Alpha Lens
          </span>
          <span className="text-[10px] text-gray-500 font-mono ml-1">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {isError ? (
          <div className="card p-4 border-error/30" style={{ borderLeft: "4px solid #EF4444" }}>
            <p className="text-sm text-error font-medium leading-relaxed">{cleanError}</p>
          </div>
        ) : (
          <ReportView message={message} onFollowUp={onFollowUp} />
        )}
      </div>
    </motion.div>
  );
}

function ChatMessage({ message, onFollowUp }) {
  if (message.role === "user") return <UserMessage message={message} />;
  return <AiMessage message={message} onFollowUp={onFollowUp} />;
}

export default memo(ChatMessage);
