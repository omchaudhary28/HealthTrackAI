import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/mindtrack-ai",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:9000",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "",
  corsAllowedOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  mongoServerSelectionTimeoutMs: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
  mongoRetryDelayMs: Number(process.env.MONGODB_RETRY_DELAY_MS || 15000)
};

function parseOrigins(value) {
  const defaults = [
    "https://healthtrackai-23752.web.app",
    "https://healthtrackai-23752.firebaseapp.com",
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];

  const configured = String(value || "")
    .split(",")
    .map((item) => item.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return [...new Set(configured.length ? configured : defaults)];
}
