import { Router } from "express";
import {
  getTutors,
  getTutorById,
  bookTutor,
  getMyBookings,
} from "../controllers/tutorController";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bookTutorSchema } from "../validation/schemas";

const router = Router();

router.get("/", getTutors);
router.get("/bookings/mine", protect, getMyBookings);
router.get("/:id", getTutorById);
router.post("/:id/book", protect, validate(bookTutorSchema), bookTutor);

export default router;
