// components/layout/Navbar.jsx
// Alpha Lens — Floating pill navbar, white/light theme

import { motion } from "framer-motion";
import { LayoutDashboard, PenSquare, BarChart2, Search, Home } from "lucide-react";
import { LogoWordmark } from "./Logo.jsx";
import { useChat } from "../../context/ChatContext.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ onTogglePanel, panelOpen }) {
  const { clearConversation, messages } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isChat     = location.pathname === "/chat";
  const isSearch   = location.pathname === "/search" || location.pathname.startsWith("/company");
  const isHome     = location.pathname === "/";

  const handleHomeClick = () => {
    if (isDashboard) navigate("/");
    else clearConversation();
  };

  const pill = (active) =>
    `flex items-center gap-2.5 px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-300 select-none whitespace-nowrap ${
      active
        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
    }`;

  return (
    <div className="flex-shrink-0 w-full z-50 px-4 py-3">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto flex items-center justify-between rounded-full"
        style={{
          maxWidth: "96%",
          height: "72px",
          paddingLeft: "2.5rem",
          paddingRight: "2.5rem",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          boxShadow: "0 8px 32px rgba(239,68,68,0.06), 0 1px 0 rgba(255, 255, 255, 1) inset",
        }}
      >

        {/* LEFT — Brand (AlphaLens only, no subtitle) */}
        <motion.button
          onClick={handleHomeClick}
          className="flex items-center select-none shrink-0"
          whileHover={{ opacity: 0.8 }}
          title="Go to Home"
        >
          <span style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            <LogoWordmark />
          </span>
        </motion.button>

        {/* CENTER — Nav links */}
        <nav className="flex items-center gap-2">
          <Link to="/" className={pill(isHome)} title="Home">
            <Home size={20} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link to="/dashboard" className={pill(isDashboard)} title="Market Dashboard">
            <LayoutDashboard size={20} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link to="/search" className={pill(isSearch)} title="Company Search">
            <Search size={20} />
            <span className="hidden sm:inline">Company Search</span>
          </Link>

          <Link to="/chat" className={pill(isChat)} title="AI Analyst Chat">
            <BarChart2 size={20} />
            <span className="hidden sm:inline">AI Chat</span>
          </Link>
        </nav>

        {/* RIGHT — Chat-only controls (nothing shown on other pages) */}
        <div className="flex items-center gap-2 shrink-0" style={{ minWidth: "120px", justifyContent: "flex-end" }}>
          {messages.length > 0 && isChat && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearConversation}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
              title="New Chat"
            >
              <PenSquare size={18} />
              <span className="hidden sm:inline">New Chat</span>
            </motion.button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
