import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/mindtrack-ai",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:9000",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || ""
};
