// pages/ChatPage.jsx
// Root layout — light theme, 70/30 split with spring-animated side panel.

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar.jsx";
import MessageList from "../components/chat/MessageList.jsx";
import InputBox from "../components/chat/InputBox.jsx";
import AgentPanel from "../components/execution/AgentPanel.jsx";
import { useChat } from "../context/ChatContext.jsx";

export default function ChatPage() {
  const { sendMessage } = useChat();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#f6d8d8ff" }}>
      <Navbar onTogglePanel={() => {}} panelOpen={false} />

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className="flex flex-col flex-1 min-w-0 overflow-hidden"
          layout
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          <MessageList onFollowUp={sendMessage} />
          <InputBox />
        </motion.div>
      </div>
    </div>
  );
}
