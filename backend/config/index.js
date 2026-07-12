import "dotenv/config";

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[config] Missing required environment variable: ${key}\n` +
        `Copy .env.example to .env and fill in all required values.`
    );
  }
  return value.trim();
}

function optionalEnv(key, defaultValue) {
  return (process.env[key] || String(defaultValue)).trim();
}

const config = {
  server: {
    port: parseInt(optionalEnv("PORT", 3001), 10),
    nodeEnv: optionalEnv("NODE_ENV", "development"),
    isDevelopment: optionalEnv("NODE_ENV", "development") === "development",
  },

  groq: {
    apiKey: requireEnv("GROQ_API_KEY"),
    model: optionalEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    temperatureLow: 0.1,
    temperatureHigh: 0.7,
  },

  finnhub: {
    apiKey: requireEnv("FINNHUB_API_KEY"),
    baseUrl: "https://finnhub.io/api/v1",
    timeout: 7000, // 7 seconds — fail fast so UI shows error quickly
  },

  cache: {
    ttlSeconds: parseInt(optionalEnv("CACHE_TTL_SECONDS", 300), 10),
  },

  rateLimit: {
    windowMs: parseInt(optionalEnv("RATE_LIMIT_WINDOW_MS", 60000), 10),
    max: parseInt(optionalEnv("RATE_LIMIT_MAX", 30), 10),
  },

  cors: {
    origins: optionalEnv(
      "CORS_ORIGINS",
      "http://localhost:5173,http://localhost:3000"
    )
      .split(",")
      .map((o) => o.trim()),
  },
};

export default config;
