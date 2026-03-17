import { app } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectToDatabase();
  app.listen(env.port, () => {
    console.log(`MindTrack AI API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
