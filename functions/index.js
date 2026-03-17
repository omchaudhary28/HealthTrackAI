import express from "express";
import * as functions from "firebase-functions";

let appPromise;

function applyRuntimeConfig() {
  const config = functions.config?.() ?? {};

  if (!process.env.OPENAI_API_KEY && config.openai?.key) {
    process.env.OPENAI_API_KEY = config.openai.key;
  }

  if (!process.env.MONGODB_URI && config.mongodb?.uri) {
    process.env.MONGODB_URI = config.mongodb.uri;
  }

  if (!process.env.JWT_SECRET && config.jwt?.secret) {
    process.env.JWT_SECRET = config.jwt.secret;
  }

  if (!process.env.AI_SERVICE_URL && config.ai?.service_url) {
    process.env.AI_SERVICE_URL = config.ai.service_url;
  }

  if (!process.env.ML_SERVICE_URL && config.ml?.service_url) {
    process.env.ML_SERVICE_URL = config.ml.service_url;
  }

  if (!process.env.OPENAI_MODEL && config.openai?.model) {
    process.env.OPENAI_MODEL = config.openai.model;
  }
}

async function initApp() {
  applyRuntimeConfig();

  const [{ app }, { connectToDatabase }] = await Promise.all([
    import("./src/app.js"),
    import("./src/config/db.js")
  ]);

  const rootApp = express();

  rootApp.use((req, _res, next) => {
    if (req.path === "/" || req.path === "/health" || req.path.startsWith("/api")) {
      return next();
    }

    req.url = `/api${req.url}`;
    return next();
  });

  rootApp.get("/", (_req, res) => {
    res.send("MindTrack API running");
  });

  rootApp.use(app);

  await connectToDatabase();
  return rootApp;
}

export const api = functions.https.onRequest(async (req, res) => {
  if (!appPromise) {
    appPromise = initApp().catch((error) => {
      appPromise = null;
      throw error;
    });
  }

  const app = await appPromise;
  return app(req, res);
});
