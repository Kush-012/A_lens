/**
 * App.jsx
 *
 * Root application component.
 * Wraps the entire app in the ChatProvider context.
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";

export default function App() {
  return (
    <ChatProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/company/:symbol" element={<CompanyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ChatProvider>
  );
}
