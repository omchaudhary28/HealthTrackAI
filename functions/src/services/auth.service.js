import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { HttpError } from "../utils/http-error.js";

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: "7d"
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    baselineComplete: user.baselineComplete
  };
}

export async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    name: payload.name,
    email: payload.email.toLowerCase(),
    passwordHash,
    profile: payload.profile || {}
  });

  return { token: signToken(user), user: sanitizeUser(user) };
}

export async function loginUser(payload) {
  const user = await User.findOne({ email: payload.email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(payload.password, user.passwordHash);
  if (!matches) {
    throw new HttpError(401, "Invalid email or password");
  }

  return { token: signToken(user), user: sanitizeUser(user) };
}

export async function getUserProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return sanitizeUser(user);
}
