import http from "node:http";
import { app } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { initRealtime } from "./services/realtime.service.js";

/* Render provides its own port */
const PORT = process.env.PORT || env.port;
let retryTimer = null;

async function start() {
  const server = http.createServer(app);
  initRealtime(server);

  server.listen(PORT, async () => {
    console.log(`MindTrack AI API listening on port ${PORT}`);
    await bootstrapDatabase();
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

async function bootstrapDatabase() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Initial MongoDB connection failed. The API will keep retrying.", error);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (retryTimer) {
    return;
  }

  retryTimer = setTimeout(async () => {
    retryTimer = null;
    await bootstrapDatabase();
  }, env.mongoRetryDelayMs);
}
