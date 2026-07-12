// pages/LandingPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, BarChart2, MessageSquare, ArrowRight, Star, TrendingUp, Zap, Shield, Check } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";

import axios from "axios";

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) { setSuggestions([]); return; }
      setLoading(true);
      try {
        const res = await axios.get(`/api/market/search?q=${query}`);
        if (res.data.success && res.data.candidates) setSuggestions(res.data.candidates);
        else setSuggestions([]);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [query]);

  const go = (symbol) => { setShowDropdown(false); navigate(`/company/${symbol}`); };

  const trending = [
    { sym: "AAPL", name: "Apple" },
    { sym: "NVDA", name: "NVIDIA" },
    { sym: "TSLA", name: "Tesla" },
    { sym: "MSFT", name: "Microsoft" },
    { sym: "ACN", name: "Accenture" },
  ];

  const stats = [
    { value: "15,000+", label: "Public Companies" },
    { value: "Real-Time", label: "Live Market Data" },
    { value: "AI Powered", label: "Investment Reports" },
  ];

  const features = [
    { icon: <Activity size={22} />, title: "Real-Time Data", desc: "Live quotes, historical metrics, and breaking market news via Finnhub API — updated every second." },
    { icon: <MessageSquare size={22} />, title: "Agentic Reasoning", desc: "The AI plans execution, compares peers, and synthesizes complex multi-step financial reports automatically." },
    { icon: <BarChart2 size={22} />, title: "Market Dashboard", desc: "Track global indices, top gainers, fear/greed tracker, upcoming earnings and market movers in one place." },
    { icon: <Shield size={22} />, title: "Company Profiles", desc: "CEO, industry, exchange, market cap, employee count and full financial snapshot for any public company." },
    { icon: <TrendingUp size={22} />, title: "Investment Scoring", desc: "AI-generated buy/hold/sell guidance backed by quantitative signals and sector comparisons." },
    { icon: <Zap size={22} />, title: "Instant Search", desc: "Search by full company name or ticker. Type 'Accenture' or 'ACN' — we'll find it instantly." },
  ];

  const professionalBoxes = [
    { icon: <BarChart2 size={20} />, title: "Equity Analysts", desc: "Compare valuation, ratios, and peer signals without switching tools." },
    { icon: <TrendingUp size={20} />, title: "Portfolio Managers", desc: "Scan movers, earnings, and market risks before allocation decisions." },
    { icon: <Shield size={20} />, title: "Financial Advisors", desc: "Turn company data into clear client-ready research summaries." },
    { icon: <Zap size={20} />, title: "Active Investors", desc: "Move from ticker search to AI-backed insight in seconds." },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col font-sans" style={{ background: "#f6d8d8ff" }}>
      <Navbar onTogglePanel={() => { }} panelOpen={false} />

      <main className="flex-1 w-full flex flex-col">

        {/* ── Hero: TEXT LEFT + IMAGE RIGHT ─────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-400/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — Copy */}
            <div className="relative z-10 flex flex-col items-start">



              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-[64px] font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]"
              >
                Alpha<span className="text-red-500">Lens</span>
              </motion.h1>

              {/* Paragraph */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl font-medium"
              >
                Analyze any public company using real-time market data, AI-powered reasoning, financial statements, valuation metrics, peer comparisons, and professional investment reports all in seconds.
              </motion.p>

              {/* Features List */}
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-10"
              >
                {[
                  { text: "Real-Time Market Data", icon: <Activity size={16} /> },
                  { text: "AI Investment Reports", icon: <MessageSquare size={16} /> },
                  { text: "Financial Ratio Analysis", icon: <BarChart2 size={16} /> },
                  { text: "Company & Peer Comparison", icon: <TrendingUp size={16} /> },
                ].map((item, i) => (
                  <motion.div key={i} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-2.5 text-gray-700 font-semibold text-sm">
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    {item.text}
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6"
              >
                <button onClick={() => navigate("/search")} className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 text-lg flex items-center justify-center gap-2 group">
                  Start Research <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => navigate("/dashboard")} className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2">
                  View Dashboard
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-gray-500"
              >
                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={10} strokeWidth={4} /></div> Real-Time Data</span>
                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={10} strokeWidth={4} /></div> AI Powered</span>
                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><Check size={10} strokeWidth={4} /></div> No Registration</span>
              </motion.div>


            </div>

            {/* RIGHT — Dashboard Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                {/* Glow */}
                <div className="absolute inset-0 bg-red-500/12 rounded-3xl blur-3xl scale-90 -z-10" />
                <img
                  src="/banner.jpg"
                  alt="AlphaLens AI Dashboard"
                  className="w-full rounded-2xl shadow-2xl border border-white/60 object-cover"
                  style={{ maxHeight: "420px", objectFit: "cover" }}
                />
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── Stats ─────────────────────────────── */}
        <section className="py-10 px-6 border-y border-gray-100">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}
                className="text-center bg-white border border-red-50 rounded-2xl py-6 px-4 shadow-sm"
              >
                <div className="text-2xl font-extrabold text-red-500 mb-1">{s.value}</div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need to Invest Smarter</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Alpha Lens combines live financial APIs with an advanced AI reasoning engine to automate your entire research workflow.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                  className="group bg-white rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
style={{
  borderColor: "#FCA5A5",
  boxShadow: "0 4px 16px rgba(239,68,68,0.06)"
}}
                >
                  <div className="w-11 h-11 bg-red-50 group-hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center mb-5 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────── */}
     <section className="py-16 px-6">
  <div
    className="max-w-6xl mx-auto rounded-3xl border p-10 md:p-14"
    style={{
      background: "#FFFBFB",
      borderColor: "#FECACA",
      boxShadow: "0 10px 35px rgba(239,68,68,0.08)"
    }}
  >
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Loved by Professionals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { quote: "Alpha Lens cuts my research time in half. Just ask for a valuation comparison and get a full professional report — game-changing.", name: "Sarah Jenkins", role: "Equity Analyst" },
                { quote: "The cleanest fintech UI I've seen. No clutter, just the data I need wrapped in an incredibly powerful AI interface.", name: "David Chen", role: "Retail Investor" },
                { quote: "I use the dashboard every morning before markets open. The fear/greed tracker and top movers keep me ahead of the curve.", name: "Priya Sharma", role: "Portfolio Manager" },
                { quote: "Being able to type 'Accenture' and instantly get the CEO, market cap, P/E, and an AI brief is just phenomenal.", name: "James Okafor", role: "Financial Advisor" },
              ].map((t) => (
                <div key={t.name} className="bg-white border-2 border-red-500 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-red-600 transition-all">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="#FBBF24" color="#FBBF24" size={16} />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 font-bold text-sm">{t.name[0]}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


       <section className="py-16 px-6">
  <div
    className="max-w-4xl mx-auto rounded-3xl py-16 px-8 bg-white shadow-xl border-2 border-red-500"
  >
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Ready to research smarter?
      </h2>

      <p className="mb-8 text-gray-600">
        Start with any company. No setup required.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate("/search")}
          className="px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all shadow-lg border-2 border-red-500 hover:border-red-600"
        >
          Search a Company
        </button>

        <button
          onClick={() => navigate("/chat")}
          className="px-8 py-3.5 text-gray-800 font-semibold rounded-xl border-2 border-red-500 transition-all hover:bg-red-50"
        >
          Try AI Chat
        </button>
      </div>
    </div>
  </div>
</section>

        {/* ── Footer ─────────────────────────────── */}
        <footer style={{ background: "#111111" }} className="text-white py-10 px-6 mt-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-extrabold">Alpha<span className="text-red-500">Lens</span></div>
            <div className="flex gap-6 text-sm font-medium" style={{ color: "#6B7280" }}>
              <button className="hover:text-white transition-colors">About</button>
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
            <div className="text-xs" style={{ color: "#4B5563" }}>© 2026 AlphaLens. All rights reserved.</div>
          </div>
        </footer>

      </main>
    </div>
  );
}
