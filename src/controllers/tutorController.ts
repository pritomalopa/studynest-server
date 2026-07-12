import { Response } from "express";
import User from "../models/User";
import Booking from "../models/Booking";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";

// @route GET /api/tutors
export const getTutors = asyncHandler(async (req, res: Response) => {
  const { subject, maxRate } = req.query as Record<string, string>;
  const query: Record<string, any> = { isTutor: true };
  if (subject) query.tutorSubjects = subject;
  if (maxRate) query.hourlyRate = { $lte: Number(maxRate) };

  const tutors = await User.find(query).select(
    "name avatarUrl university bio tutorSubjects hourlyRate"
  );
  res.status(200).json(tutors);
});

// @route GET /api/tutors/:id
export const getTutorById = asyncHandler(async (req, res: Response) => {
  const tutor = await User.findOne({ _id: req.params.id, isTutor: true }).select(
    "name avatarUrl university bio tutorSubjects hourlyRate"
  );
  if (!tutor) {
    res.status(404);
    throw new Error("Tutor not found.");
  }
  res.status(200).json(tutor);
});

// @route POST /api/tutors/:id/book
export const bookTutor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subject, date, timeSlot } = req.body;
  if (!subject || !date || !timeSlot) {
    res.status(400);
    throw new Error("Subject, date, and time slot are required.");
  }

  const tutor = await User.findOne({ _id: req.params.id, isTutor: true });
  if (!tutor) {
    res.status(404);
    throw new Error("Tutor not found.");
  }

  if (tutor._id.toString() === req.user?.id) {
    res.status(400);
    throw new Error("You can't book a session with yourself.");
  }

  const booking = await Booking.create({
    tutor: tutor._id,
    student: req.user?.id,
    subject,
    date,
    timeSlot,
  });

  res.status(201).json(booking);
});

// @route GET /api/tutors/bookings/mine
export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const asStudent = await Booking.find({ student: req.user?.id })
    .populate("tutor", "name avatarUrl")
    .sort({ createdAt: -1 });
  const asTutor = await Booking.find({ tutor: req.user?.id })
    .populate("student", "name avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({ asStudent, asTutor });
});
