import { Router } from "express";
import {
  getStudyGroups,
  getStudyGroupById,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
} from "../controllers/studyGroupController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getStudyGroups);
router.get("/:id", getStudyGroupById);
router.post("/", protect, createStudyGroup);
router.post("/:id/join", protect, joinStudyGroup);
router.post("/:id/leave", protect, leaveStudyGroup);

export default router;
