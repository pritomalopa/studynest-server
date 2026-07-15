import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import {
  addReviewService,
  createResourceService,
  deleteResourceService,
  getMyResourcesService,
  getResourceByIdService,
  getResourcesService,
} from "../services/resource.service";
import { toSafeString } from "../utils/sanitize";

// @route GET /api/resources
// Supports: search, subject filter, priceType filter, resourceType filter, sort, pagination
export const getResources = asyncHandler(async (req, res: Response) => {
  const rawSearch = toSafeString(req.query.search);
  const rawSubject = toSafeString(req.query.subject);
  const rawPriceType = toSafeString(req.query.priceType);
  const rawResourceType = toSafeString(req.query.resourceType);
  const rawSort = toSafeString(req.query.sort);
  const rawPage = toSafeString(req.query.page);
  const rawLimit = toSafeString(req.query.limit);

  const payload = await getResourcesService({
    search: rawSearch,
    subject: rawSubject,
    priceType: rawPriceType,
    resourceType: rawResourceType,
    sort: rawSort,
    page: rawPage,
    limit: rawLimit,
  });

  res.status(200).json({ success: true, data: payload });
});

// @route GET /api/resources/:id
export const getResourceById = asyncHandler(async (req, res: Response) => {
  const payload = await getResourceByIdService(req.params.id);
  if (!payload) {
    res.status(404);
    throw new Error("Resource not found.");
  }

  res.status(200).json({ success: true, data: payload });
});

// @route GET /api/resources/mine
export const getMyResources = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resources = await getMyResourcesService(req.user?.id as string);
  res.status(200).json({ success: true, data: resources });
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

  const resource = await createResourceService(
    {
      title,
      shortDescription,
      fullDescription,
      subject,
      resourceType,
      priceType,
      price,
      coverImageUrl,
      fileUrl,
    },
    req.user?.id as string
  );

  res.status(201).json({ success: true, data: resource });
});

// @route DELETE /api/resources/:id
export const deleteResource = asyncHandler(async (req: AuthRequest, res: Response) => {
  const resource = await deleteResourceService(req.params.id);
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

  res.status(200).json({ success: true, data: { message: "Resource deleted successfully." } });
});

// @route POST /api/resources/:id/reviews
export const addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, comment } = req.body;
  const result = await addReviewService(req.params.id, req.user?.id as string, { rating, comment });
  if (!result) {
    res.status(404);
    throw new Error("Resource not found.");
  }
  if (result.existing) {
    res.status(400);
    throw new Error("You've already reviewed this resource.");
  }

  res.status(201).json({ success: true, data: { message: "Review added." } });
});
