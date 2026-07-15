import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { getFirebaseAdmin } from "../config/firebase";
import { UserRole } from "../types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const buildAuthCookieOptions = () => COOKIE_OPTIONS;

export const registerUserService = async (data: any): Promise<{ user?: any; token?: string; error?: string }> => {
  const { name, email, password, university, isTutor, tutorSubjects, hourlyRate } = data;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { error: "An account with this email already exists." };
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
  return { user, token };
};

export const loginUserService = async (email: string, password: string): Promise<{ user?: any; token?: string; error?: string }> => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return { error: "Invalid email or password." };
  }

  if (!user.password) {
    return { error: "This account was created with Google sign-in. Please use 'Continue with Google' instead." };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "Invalid email or password." };
  }

  const token = generateToken(user._id.toString(), user.role);
  return { user, token };
};

export const googleLoginService = async (idToken: string): Promise<{ user?: any; token?: string; error?: string }> => {
  const admin = getFirebaseAdmin();
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    return { error: "Invalid or expired Google sign-in. Please try again." };
  }

  const { uid, email, name, picture } = decoded;
  if (!email) {
    return { error: "Your Google account has no email associated with it." };
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
    user.firebaseUid = uid;
    user.authProvider = "google";
    if (picture && !user.avatarUrl) user.avatarUrl = picture;
    await user.save();
  }

  const token = generateToken(user._id.toString(), user.role);
  return { user, token };
};

export const getMeService = async (userId: string) => {
  return User.findById(userId);
};

export const updateProfileService = async (userId: string, data: any) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const { name, university, bio, avatarUrl, isTutor, tutorSubjects, hourlyRate } = data;

  user.name = name ?? user.name;
  user.university = university ?? user.university;
  user.bio = bio ?? user.bio;
  user.avatarUrl = avatarUrl ?? user.avatarUrl;
  if (typeof isTutor === "boolean") user.isTutor = isTutor;
  if (Array.isArray(tutorSubjects)) user.tutorSubjects = tutorSubjects;
  if (typeof hourlyRate === "number") user.hourlyRate = hourlyRate;

  return user.save();
};
