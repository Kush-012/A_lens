import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Building2, TrendingUp, BarChart2, Activity, Sparkles, Globe, Calendar } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import axios from "axios";

const POPULAR = [
  { symbol: "AAPL",  name: "Apple",     logo: "https://logo.clearbit.com/apple.com" },
  { symbol: "MSFT",  name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { symbol: "GOOGL", name: "Google",    logo: "https://logo.clearbit.com/google.com" },
  { symbol: "META",  name: "Meta",      logo: "https://logo.clearbit.com/meta.com" },
  { symbol: "META",  name: "Facebook",  logo: "https://logo.clearbit.com/facebook.com" },
  { symbol: "INFY",  name: "Infosys",   logo: "https://logo.clearbit.com/infosys.com" },
  { symbol: "WIT",   name: "Wipro",     logo: "https://logo.clearbit.com/wipro.com" },
  { symbol: "INTC",  name: "Intel",     logo: "https://logo.clearbit.com/intel.com" },
  { symbol: "NVDA",  name: "NVIDIA",    logo: "https://logo.clearbit.com/nvidia.com" },
];
// Get initials from a company name
function getInitials(name = "") {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
// Logo with initials fallback
function CompanyLogo({ logo, name, size = 36 }) {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 8, display: "block" }}
      />
    );
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444" }}>{getInitials(name)}</span>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`/api/market/search?q=${query}`);
        if (res.data.success && res.data.candidates) {
          setSuggestions(res.data.candidates);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => navigate(`/company/${symbol}`);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f6d8d8ff" }}>
      <Navbar onTogglePanel={() => {}} panelOpen={false} />
      {/* Subtle grid backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(239,68,68,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.035) 1px, transparent 1px)`,
        backgroundSize: "52px 52px"
      }} />

      <main className="flex-1 flex flex-col items-center px-6 pt-16 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-red-600 text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", boxShadow: "0 1px 6px rgba(239,68,68,0.10)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Company Research
          </div>
          <h1 className="text-4xl font-black text-black mb-4 tracking-tight">
            Search Any Public Company
          </h1>
          <p className="text-black max-w-md mx-auto leading-relaxed text-base font-semibold">
            Discover comprehensive financial insights powered by AI. Enter any publicly listed 
            company name to instantly access 
             executive information, financial metrics, and an intelligent investment analysis.
          </p> 
        </motion.div>

        {/* Search Input – improved clear button & border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative w-full max-w-2xl group"
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-5 bg-white h-16 transition-all duration-300 border-2 border-red-200 group-hover:border-red-400 group-hover:shadow-[0_4px_20px_rgba(239,68,68,0.15)] focus-within:!border-red-500 focus-within:!shadow-[0_4px_24px_rgba(239,68,68,0.2)]"
            style={{ boxShadow: "0 2px 12px rgba(239,68,68,0.08)" }}
          >
            <Search className="text-red-400 flex-shrink-0" size={22} />
            <input
              type="text"
              autoFocus
              placeholder="e.g. Apple, Tesla, Samsung, Accenture..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 text-base font-medium placeholder:text-gray-400"
            />
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin flex-shrink-0" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors p-1 rounded-full hover:bg-red-50"
                aria-label="Clear search"
              >
                <span className="text-lg font-light">✕</span>
              </button>
            ) : null}
          </div>

          {!query && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-1.5 mt-4 text-[13px] text-gray-600 font-semibold"
            >
              <Sparkles size={13} className="text-red-500" />
              AI powered, search the company name
            </motion.div>
          )}

          {/* Suggestions Dropdown – now with CompanyLogo for polished look */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl overflow-hidden z-30"
                style={{ border: "1px solid #FECACA", boxShadow: "0 8px 32px rgba(239,68,68,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <div className="px-4 py-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-50 flex items-center gap-1.5">
                  <Sparkles size={10} className="text-red-400" /> Results — click to analyze
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => handleSelect(s.symbol)}
                    className="w-full text-left px-5 py-3.5 border-b border-gray-50 last:border-0 transition-all flex items-center justify-between group"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#FFF7F7"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3">
                      {/* 👇 Use CompanyLogo instead of initials-only avatar */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-all group-hover:border-red-200"
                        style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
                      >
                        <CompanyLogo logo={s.logo} name={s.name} size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-red-700 text-sm leading-tight transition-colors">{s.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 capitalize">
                          {(s.type || "").toLowerCase().replace("common stock", "Public Company")}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Popular Companies – unchanged */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-10 w-full max-w-3xl"
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em] mb-5 text-center">Popular Companies</p>
            <div className="grid grid-cols-3 gap-3">
              {POPULAR.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => handleSelect(c.symbol)}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl transition-all text-left group"
                  style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.45)";
                    e.currentTarget.style.boxShadow = "0 4px 18px rgba(239,68,68,0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white"
                    style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  >
                    <CompanyLogo logo={c.logo} name={c.name} size={28} />
                  </div>
                  <div className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors leading-snug">
                    {c.name}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Feature Pills – unchanged */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-12 flex flex-wrap gap-2.5 justify-center"
        >
          {[
            { icon: <Building2 size={13}/>, label: "Industry" },
            { icon: <TrendingUp size={13}/>, label: "Market Cap" },
            { icon: <BarChart2 size={13}/>, label: "Exchange" },
            { icon: <Calendar size={13}/>, label: "IPO Date" },
            { icon: <Globe size={13}/>, label: "Country" },
          ].map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-700 font-semibold transition-all"
              style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <span className="text-red-500">{f.icon}</span> {f.label}
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  );
}