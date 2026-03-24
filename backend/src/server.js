import http from "node:http";
import { app } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { initRealtime } from "./services/realtime.service.js";

/* Render provides its own port */
const PORT = process.env.PORT || env.port;

async function start() {
  await connectToDatabase();
  const server = http.createServer(app);
  initRealtime(server);

  server.listen(PORT, () => {
    console.log(`MindTrack AI API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
