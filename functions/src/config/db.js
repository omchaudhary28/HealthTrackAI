import mongoose from "mongoose";
import { env } from "./env.js";

let connectPromise = null;

export async function connectToDatabase() {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = mongoose
    .connect(env.mongoUri, {
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs
    })
    .then((connection) => {
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
      return connection;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseState() {
  switch (mongoose.connection.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "disconnected";
  }
}
