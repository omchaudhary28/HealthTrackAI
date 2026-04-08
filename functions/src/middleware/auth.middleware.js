import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export function requireAuth(req, _res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(new HttpError(401, "Authentication required"));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return next(new HttpError(401, error?.name === "TokenExpiredError" ? "Token expired" : "Invalid token"));
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }

  return next();
}

function extractBearerToken(value) {
  const [scheme, token] = String(value || "").trim().split(/\s+/);
  return /^Bearer$/i.test(scheme || "") && token ? token : "";
}
