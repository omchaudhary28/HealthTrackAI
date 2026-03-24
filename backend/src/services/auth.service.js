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
    id: String(user.id || user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    baselineComplete: user.baselineComplete
  };
}

export async function registerUser(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    name: payload.name,
    email,
    passwordHash,
    profile: payload.profile || {}
  });

  return { token: signToken(user), user: sanitizeUser(user) };
}

export async function loginUser(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const user = await User.findOne({ email });
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

export async function lookupUserByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    throw new HttpError(400, "Email is required");
  }

  const user = await User.findOne({ email: normalized }).select("name email baselineComplete").lean();

  return {
    exists: Boolean(user),
    recommendedMode: user ? "login" : "signup",
    name: user?.name || null,
    baselineComplete: Boolean(user?.baselineComplete)
  };
}

export async function updateUserProfile(userId, payload = {}) {
  const existing = await User.findById(userId).lean();
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const updates = {
    ...(payload.name ? { name: String(payload.name).trim() } : {}),
    ...(payload.profile && typeof payload.profile === "object"
      ? {
          profile: {
            ...(existing.profile || {}),
            age: payload.profile.age ?? existing.profile?.age,
            gender: payload.profile.gender ?? existing.profile?.gender,
            occupation: payload.profile.occupation ?? existing.profile?.occupation,
            lifestyleIndicators: Array.isArray(payload.profile.lifestyleIndicators)
              ? payload.profile.lifestyleIndicators
              : existing.profile?.lifestyleIndicators,
            stressIndicators: Array.isArray(payload.profile.stressIndicators)
              ? payload.profile.stressIndicators
              : existing.profile?.stressIndicators,
            sleepHabits: payload.profile.sleepHabits ?? existing.profile?.sleepHabits
          }
        }
      : {})
  };

  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return sanitizeUser(user);
}
