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
import forumRoutes from "./routes/forum.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import testsRoutes from "./routes/tests.routes.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mindtrack-ai-api",
    disclaimer:
      "MindTrack AI is a wellness support platform and not a medical diagnostic system."
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tests", testsRoutes);
app.use("/api/v1/assessment", assessmentRoutes);
app.use("/api/v1/exercises", exercisesRoutes);
app.use("/api/v1/mood-logs", moodRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/forum-posts", forumRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);
