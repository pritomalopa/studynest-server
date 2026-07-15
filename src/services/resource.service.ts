import Resource from "../models/Resource";
import Review from "../models/Review";

export interface ResourceFilterInput {
  search?: string;
  subject?: string;
  priceType?: string;
  resourceType?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export const getResourcesService = async (filters: ResourceFilterInput) => {
  const {
    search,
    subject,
    priceType,
    resourceType,
    sort = "newest",
    page = "1",
    limit = "12",
  } = filters;

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

  return {
    data,
    page: pageNum,
    totalPages: Math.ceil(totalResults / limitNum) || 1,
    totalResults,
  };
};

export const getResourceByIdService = async (resourceId: string) => {
  const resource = await Resource.findById(resourceId).populate(
    "uploader",
    "name avatarUrl university"
  );

  if (!resource) {
    return null;
  }

  const [related, reviews] = await Promise.all([
    Resource.find({
      subject: resource.subject,
      _id: { $ne: resource._id },
    })
      .limit(4)
      .select("title coverImageUrl subject priceType price avgRating"),
    Review.find({ resource: resource._id })
      .populate("user", "name avatarUrl")
      .sort({ createdAt: -1 }),
  ]);

  return { resource, related, reviews };
};

export const getMyResourcesService = async (userId: string) => {
  return Resource.find({ uploader: userId }).sort({ createdAt: -1 });
};

export const createResourceService = async (data: any, uploaderId: string) => {
  return Resource.create({
    ...data,
    priceType: data.priceType || "free",
    price: data.priceType === "paid" ? Number(data.price) || 0 : 0,
    coverImageUrl:
      data.coverImageUrl ||
      "https://images.pexels.com/photos/1516339/pexels-photo-1516339.jpeg",
    uploader: uploaderId,
  });
};

export const deleteResourceService = async (resourceId: string) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) return null;

  await resource.deleteOne();
  await Review.deleteMany({ resource: resource._id });

  return resource;
};

export const addReviewService = async (resourceId: string, userId: string, reviewData: any) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) return null;

  const existing = await Review.findOne({ resource: resource._id, user: userId });
  if (existing) return { existing: true };

  await Review.create({
    resource: resource._id,
    user: userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
  });

  const reviews = await Review.find({ resource: resource._id });
  resource.reviewCount = reviews.length;
  resource.avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await resource.save();

  return { existing: false, resource };
};
