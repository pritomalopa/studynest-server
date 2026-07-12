import { Response } from "express";
import StudyGroup from "../models/StudyGroup";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";

// @route GET /api/study-groups
export const getStudyGroups = asyncHandler(async (req, res: Response) => {
  const { subject, search } = req.query as Record<string, string>;
  const query: Record<string, any> = {};
  if (subject) query.subject = subject;
  if (search) query.name = { $regex: search, $options: "i" };

  const groups = await StudyGroup.find(query)
    .populate("creator", "name avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json(groups);
});

// @route GET /api/study-groups/:id
export const getStudyGroupById = asyncHandler(async (req, res: Response) => {
  const group = await StudyGroup.findById(req.params.id)
    .populate("creator", "name avatarUrl university")
    .populate("members", "name avatarUrl");
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  res.status(200).json(group);
});

// @route POST /api/study-groups
export const createStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, subject, description, coverImageUrl, meetingSchedule } = req.body;
  if (!name || !subject || !description || !meetingSchedule) {
    res.status(400);
    throw new Error("Please fill in all required fields.");
  }

  const group = await StudyGroup.create({
    name,
    subject,
    description,
    coverImageUrl:
      coverImageUrl ||
      "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg",
    meetingSchedule,
    creator: req.user?.id,
    members: [req.user?.id],
  });

  res.status(201).json(group);
});

// @route POST /api/study-groups/:id/join
export const joinStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await StudyGroup.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }

  const userId = req.user?.id as string;
  if (group.members.some((m) => m.toString() === userId)) {
    res.status(400);
    throw new Error("You're already a member of this group.");
  }

  group.members.push(userId as any);
  await group.save();

  res.status(200).json({ message: "Joined the group successfully." });
});

// @route POST /api/study-groups/:id/leave
export const leaveStudyGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await StudyGroup.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }

  const userId = req.user?.id as string;
  group.members = group.members.filter((m) => m.toString() !== userId) as any;
  await group.save();

  res.status(200).json({ message: "Left the group." });
});
