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
import { validate } from "../middleware/validate";
import { addReviewSchema, createResourceSchema } from "../validation/schemas";

const router = Router();

router.get("/", getResources);
router.get("/mine", protect, getMyResources);
router.get("/:id", getResourceById);
router.post("/", protect, validate(createResourceSchema), createResource);
router.delete("/:id", protect, deleteResource);
router.post("/:id/reviews", protect, validate(addReviewSchema), addReview);

export default router;
