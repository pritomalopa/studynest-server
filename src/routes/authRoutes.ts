import { Router } from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getMe,
  updateProfile,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { googleSchema, loginSchema, registerSchema } from "../validation/schemas";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/google", validate(googleSchema), googleLogin);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
