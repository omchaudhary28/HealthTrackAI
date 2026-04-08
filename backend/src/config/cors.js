import { env } from "./env.js";
import { HttpError } from "../utils/http-error.js";

const ALLOWED_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Authorization", "Content-Type", "X-Requested-With"];

export function createCorsOptions() {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new HttpError(403, `Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    optionsSuccessStatus: 204,
    maxAge: 86400
  };
}

export function createSocketCorsOptions() {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ALLOWED_HEADERS
  };
}

export function getAllowedOrigins() {
  return [...env.corsAllowedOrigins];
}

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  return env.corsAllowedOrigins.includes("*") || env.corsAllowedOrigins.includes(normalizedOrigin);
}

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/$/, "");
}
