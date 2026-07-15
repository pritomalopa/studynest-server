import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { bookTutorService, getMyBookingsService, getTutorByIdService, getTutorsService } from "../services/tutor.service";
import { toSafeString } from "../utils/sanitize";

// @route GET /api/tutors
export const getTutors = asyncHandler(async (req, res: Response) => {
  const subject = toSafeString(req.query.subject);
  const maxRate = toSafeString(req.query.maxRate);
  const tutors = await getTutorsService(subject, maxRate);
  res.status(200).json({ success: true, data: tutors });
});

// @route GET /api/tutors/:id
export const getTutorById = asyncHandler(async (req, res: Response) => {
  const tutor = await getTutorByIdService(req.params.id);
  if (!tutor) {
    res.status(404);
    throw new Error("Tutor not found.");
  }
  res.status(200).json({ success: true, data: tutor });
});

// @route POST /api/tutors/:id/book
export const bookTutor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subject, date, timeSlot } = req.body;
  if (!subject || !date || !timeSlot) {
    res.status(400);
    throw new Error("Subject, date, and time slot are required.");
  }

  const result = await bookTutorService(req.params.id, req.user?.id as string, { subject, date, timeSlot });
  if (!result) {
    res.status(404);
    throw new Error("Tutor not found.");
  }

  if (result.selfBooking) {
    res.status(400);
    throw new Error("You can't book a session with yourself.");
  }

  res.status(201).json({ success: true, data: result });
});

// @route GET /api/tutors/bookings/mine
export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload = await getMyBookingsService(req.user?.id as string);
  res.status(200).json({ success: true, data: payload });
});
