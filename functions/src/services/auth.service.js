import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { HttpError } from "../utils/http-error.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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
  const { name, email, password, profile } = validateSignupPayload(payload);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    profile
  });

  return { token: signToken(user), user: sanitizeUser(user) };
}

export async function loginUser(payload) {
  const { email, password } = validateLoginPayload(payload);
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
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
  const normalized = normalizeEmail(email);
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

  const name = normalizeOptionalString(payload.name, 80);
  const profileUpdates = sanitizeProfile(payload.profile);
  const updates = {
    ...(name ? { name } : {}),
    ...(profileUpdates
      ? {
          profile: {
            ...(existing.profile || {}),
            ...profileUpdates
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

function validateSignupPayload(payload = {}) {
  const name = normalizeRequiredString(payload.name, "Name", 80);
  const email = normalizeEmail(payload.email);
  const password = normalizePassword(payload.password, { minLength: MIN_PASSWORD_LENGTH });

  return {
    name,
    email,
    password,
    profile: sanitizeProfile(payload.profile) || {}
  };
}

function validateLoginPayload(payload = {}) {
  return {
    email: normalizeEmail(payload.email),
    password: normalizePassword(payload.password)
  };
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "A valid email is required");
  }

  return email;
}

function normalizePassword(value, options = {}) {
  const password = String(value || "");
  if (!password) {
    throw new HttpError(400, "Password is required");
  }

  if (options.minLength && password.length < options.minLength) {
    throw new HttpError(400, `Password must be at least ${options.minLength} characters`);
  }

  if (password.length > 72) {
    throw new HttpError(400, "Password must be 72 characters or fewer");
  }

  return password;
}

function normalizeRequiredString(value, fieldName, maxLength) {
  const normalized = normalizeOptionalString(value, maxLength);
  if (!normalized) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return normalized;
}

function normalizeOptionalString(value, maxLength = 120) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value)
    .trim()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, maxLength);
}

function sanitizeProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return undefined;
  }

  const sanitized = {
    age: normalizeAge(profile.age),
    gender: normalizeOptionalString(profile.gender, 40),
    occupation: normalizeOptionalString(profile.occupation, 80),
    lifestyleIndicators: sanitizeStringArray(profile.lifestyleIndicators, 12, 48),
    stressIndicators: sanitizeStringArray(profile.stressIndicators, 12, 48),
    sleepHabits: normalizeOptionalString(profile.sleepHabits, 120),
    headline: normalizeOptionalString(profile.headline, 120),
    bio: normalizeOptionalString(profile.bio, 500),
    allowDirectMessages:
      typeof profile.allowDirectMessages === "boolean" ? profile.allowDirectMessages : undefined,
    shareProgressPublicly:
      typeof profile.shareProgressPublicly === "boolean" ? profile.shareProgressPublicly : undefined
  };

  return Object.fromEntries(
    Object.entries(sanitized).filter(([, value]) => value !== undefined)
  );
}

function sanitizeStringArray(values, maxItems, maxItemLength) {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const items = values
    .map((value) => normalizeOptionalString(value, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);

  return items;
}

function normalizeAge(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 120) {
    throw new HttpError(400, "Age must be between 1 and 120");
  }

  return Math.round(numeric);
}
