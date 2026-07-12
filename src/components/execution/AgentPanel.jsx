// components/execution/AgentPanel.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../../context/ChatContext.jsx";
import JsonViewer from "../ui/JsonViewer.jsx";
import { Terminal, Code2, Network, Globe, Bot, LayoutList, Database, Clock, Activity, Search, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";

export default function AgentPanel({ visible }) {
  const { developerTraces, isLoading } = useChat();
  const [activeTab, setActiveTab] = useState("timeline");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [developerTraces, autoScroll, activeTab]);

  const panelVariants = {
    hidden: { x: "100%", opacity: 0 },
    show:   { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit:   { x: "100%", opacity: 0, transition: { duration: 0.25 } },
  };

  const tabs = [
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "nodes", label: "Nodes", icon: Network },
    { id: "tools", label: "Tools", icon: Code2 },
    { id: "http", label: "HTTP", icon: Globe },
    { id: "llm", label: "LLM", icon: Bot },
    { id: "summary", label: "Summary", icon: LayoutList },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "timeline": return <TimelineTab traces={developerTraces} />;
      case "nodes": return <NodesTab traces={developerTraces} />;
      case "tools": return <ToolsTab traces={developerTraces} />;
      case "http": return <HttpTab traces={developerTraces} />;
      case "llm": return <LlmTab traces={developerTraces} />;
      case "summary": return <SummaryTab traces={developerTraces} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="agent-panel"
          variants={panelVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="flex-shrink-0 flex flex-col w-[500px] xl:w-[600px] bg-gray-950 text-gray-300 overflow-hidden shadow-2xl z-40 border-l border-gray-800 font-mono"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-white">Developer Trace</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[10px] cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="accent-primary" />
                Auto-scroll
              </label>
              {isLoading && (
                <span className="flex items-center gap-1.5 text-[10px] text-primary font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-800 bg-gray-950 hide-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === t.id ? "border-primary text-primary bg-gray-900/50" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a]">
            {developerTraces.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <Activity size={32} className="mb-3" />
                <p className="text-xs">Awaiting execution traces...</p>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── Tabs Implementation ──────────────────────────────────────────────────

function TimelineTab({ traces }) {
  return (
    <div className="space-y-3">
      {traces.map((trace, i) => (
        <div key={i} className="flex gap-3 text-[11px]">
          <div className="text-gray-600 shrink-0 w-20">
            {new Date(trace.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}
          </div>
          <div className="flex-1">
            <span className={`font-bold ${
              trace.type.includes("error") ? "text-red-400" :
              trace.type.includes("start") ? "text-blue-400" :
              trace.type.includes("complete") ? "text-green-400" :
              trace.type === "http_request" ? "text-purple-400" :
              trace.type === "llm_request" ? "text-orange-400" :
              "text-gray-300"
            }`}>
              {trace.type.toUpperCase()}
            </span>
            <span className="ml-2 text-gray-400">
              {trace.nodeName || trace.tool || trace.step || (trace.url && new URL(trace.url).pathname) || trace.modelName || ""}
            </span>
            {trace.duration !== undefined && (
              <span className="ml-2 text-gray-500">{trace.duration}ms</span>
            )}
            {trace.error && (
              <div className="mt-1 text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                {trace.error}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function NodesTab({ traces }) {
  const nodes = traces.filter(t => t.type === "node_start" || t.type === "node_complete");
  
  return (
    <div className="space-y-4">
      {nodes.map((node, i) => (
        <CollapsibleCard key={i} title={`${node.nodeName} [${node.type.split('_')[1].toUpperCase()}]`} subtitle={node.duration ? `${node.duration}ms` : ""}>
          {node.stateBefore && (
            <div className="mb-2">
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">State Before</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={node.stateBefore} /></div>
            </div>
          )}
          {node.stateAfter && (
            <div>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">State After</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={node.stateAfter} /></div>
            </div>
          )}
        </CollapsibleCard>
      ))}
    </div>
  );
}

function ToolsTab({ traces }) {
  const tools = traces.filter(t => t.type.startsWith("tool_"));
  
  return (
    <div className="space-y-4">
      {tools.map((tool, i) => (
        <CollapsibleCard 
          key={i} 
          title={`${tool.tool} [${tool.type.split('_')[1].toUpperCase()}]`} 
          subtitle={tool.symbol ? `Symbol: ${tool.symbol}` : ""}
          status={tool.success === false ? "error" : tool.success === true ? "success" : "pending"}
        >
          {tool.input && (
            <div className="mb-2">
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Input</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={tool.input} /></div>
            </div>
          )}
          {tool.output && (
            <div>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Output</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={tool.output} /></div>
            </div>
          )}
          {tool.error && (
            <div className="text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50 mt-2">
              {tool.error}
            </div>
          )}
        </CollapsibleCard>
      ))}
    </div>
  );
}

function HttpTab({ traces }) {
  const http = traces.filter(t => t.type === "http_request");
  
  return (
    <div className="space-y-4">
      {http.map((req, i) => (
        <CollapsibleCard 
          key={i} 
          title={`${req.method} ${new URL(req.url).pathname}`} 
          subtitle={`${req.status} • ${req.duration}ms`}
          status={req.status >= 400 ? "error" : "success"}
        >
          <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Full URL</div>
          <div className="text-blue-300 break-all mb-2">{req.url}</div>
          
          <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Headers</div>
          <div className="bg-gray-950 p-2 rounded mb-2"><JsonViewer data={req.headers} /></div>
          
          {req.query && Object.keys(req.query).length > 0 && (
            <>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Query Params</div>
              <div className="bg-gray-950 p-2 rounded mb-2"><JsonViewer data={req.query} /></div>
            </>
          )}

          {req.response && (
            <>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Response Payload</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={req.response} /></div>
            </>
          )}
        </CollapsibleCard>
      ))}
    </div>
  );
}

function LlmTab({ traces }) {
  const llm = traces.filter(t => t.type === "llm_request");
  
  return (
    <div className="space-y-4">
      {llm.map((req, i) => (
        <CollapsibleCard 
          key={i} 
          title={req.modelName} 
          subtitle={req.duration ? `${req.duration}ms` : "Pending..."}
          status={req.error ? "error" : req.rawResponse ? "success" : "pending"}
        >
          <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Request Payload</div>
          <div className="bg-gray-950 p-2 rounded mb-3"><JsonViewer data={req.request} /></div>
          
          {req.rawResponse && (
            <>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Raw Output</div>
              <div className="bg-gray-950 p-2 rounded text-green-400 whitespace-pre-wrap mb-3">{req.rawResponse}</div>
            </>
          )}
          
          {req.parsedJson && (
            <>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Parsed JSON Output</div>
              <div className="bg-gray-950 p-2 rounded mb-3"><JsonViewer data={req.parsedJson} /></div>
            </>
          )}

          {req.tokenUsage && (
            <>
              <div className="text-[10px] text-gray-500 mb-1 font-bold uppercase">Token Usage</div>
              <div className="bg-gray-950 p-2 rounded"><JsonViewer data={req.tokenUsage} /></div>
            </>
          )}
        </CollapsibleCard>
      ))}
    </div>
  );
}

function SummaryTab({ traces }) {
  const stats = useMemo(() => {
    const nodes = traces.filter(t => t.type === "node_complete");
    const tools = traces.filter(t => t.type === "tool_complete");
    const http = traces.filter(t => t.type === "http_request");
    const llm = traces.filter(t => t.type === "llm_request" && t.rawResponse);
    const errors = traces.filter(t => t.error);
    
    const totalTime = nodes.reduce((acc, n) => acc + (n.duration || 0), 0);
    const avgHttp = http.length ? http.reduce((acc, h) => acc + (h.duration || 0), 0) / http.length : 0;
    
    return {
      nodes: nodes.length,
      tools: tools.length,
      http: http.length,
      llm: llm.length,
      errors: errors.length,
      totalTime,
      avgHttp
    };
  }, [traces]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatBox label="Nodes Executed" value={stats.nodes} icon={Network} />
      <StatBox label="Tools Executed" value={stats.tools} icon={Code2} />
      <StatBox label="API Calls" value={stats.http} icon={Globe} />
      <StatBox label="LLM Calls" value={stats.llm} icon={Bot} />
      <StatBox label="Total Execution Time" value={`${stats.totalTime}ms`} icon={Clock} />
      <StatBox label="Avg API Latency" value={`${Math.round(stats.avgHttp)}ms`} icon={Activity} />
      <StatBox label="Errors Captured" value={stats.errors} icon={AlertTriangle} color="text-red-400" />
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color = "text-white" }) {
  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
      <Icon size={20} className="text-gray-500 mb-2" />
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">{label}</div>
    </div>
  );
}

function CollapsibleCard({ title, subtitle, children, status }) {
  const [open, setOpen] = useState(false);
  
  const statusColor = status === "error" ? "border-red-500/50 bg-red-500/10" 
                    : status === "success" ? "border-green-500/50 bg-green-500/10"
                    : "border-gray-800 bg-gray-900";
                    
  return (
    <div className={`border rounded-lg overflow-hidden ${statusColor}`}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          <span className="text-[11px] font-bold text-gray-200">{title}</span>
        </div>
        {subtitle && <span className="text-[10px] text-gray-500 font-mono">{subtitle}</span>}
      </button>
      {open && (
        <div className="px-3 py-3 border-t border-gray-800 bg-black/20 text-[11px]">
          {children}
        </div>
      )}
    </div>
  );
}
