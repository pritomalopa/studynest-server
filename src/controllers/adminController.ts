import { Response } from "express";
import User from "../models/User";
import Resource from "../models/Resource";
import StudyGroup from "../models/StudyGroup";
import Booking from "../models/Booking";
import { asyncHandler } from "../utils/asyncHandler";

// @route GET /api/admin/stats
export const getStats = asyncHandler(async (req, res: Response) => {
  const [totalUsers, totalTutors, totalResources, totalGroups, totalBookings] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isTutor: true }),
      Resource.countDocuments(),
      StudyGroup.countDocuments(),
      Booking.countDocuments(),
    ]);

  // Resources uploaded per subject — for a bar/pie chart
  const bySubject = await Resource.aggregate([
    { $group: { _id: "$subject", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Resources uploaded per month (last 6 months) — for a line/bar chart
  const byMonth = await Resource.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ]);

  res.status(200).json({
    totals: { totalUsers, totalTutors, totalResources, totalGroups, totalBookings },
    bySubject: bySubject.map((s) => ({ subject: s._id, count: s.count })),
    byMonth: byMonth.map((m) => ({ month: m._id, count: m.count })),
  });
});

// @route GET /api/admin/resources  (all resources, for moderation table)
export const getAllResourcesAdmin = asyncHandler(async (req, res: Response) => {
  const resources = await Resource.find()
    .populate("uploader", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(resources);
});

// @route GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res: Response) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json(users);
});
