import User from "../models/User";
import Booking from "../models/Booking";

export const getTutorsService = async (subject?: string, maxRate?: string) => {
  const query: Record<string, any> = { isTutor: true };
  if (subject) query.tutorSubjects = subject;
  if (maxRate) query.hourlyRate = { $lte: Number(maxRate) };

  return User.find(query).select(
    "name avatarUrl university bio tutorSubjects hourlyRate"
  );
};

export const getTutorByIdService = async (tutorId: string) => {
  return User.findOne({ _id: tutorId, isTutor: true }).select(
    "name avatarUrl university bio tutorSubjects hourlyRate"
  );
};

export const bookTutorService = async (tutorId: string, userId: string, bookingData: any): Promise<any | { selfBooking: boolean }> => {
  const tutor = await User.findOne({ _id: tutorId, isTutor: true });
  if (!tutor) return null;

  if (tutor._id.toString() === userId) {
    return { selfBooking: true };
  }

  return Booking.create({
    tutor: tutor._id,
    student: userId,
    subject: bookingData.subject,
    date: bookingData.date,
    timeSlot: bookingData.timeSlot,
  });
};

export const getMyBookingsService = async (userId: string) => {
  const [asStudent, asTutor] = await Promise.all([
    Booking.find({ student: userId }).populate("tutor", "name avatarUrl").sort({ createdAt: -1 }),
    Booking.find({ tutor: userId }).populate("student", "name avatarUrl").sort({ createdAt: -1 }),
  ]);

  return { asStudent, asTutor };
};
