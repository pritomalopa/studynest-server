import { Router } from "express";
import {
  getStats,
  getAllResourcesAdmin,
  getAllUsers,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/resources", getAllResourcesAdmin);
router.get("/users", getAllUsers);

export default router;
