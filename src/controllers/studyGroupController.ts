import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import {
  createStudyGroupService,
  getStudyGroupByIdService,
  getStudyGroupsService,
  joinStudyGroupService,
  leaveStudyGroupService,
} from "../services/studyGroup.service";
import { toSafeString } from "../utils/sanitize";

// @route GET /api/study-groups
export const getStudyGroups = asyncHandler(async (req, res: Response) => {
  const subject = toSafeString(req.query.subject);
  const search = toSafeString(req.query.search);
  const groups = await getStudyGroupsService(subject, search);

  res.status(200).json({ success: true, data: groups });
});

// @route GET /api/study-groups/:id
export const getStudyGroupById = asyncHandler(async (req, res: Response) => {
  const group = await getStudyGroupByIdService(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  res.status(200).json({ success: true, data: group });
});

// @route POST /api/study-groups
export const createStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, subject, description, coverImageUrl, meetingSchedule } = req.body;
  if (!name || !subject || !description || !meetingSchedule) {
    res.status(400);
    throw new Error("Please fill in all required fields.");
  }

  const group = await createStudyGroupService(
    { name, subject, description, coverImageUrl, meetingSchedule },
    req.user?.id as string
  );

  res.status(201).json({ success: true, data: group });
});

// @route POST /api/study-groups/:id/join
export const joinStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await joinStudyGroupService(req.params.id, req.user?.id as string);
  if (!result) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  if (result.alreadyMember) {
    res.status(400);
    throw new Error("You're already a member of this group.");
  }

  res.status(200).json({ success: true, data: { message: "Joined the group successfully." } });
});

// @route POST /api/study-groups/:id/leave
export const leaveStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await leaveStudyGroupService(req.params.id, req.user?.id as string);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }

  res.status(200).json({ success: true, data: { message: "Left the group." } });
});
