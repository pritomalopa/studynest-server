import { Router } from "express";
import {
  getResources,
  getResourceById,
  getMyResources,
  createResource,
  deleteResource,
  addReview,
} from "../controllers/resourceController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getResources);
router.get("/mine", protect, getMyResources);
router.get("/:id", getResourceById);
router.post("/", protect, createResource);
router.delete("/:id", protect, deleteResource);
router.post("/:id/reviews", protect, addReview);

export default router;
