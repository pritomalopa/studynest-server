import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import {
  buildAuthCookieOptions,
  getMeService,
  googleLoginService,
  loginUserService,
  registerUserService,
  updateProfileService,
} from "../services/auth.service";

const COOKIE_OPTIONS = buildAuthCookieOptions();

// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters long.");
  }

  const result = await registerUserService(req.body);
  if (result.error) {
    res.status(400);
    throw new Error(result.error);
  }

  res.cookie("token", result.token, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: {
      _id: result.user._id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      isTutor: result.user.isTutor,
      token: result.token,
    },
  });
});

// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const result = await loginUserService(email, password);
  if (result.error) {
    res.status(result.error.includes("Google") ? 400 : 401);
    throw new Error(result.error);
  }

  res.cookie("token", result.token, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: {
      _id: result.user._id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      isTutor: result.user.isTutor,
      avatarUrl: result.user.avatarUrl,
      token: result.token,
    },
  });
});

// @route POST /api/auth/google
// Body: { idToken: string } — a Firebase ID token obtained client-side after Google sign-in
export const googleLogin = asyncHandler(async (req, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("Missing Google ID token.");
  }

  const result = await googleLoginService(idToken);
  if (result.error) {
    res.status(401);
    throw new Error(result.error);
  }

  res.cookie("token", result.token, COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: {
      _id: result.user._id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      isTutor: result.user.isTutor,
      avatarUrl: result.user.avatarUrl,
      token: result.token,
    },
  });
});

// @route POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: { message: "Logged out successfully." } });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getMeService(req.user?.id as string);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.status(200).json({ success: true, data: user });
});

// @route PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateProfileService(req.user?.id as string, req.body);
  if (!updated) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({ success: true, data: updated });
});
