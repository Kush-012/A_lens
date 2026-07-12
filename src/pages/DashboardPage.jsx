// pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar.jsx";
import { TrendingUp, TrendingDown, Activity, Globe, Clock, Radio } from "lucide-react";
import axios from "axios";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [extendedData, setExtendedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      if (!data) setLoading(true);
      const [res, extRes] = await Promise.all([
        axios.get("/api/dashboard"),
        axios.get("/api/market/dashboard/extended")
      ]);
      setData(res.data);
      setExtendedData(extRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Unable to load market data at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const fearGreed = extendedData?.fearGreed ?? 50;
  // gauge geometry: semicircle arc from -90deg (left) to +90deg (right)
  const gaugeAngle = (fearGreed / 100) * 180; // 0-180
  const gaugeRad = ((gaugeAngle - 180) * Math.PI) / 180;
  const needleX = 100 + 78 * Math.cos(gaugeRad);
  const needleY = 100 + 78 * Math.sin(gaugeRad);

  return (
    <div className="flex flex-col h-full" style={{ background: "#FFF7F7" }}>
      <Navbar onTogglePanel={() => {}} panelOpen={false} />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        {/* ambient red glow – kept original, slightly softer */}
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.08] blur-[130px]" style={{ background: "#FF2D3F" }} />

        <div className="max-w-6xl mx-auto space-y-8 relative">

          <header className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#E5162B" }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#E5162B" }}></span>
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#C81729" }}>Live Market Feed</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Market Dashboard</h1>
              <p className="text-gray-500 mt-1 text-sm">Real-time platform overview and market insights.</p>
            </div>
            {lastUpdated && (
              <div
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 px-3 py-2 rounded-full border transition-colors duration-200 cursor-default"
                style={{ background: "#FFFFFF", borderColor: "#111827" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#E5162B")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#111827")}
              >
                <Clock size={13} />
                Updated {lastUpdated}
              </div>
            )}
          </header>

          {error && (
            <div className="p-4 rounded-xl border text-sm font-semibold" style={{ background: "#FFECEE", borderColor: "#FFC2C8", color: "#C81729" }}>
              {error}
            </div>
          )}

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#FFD9DC", borderTopColor: "#E5162B" }}></div>
              <p className="text-sm font-medium text-gray-500">Loading live market data...</p>
            </div>
          ) : data ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              className="space-y-6"
            >
              {/* Market Overview (Indices) */}
              {extendedData && extendedData.marketOverview && (
                <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {extendedData.marketOverview.map(idx => {
                    const up = idx.percentChange >= 0;
                    return (
                      <div
                        key={idx.symbol}
                        className="p-4 text-center rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-md"
                        style={{
                          background: "#FFFFFF",
                          borderColor: "#111827"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = up ? "#16A34A" : "#E5162B";
                          e.currentTarget.style.boxShadow = up ? "0 4px 12px rgba(22,163,74,0.15)" : "0 4px 12px rgba(229,22,43,0.15)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "#111827";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{idx.symbol}</div>
                        <div className="text-lg font-extrabold text-gray-900 font-mono tabular-nums">
                          {idx.price > 0 ? idx.price.toFixed(2) : "N/A"}
                        </div>
                        <div className="text-xs font-bold font-mono mt-0.5" style={{ color: up ? "#16A34A" : "#E5162B" }}>
                          {up ? "▲" : "▼"} {up ? "+" : ""}{idx.percentChange.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Insight & Overview Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Platform Overview */}
                <motion.div
                  variants={fadeUp}
                  className="p-6 lg:col-span-1 rounded-2xl border-2 transition-all duration-200 cursor-default hover:shadow-md"
                  style={{ background: "#FFFFFF", borderColor: "#111827" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#E5162B";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,22,43,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#111827";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg" style={{ background: "#FFECEE", color: "#E5162B" }}><Globe size={20} /></div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Platform Overview</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Welcome to <strong className="text-gray-900">Alpha Lens</strong>. Real-time market analysis, AI-powered financial reasoning, valuation metrics, and peer comparison tools.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-3">
                    A 10,000-foot view of the markets — major movers and breaking news, refreshed every 2 minutes from Finnhub.
                  </p>
                </motion.div>

                {/* Insight of the Day */}
                <motion.div
                  variants={fadeUp}
                  className="p-6 lg:col-span-2 relative overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-200 cursor-default hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 65%)", borderColor: "#111827" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#E5162B";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,22,43,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#111827";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                >
                  <div className="absolute -top-4 -right-4 opacity-[0.06]" style={{ color: "#E5162B" }}>
                    <Activity size={140} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#E5162B" }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#E5162B" }}></span>
                      Insight of the Day
                    </h3>
                    {data.insight ? (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3 text-gray-900">
                          {data.insight.headline}
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-2xl line-clamp-3">
                          {data.insight.summary}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                          <span className="px-2 py-1 rounded font-bold" style={{ background: "#FFECEE", color: "#C81729" }}>{data.insight.source}</span>
                          <span>{new Date(data.insight.time).toLocaleTimeString()}</span>
                          {data.insight.url && (
                            <a href={data.insight.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 ml-2 transition-colors" style={{ color: "#E5162B" }}>
                              Read Full Story →
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">No insights available at the moment.</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Market Movers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={fadeUp}>
                  <MoverCard title="Trending" icon={<Activity size={17} style={{ color: "#E5162B" }} />} stocks={data.trending} accent="neutral" />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <MoverCard title="Growing" icon={<TrendingUp size={17} style={{ color: "#16A34A" }} />} stocks={data.growing} accent="up" />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <MoverCard title="Declining" icon={<TrendingDown size={17} style={{ color: "#E5162B" }} />} stocks={data.declining} accent="down" />
                </motion.div>
              </div>

              {/* Bottom Widgets Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Fear & Greed */}
                <motion.div
                  variants={fadeUp}
                  className="p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-default hover:shadow-md"
                  style={{ background: "#FFFFFF", borderColor: "#111827" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#E5162B";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,22,43,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#111827";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 self-start flex items-center gap-2">
                    <Radio size={16} style={{ color: "#E5162B" }} /> Fear &amp; Greed Index
                  </h3>
                  <svg viewBox="0 0 200 110" className="w-56">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#E5162B" />
                        <stop offset="50%" stopColor="#F4B4B8" />
                        <stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                    </defs>
                    <path d="M 12 100 A 88 88 0 0 1 188 100" fill="none" stroke="#FFE3E5" strokeWidth="14" strokeLinecap="round" />
                    <path
                      d="M 12 100 A 88 88 0 0 1 188 100"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${(fearGreed / 100) * 276} 276`}
                    />
                    <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="#111827" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="5" fill="#111827" />
                  </svg>
                  <div className="text-3xl font-extrabold text-gray-900 font-mono -mt-2">{fearGreed}</div>
                  <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: fearGreed > 60 ? "#16A34A" : fearGreed < 40 ? "#E5162B" : "#9CA3AF" }}>
                    {fearGreed > 60 ? "Greed" : fearGreed < 40 ? "Fear" : "Neutral"}
                  </div>
                </motion.div>

                {/* Upcoming Earnings */}
                <motion.div
                  variants={fadeUp}
                  className="p-6 rounded-2xl border-2 transition-all duration-200 cursor-default hover:shadow-md"
                  style={{ background: "#FFFFFF", borderColor: "#111827" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#E5162B";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,22,43,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#111827";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock size={16} style={{ color: "#E5162B" }} /> Upcoming Earnings (7 Days)
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {extendedData?.earnings?.length > 0 ? (
                      extendedData.earnings.map((e, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                          style={{ border: "2px solid #111827", background: "#FFFFFF" }}
                          onMouseEnter={ev => {
                            ev.currentTarget.style.borderColor = "#E5162B";
                            ev.currentTarget.style.background = "#FFF5F5";
                            ev.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={ev => {
                            ev.currentTarget.style.borderColor = "#111827";
                            ev.currentTarget.style.background = "#FFFFFF";
                            ev.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <div className="font-bold text-gray-900 font-mono">{e.symbol}</div>
                          <div className="text-sm font-medium text-gray-500">{e.date}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 font-medium py-2">No major earnings scheduled this week.</div>
                    )}
                  </div>
                </motion.div>
              </div>

            </motion.div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

function MoverCard({ title, icon, stocks }) {
  return (
    <div
      className="rounded-2xl border-2 p-5 h-full shadow-sm transition-all duration-200 cursor-default hover:shadow-md"
      style={{ background: "#FFFFFF", borderColor: "#111827" }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#E5162B";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(229,22,43,0.15)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#111827";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
      }}
    >
      <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col gap-1.5">
        {stocks && stocks.length > 0 ? (
          stocks.map(s => {
            const up = s.percentChange > 0;
            return (
              <div
                key={s.symbol}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                style={{ border: "2px solid #111827", background: "#FFFFFF" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = up ? "#16A34A" : "#E5162B";
                  e.currentTarget.style.background = up ? "#F0FDF4" : "#FFF5F5";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#111827";
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div className="text-sm font-bold text-gray-900 font-mono">{s.symbol}</div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 font-mono">${s.price?.toFixed(2)}</div>
                  <div className="text-xs font-bold font-mono" style={{ color: up ? "#16A34A" : "#E5162B" }}>
                    {up ? "+" : ""}{s.percentChange?.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-sm text-gray-400 font-medium rounded-lg border-2 border-dashed border-red-100">
            No data
          </div>
        )}
      </div>
    </div>
  );
} 