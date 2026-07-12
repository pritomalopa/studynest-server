import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { generateToken } from "../utils/generateToken";
import { getFirebaseAdmin } from "../config/firebase";
import { AuthRequest } from "../types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req, res: Response) => {
  const { name, email, password, university, isTutor, tutorSubjects, hourlyRate } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters long.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    university,
    isTutor: !!isTutor,
    tutorSubjects: isTutor && Array.isArray(tutorSubjects) ? tutorSubjects : [],
    hourlyRate: isTutor ? hourlyRate || 0 : 0,
  });

  const token = generateToken(user._id.toString(), user.role);
  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isTutor: user.isTutor,
    token, // also returned in body for clients that prefer header-based auth
  });
});

// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (!user.password) {
    res.status(400);
    throw new Error("This account was created with Google sign-in. Please use 'Continue with Google' instead.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  const token = generateToken(user._id.toString(), user.role);
  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isTutor: user.isTutor,
    avatarUrl: user.avatarUrl,
    token,
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

  const admin = getFirebaseAdmin();
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired Google sign-in. Please try again.");
  }

  const { uid, email, name, picture } = decoded;
  if (!email) {
    res.status(400);
    throw new Error("Your Google account has no email associated with it.");
  }

  let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] });

  if (!user) {
    user = await User.create({
      name: name || email.split("@")[0],
      email: email.toLowerCase(),
      authProvider: "google",
      firebaseUid: uid,
      avatarUrl: picture || "",
    });
  } else if (!user.firebaseUid) {
    // An account with this email already existed via normal signup — link it to Google
    user.firebaseUid = uid;
    user.authProvider = "google";
    if (picture && !user.avatarUrl) user.avatarUrl = picture;
    await user.save();
  }

  const token = generateToken(user._id.toString(), user.role);
  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isTutor: user.isTutor,
    avatarUrl: user.avatarUrl,
    token,
  });
});

// @route POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out successfully." });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.status(200).json(user);
});

// @route PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const { name, university, bio, avatarUrl, isTutor, tutorSubjects, hourlyRate } = req.body;

  user.name = name ?? user.name;
  user.university = university ?? user.university;
  user.bio = bio ?? user.bio;
  user.avatarUrl = avatarUrl ?? user.avatarUrl;
  if (typeof isTutor === "boolean") user.isTutor = isTutor;
  if (Array.isArray(tutorSubjects)) user.tutorSubjects = tutorSubjects;
  if (typeof hourlyRate === "number") user.hourlyRate = hourlyRate;

  const updated = await user.save();
  res.status(200).json(updated);
});
