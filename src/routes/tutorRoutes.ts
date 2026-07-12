import { Router } from "express";
import {
  getTutors,
  getTutorById,
  bookTutor,
  getMyBookings,
} from "../controllers/tutorController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getTutors);
router.get("/bookings/mine", protect, getMyBookings);
router.get("/:id", getTutorById);
router.post("/:id/book", protect, bookTutor);

export default router;
