import { Response } from "express";
import Resource from "../models/Resource";
import Review from "../models/Review";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";

// @route GET /api/resources
// Supports: search, subject filter, priceType filter, resourceType filter, sort, pagination
export const getResources = asyncHandler(async (req, res: Response) => {
  const {
    search,
    subject,
    priceType,
    resourceType,
    sort = "newest",
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const query: Record<string, any> = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (subject) query.subject = subject;
  if (priceType) query.priceType = priceType;
  if (resourceType) query.resourceType = resourceType;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    rating: { avgRating: -1 },
    popular: { downloadCount: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
  const skip = (pageNum - 1) * limitNum;

  const [data, totalResults] = await Promise.all([
    Resource.find(query)
      .populate("uploader", "name avatarUrl")
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Resource.countDocuments(query),
  ]);

  res.status(200).json({
    data,
    page: pageNum,
    totalPages: Math.ceil(totalResults / limitNum) || 1,
    totalResults,
  });
});

// @route GET /api/resources/:id
export const getResourceById = asyncHandler(async (req, res: Response) => {
  const resource = await Resource.findById(req.params.id).populate(
    "uploader",
    "name avatarUrl university"
  );
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found.");
  }

  const related = await Resource.find({
    subject: resource.subject,
    _id: { $ne: resource._id },
  })
    .limit(4)
    .select("title coverImageUrl subject priceType price avgRating");

  const reviews = await Review.find({ resource: resource._id })
    .populate("user", "name avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({ resource, related, reviews });
});

// @route GET /api/resources/mine
export const getMyResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resources = await Resource.find({ uploader: req.user?.id }).sort({ createdAt: -1 });
  res.status(200).json(resources);
});

// @route POST /api/resources
export const createResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    title,
    shortDescription,
    fullDescription,
    subject,
    resourceType,
    priceType,
    price,
    coverImageUrl,
    fileUrl,
  } = req.body;

  if (!title || !shortDescription || !fullDescription || !subject || !resourceType || !fileUrl) {
    res.status(400);
    throw new Error("Please fill in all required fields.");
  }

  const resource = await Resource.create({
    title,
    shortDescription,
    fullDescription,
    subject,
    resourceType,
    priceType: priceType || "free",
    price: priceType === "paid" ? Number(price) || 0 : 0,
    coverImageUrl:
      coverImageUrl ||
      "https://images.pexels.com/photos/1516339/pexels-photo-1516339.jpeg",
    fileUrl,
    uploader: req.user?.id,
  });

  res.status(201).json(resource);
});

// @route DELETE /api/resources/:id
export const deleteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found.");
  }

  const isOwner = resource.uploader.toString() === req.user?.id;
  const isAdmin = req.user?.role === "admin";
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("You can only delete your own resources.");
  }

  await resource.deleteOne();
  await Review.deleteMany({ resource: resource._id });

  res.status(200).json({ message: "Resource deleted successfully." });
});

// @route POST /api/resources/:id/reviews
export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found.");
  }
  if (!rating || !comment) {
    res.status(400);
    throw new Error("Rating and comment are required.");
  }

  const existing = await Review.findOne({ resource: resource._id, user: req.user?.id });
  if (existing) {
    res.status(400);
    throw new Error("You've already reviewed this resource.");
  }

  await Review.create({
    resource: resource._id,
    user: req.user?.id,
    rating,
    comment,
  });

  const reviews = await Review.find({ resource: resource._id });
  resource.reviewCount = reviews.length;
  resource.avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await resource.save();

  res.status(201).json({ message: "Review added." });
});
