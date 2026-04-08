import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import assessmentRoutes from "./routes/assessment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import exercisesRoutes from "./routes/exercises.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import testsRoutes from "./routes/tests.routes.js";
import userRoutes from "./routes/user.routes.js";
import { createCorsOptions, getAllowedOrigins } from "./config/cors.js";
import { getDatabaseState, isDatabaseReady } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

export const app = express();
const corsOptions = createCorsOptions();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "mindtrack-ai-api",
    message: "MindTrack AI API is running",
    database: getDatabaseState(),
    allowedOrigins: getAllowedOrigins(),
    disclaimer:
      "MindTrack AI is a wellness support platform and not a medical diagnostic system."
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "mindtrack-ai-api",
    database: getDatabaseState(),
    uptimeSeconds: Math.round(process.uptime()),
    disclaimer:
      "MindTrack AI is a wellness support platform and not a medical diagnostic system."
  });
});

app.get("/ready", (_req, res) => {
  const ready = isDatabaseReady();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "starting",
    service: "mindtrack-ai-api",
    database: getDatabaseState()
  });
});

app.use("/api", (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (isDatabaseReady()) {
    return next();
  }

  return res.status(503).json({
    error: "API is starting up. Please retry in a few seconds.",
    service: "mindtrack-ai-api",
    database: getDatabaseState()
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/tests", testsRoutes);
app.use("/api/v1/assessment", assessmentRoutes);
app.use("/api/v1/exercises", exercisesRoutes);
app.use("/api/v1/mood-logs", moodRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/forum-posts", forumRoutes);
app.use("/api/v1/community", forumRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use("/api/chat", chatRoutes);

app.use(errorHandler);
