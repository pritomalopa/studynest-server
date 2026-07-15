import { Router } from "express";
import {
  getStudyGroups,
  getStudyGroupById,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
} from "../controllers/studyGroupController";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createStudyGroupSchema } from "../validation/schemas";

const router = Router();

router.get("/", getStudyGroups);
router.get("/:id", getStudyGroupById);
router.post("/", protect, validate(createStudyGroupSchema), createStudyGroup);
router.post("/:id/join", protect, joinStudyGroup);
router.post("/:id/leave", protect, leaveStudyGroup);

export default router;
