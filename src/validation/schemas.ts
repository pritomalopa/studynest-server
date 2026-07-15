import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  university: z.string().optional(),
  isTutor: z.boolean().optional(),
  tutorSubjects: z.array(z.string()).optional(),
  hourlyRate: z.union([z.string(), z.number()]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(1, "Password is required"),
});

export const googleSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export const createResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  fullDescription: z.string().min(1, "Full description is required"),
  subject: z.string().min(1, "Subject is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  priceType: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  coverImageUrl: z.string().optional(),
  fileUrl: z.string().min(1, "File URL is required"),
});

export const createStudyGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  coverImageUrl: z.string().optional(),
  meetingSchedule: z.string().min(1, "Meeting schedule is required"),
});

export const bookTutorSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
});

export const addReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});
