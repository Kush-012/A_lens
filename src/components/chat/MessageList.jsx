// components/chat/MessageList.jsx
// Light theme message list with white/grey shimmer.

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "../../context/ChatContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import WelcomeHero from "./WelcomeHero.jsx";
import { LogoIcon } from "../layout/Logo.jsx";

export default function MessageList({ onFollowUp }) {
  const { messages, isLoading, sendMessage } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <WelcomeHero onSelect={sendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-6">
      <div className="max-w-3xl mx-auto px-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onFollowUp={onFollowUp ?? sendMessage}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-6 px-2"
          >
            <div className="w-full max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-bold text-gray-900 tracking-tight">Alpha Lens</span>
                <motion.span
                  className="text-[11px] text-primary ml-1 font-medium"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Thinking…
                </motion.span>
              </div>
              <div className="card p-5 space-y-3 shadow-sm border-gray-100">
                <div className="h-3.5 w-3/4 shimmer" />
                <div className="h-3.5 w-full shimmer" />
                <div className="h-3.5 w-2/3 shimmer" />
                <div className="h-3.5 w-5/6 shimmer" />
                <div className="h-3.5 w-1/2 shimmer" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
