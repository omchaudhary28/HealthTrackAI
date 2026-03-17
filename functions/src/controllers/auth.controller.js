import { getUserProfile, loginUser, registerUser } from "../services/auth.service.js";

export async function signup(req, res) {
  const result = await registerUser(req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await loginUser(req.body);
  res.status(200).json(result);
}

export async function getMe(req, res) {
  const profile = await getUserProfile(req.user.sub);
  res.status(200).json(profile);
}
