// pages/CompanyPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Activity, ChevronLeft, ArrowRight, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import { useChat } from "../context/ChatContext.jsx";
import axios from "axios";

/** Renders a label/value row only when value is truthy (no N/A placeholders) */
function ProfileRow({ label, value, last = false }) {
  if (value === null || value === undefined || value === "" || value === "N/A") return null;
  return (
    <div className={`flex justify-between ${last ? "pb-1" : "border-b border-gray-100 pb-3"}`}>
      <span className="text-gray-500 font-medium text-sm">{label}</span>
      <span className="text-gray-900 font-bold text-sm text-right max-w-[220px]">{value}</span>
    </div>
  );
}

/** Rich error card with retry button */
function ErrorCard({ error, code, onRetry }) {
  const isNetwork = code === "SERVICE_UNAVAILABLE" || code === "TIMEOUT";
  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
      style={{ background: "#FFFFFF", border: "1.5px solid #FECACA", boxShadow: "0 4px 20px rgba(239,68,68,0.08)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
      >
        {isNetwork
          ? <WifiOff size={24} className="text-red-500" />
          : <AlertTriangle size={24} className="text-red-500" />}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {isNetwork ? "Cannot Reach Market Data" : "Company Not Found"}
        </h2>
        <p className="text-gray-500 text-sm max-w-md leading-relaxed">{error}</p>
      </div>
      {isNetwork && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
          style={{ background: "#EF4444", boxShadow: "0 4px 14px rgba(239,68,68,0.28)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#EF4444"; }}
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
      {!isNetwork && (
        <p className="text-xs text-gray-400 font-medium">
          Make sure the company name is correct, or try searching again.
        </p>
      )}
    </div>
  );
}


export default function CompanyPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { sendMessage } = useChat();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);    // { message, code }
  const [retryCount, setRetryCount] = useState(0);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/market/company/${symbol}`);
      setData(res.data);
    } catch (err) {
      const apiError = err.response?.data;
      setError({
        message: apiError?.error || "Failed to load company data. Please try again.",
        code: apiError?.code || "UNKNOWN",
      });
    } finally {
      setLoading(false);
    }
  }, [symbol, retryCount]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const handleRetry = () => setRetryCount(c => c + 1);

  const handleAskAI = () => {
    navigate("/chat");
    setTimeout(() => {
      sendMessage(`Analyze ${symbol} and give me a comprehensive overview including valuation and recent trends.`);
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f6d8d8ff" }}>
      <Navbar onTogglePanel={() => {}} panelOpen={false} />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 mb-8 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <ErrorCard error={error.message} code={error.code} onRetry={handleRetry} />

          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Header Card */}
              <div className="card bg-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {data.profile.logo ? (
                    <img src={data.profile.logo} alt={data.profile.name} className="w-16 h-16 object-contain rounded-xl border border-gray-100 bg-white p-1" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl">{symbol[0]}</div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{data.profile.name}</h1>
                    <div className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                      {data.profile.ticker && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">{data.profile.ticker}</span>
                      )}
                      {data.profile.exchange && <span>{data.profile.exchange}</span>}
                    </div>
                  </div>
                </div>

                {data.quote && data.quote.price ? (
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-gray-900">${data.quote.price.toFixed(2)}</div>
                    {data.quote.percentChange != null && (
                      <div className={`text-sm font-bold flex items-center justify-end gap-1 ${data.quote.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {data.quote.percentChange >= 0 ? '+' : ''}{data.quote.percentChange.toFixed(2)}%
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Action Button */}
              <button onClick={handleAskAI} className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 group">
                Ask AI about {data.profile.name || symbol}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-white p-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Building2 size={18} className="text-red-500" /> Company Profile
                  </h3>
                  <div className="space-y-4">
                    <ProfileRow label="Industry"   value={data.profile.industry} />
                    <ProfileRow label="Market Cap" value={data.profile.marketCap} />
                    <ProfileRow label="Exchange"   value={data.profile.exchange} />
                    <ProfileRow label="Employees"  value={data.profile.employees} />
                    <ProfileRow label="IPO Date"   value={data.profile.ipo} />
                    <ProfileRow label="CEO"        value={data.profile.ceo} />
                    <ProfileRow label="Country"    value={data.profile.country} last />
                  </div>
                </div>

                <div className="card bg-white p-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-red-500" /> About
                  </h3>
                  {data.profile.description ? (
                    <p className="text-gray-700 text-sm leading-relaxed font-medium">
                      {data.profile.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No description available.</p>
                  )}
                  {data.profile.webUrl && (
                    <a href={data.profile.webUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-red-500 font-bold hover:underline text-sm">
                      Visit Official Website →
                    </a>
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}


