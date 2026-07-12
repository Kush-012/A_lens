# Introduction

AlphaLens is a full-stack AI powered investment research platform that enables users to analyze publicly listed companies through real time financial data and intelligent AI-driven insights. Simply search for a company to access live market information, financial metrics, company fundamentals, and an AI-generated investment recommendation.

---
# Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Node.js
- Express.js
- Server-Sent Events (SSE)

### AI & Agent Framework
- LangGraph.js
- LangChain.js
- Groq API (Llama 3.3)

### Financial Data
- Finnhub API

### Caching
- Node Cache (In-Memory Cache)

### Development Tools
- Git & GitHub
- Postman
- npm
---
## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                 │
│  ┌─────────────────────────┬────────────────────────────┐  │
│  │     Chat Interface      │    Execution Panel (SSE)   │  │
│  │   Markdown + Charts     │    Live step streaming     │  │
│  └─────────────────────────┴────────────────────────────┘  │
│                         ▲ SSE                              │
│                         │                                  │
│                    POST /api/chat                           │
└────────────────────────────────────────────────────────────┘
                          │
┌────────────────────────────────────────────────────────────┐
│                  BACKEND (Express + LangGraph)             │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              LangGraph Agent Graph                  │   │
│  │                                                     │   │
│  │  START → Intent Node → Resolver Node                │   │
│  │        → Planner Node                               │   │
│  │        → Executor Node (Parallel via Send) ◄──┐     │   │
│  │        → Validator Node ──────────────────────┘     │   │
│  │        → Report Node / LLM Fallback Node → END      │   │
│  └─────────────────────────────────────────────────────┘   │
│          ↓                           ↓                     │
│   ┌──────────────┐          ┌────────────────┐             │
│   │  Finnhub API │          │  Groq API      │             │
│   │  (14 tools)  │          │  (Llama 3.3)   │             │
│   └──────────────┘          └────────────────┘             │
└────────────────────────────────────────────────────────────┘
```

---

## LangGraph Agent Flow

```
START
  │
  ▼
┌─────────────────────┐
│    Intent Node      │  Llama 3.3 detects user intent & extracts companies
└────────┬────────────┘
         ▼
┌─────────────────────┐
│   Resolver Node     │  Resolves company names → ticker symbols
└────────┬────────────┘
         ▼
┌─────────────────────┐
│   Planner Node      │  Generates list of missing tools based on query
└────────┬────────────┘
         ▼ (Parallel Send)
┌─────────────────────┐ ◄──────────────┐
│   Executor Node     │                │
│  (Multiple active)  │                │
└────────┬────────────┘                │
         ▼                             │
┌─────────────────────┐                │
│   Validator Node    │ ──(Retry)──────┘
│  Checks completeness│
└────────┬────────────┘
         ▼ (Success / Fallback)
┌────────┴────────────┐
│   Report Node /     │  Synthesizes data or provides a qualitative 
│  LLM Fallback Node  │  fallback analysis if API fails permanently
└────────┬────────────┘
        END
```

---

## Folder Structure

```
p_a/
├── b/                            # Backend
│   ├── server.js                 # Express entry point
│   ├── package.json
│   ├── .env / .env.example
│   ├── config/
│   │   ├── index.js              # Central config (env validation)
│   │   └── llm.js                # Groq LLM client
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralised error handler
│   │   ├── rateLimiter.js        # Express rate limiter
│   │   └── requestLogger.js      # Morgan + request ID
│   ├── utils/
│   │   ├── logger.js             # Structured logger
│   │   ├── cache.js              # In-memory cache (node-cache)
│   │   └── helpers.js            # Pure utilities
│   ├── services/
│   │   └── finnhubService.js     # Finnhub HTTP client (retry + cache)
│   ├── tools/
│   │   ├── searchCompanyTool.js
│   │   ├── quoteTool.js
│   │   ├── profileTool.js
│   │   ├── financialMetricsTool.js
│   │   ├── financialStatementsTool.js
│   │   ├── earningsTool.js
│   │   ├── recommendationTool.js
│   │   ├── priceTargetTool.js
│   │   ├── newsTool.js
│   │   ├── peersTool.js
│   │   ├── esgTool.js
│   │   ├── insiderTool.js
│   │   ├── calculatorTool.js
│   │   ├── comparisonTool.js
│   │   ├── trendTool.js
│   │   ├── riskTool.js
│   │   ├── investmentScoringTool.js
│   │   └── index.js              # Tool registry
│   ├── prompts/
│   │   ├── intentPrompt.js
│   │   ├── plannerPrompt.js
│   │   └── reportPrompt.js
│   ├── nodes/
│   │   ├── intentNode.js
│   │   ├── resolverNode.js
│   │   ├── plannerNode.js
│   │   ├── executorNode.js
│   │   ├── validatorNode.js
│   │   ├── llmFallbackNode.js
│   │   └── reportNode.js
│   ├── langgraph/
│   │   ├── state.js              # LangGraph state annotation
│   │   └── graph.js              # Compiled cyclic agent graph
│   ├── edges/
│   │   └── conditionalEdges.js   # Dynamic routing logic
│   ├── controllers/
│   │   └── chatController.js     # SSE streaming controller
│   └── routes/
│       ├── chat.js
│       └── index.js
│
└── f/                            # Frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css              # Design system
        ├── context/
        │   └── ChatContext.jsx    # Central state + SSE handler
        ├── services/
        │   ├── api.js             # HTTP client
        │   └── stream.js          # SSE parser
        ├── utils/
        │   ├── formatters.js      # Display formatters
        │   └── exportUtils.js     # Clipboard/PDF export
        ├── components/
        │   ├── ui/
        │   │   ├── ExportControls.jsx
        │   │   ├── FollowUpSuggestions.jsx
        │   │   └── JsonViewer.jsx
        │   ├── chat/
        │   │   ├── ChatMessage.jsx
        │   │   ├── InputBox.jsx
        │   │   ├── MessageList.jsx
        │   │   └── WelcomeHero.jsx
        │   ├── execution/
        │   │   └── AgentPanel.jsx
        │   ├── charts/
        │   │   └── FinancialCharts.jsx
        │   ├── layout/
        │   │   ├── Logo.jsx
        │   │   └── Navbar.jsx
        │   └── report/
        │       ├── CompanyCard.jsx
        │       ├── MetricsGrid.jsx
        │       ├── NewsCard.jsx
        │       ├── ProsConsCard.jsx
        │       ├── ReportView.jsx
        │       └── SummaryCard.jsx
        └── pages/
            └── ChatPage.jsx
```

---

## Tools

| Tool | Source | Description |
|------|--------|-------------|
| Search Company | Finnhub `/search` | Resolve company name → ticker |
| Quote | Finnhub `/quote` | Real-time price, change, volume |
| Profile | Finnhub `/stock/profile2` | Business description, sector |
| Financial Metrics | Finnhub `/stock/metric` | 60+ KPIs |
| Financial Statements | Finnhub `/financials/reported` | Income, BS, CF |
| Earnings | Finnhub `/stock/earnings` | EPS actual vs estimate |
| Recommendation | Finnhub `/stock/recommendation` | Analyst consensus |
| Price Target | Finnhub `/stock/price-target` | High/low/mean targets |
| News | Finnhub `/company-news` | Recent articles |
| Peers | Finnhub `/stock/peers` | Competitor tickers |
| ESG | Finnhub `/stock/esg` | E/S/G scores |
| Insider | Finnhub `/stock/insider-transactions` | Buy/sell activity |
| Calculator | Internal | 14 arithmetic operations |
| Comparison | Internal | Side-by-side with winner scoring |
| Trend | Internal | YoY growth, CAGR |
| Risk | Internal | Multi-factor risk profile |
| Investment Scoring | Internal | 100-point composite score |

---

## Recent Enhancements

- **International Stock Support & AI Fallback**: The search algorithm now accurately surfaces international tickers (e.g., PUM.DE for Puma SE). If Finnhub restricts profile data on the free tier, the system intelligently generates a fallback profile, allowing the user to proceed seamlessly into the AI chat.
- **Resilient SSE Streaming**: Improved the `chatController` stream handling to ignore premature connection closures from local development proxies (like Vite), ensuring that the UI never hangs and always receives the final synthesized LLM report.
- **Polished Search UI**: Upgraded the Company Search interface with dynamic hover states, better text contrast, and clear feature highlights (Industry, Market Cap, Exchange, IPO Date, Country).
- **Data Cleanup**: UI components like `MetricsGrid` now automatically hide missing or `N/A` values for a cleaner presentation.

---

## Setup

### Prerequisites
- Node.js ≥ 20
- Groq API Key ([console.groq.com](https://console.groq.com))
- Finnhub API Key ([finnhub.io](https://finnhub.io))

### Backend
```bash
cd b
cp .env.example .env
# Fill in GROQ_API_KEY and FINNHUB_API_KEY in .env
npm install
npm run dev
```

### Frontend
```bash
cd f
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## API

### POST /api/chat (SSE)

**Request:**
```json
{
  "query": "Compare Tesla and Nvidia",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "model", "content": "..." }
  ]
}
```

**SSE Events:**
```
data: {"type":"step","step":"Understanding your request..."}
data: {"type":"intent","intent":{"type":"comparison","companies":["Tesla","Nvidia"]}}
data: {"type":"plan","plan":{"steps":[...]}}
data: {"type":"tool_start","tool":"financialMetrics","symbol":"TSLA"}
data: {"type":"tool_complete","tool":"financialMetrics","symbol":"TSLA","success":true}
data: {"type":"complete","executionTime":8.5}
data: {"type":"result","report":{...}}
```

### GET /api/health

```json
{ "status": "ok", "timestamp": "2026-07-07T...", "version": "1.0.0" }
```

---

## Design Decisions & Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **In-memory cache** | Fast, zero-ops, but not shared across processes. Acceptable for single-instance. |
| **SSE over WebSockets** | Simpler, HTTP-native, but unidirectional. Sufficient for our use case. |
| **Groq (Llama 3.3) for planning AND reasoning** | Single LLM vendor simplifies ops. High speed inference is ideal for chat. |
| **No database** | Fully stateless. Conversation history lives in the client. Lost on refresh. |
| **Client-side PDF** | Browser print dialog. No server-side PDF library = smaller backend. |
| **Tailwind v3** | Proven stability. v4 is too new for production dependency. |

---

## Future Improvements

- **WebSocket upgrade** for bidirectional streaming (cancel mid-stream from server)
- **Redis cache** for multi-instance deployments
- **Persistent conversation history** via localStorage or IndexedDB
- **Charting library upgrade** to Recharts or D3 for more chart types
- **Batch company comparison** (3+ companies at once)
- **Portfolio tracker** with real allocation data
- **Watchlist** with price alerts
- **Authentication** + user-scoped conversation history
- **Deployment** via Docker + Cloud Run or Vercel (frontend) + Fly.io (backend)

---

## License

MIT
