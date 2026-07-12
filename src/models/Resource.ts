import { Schema, model, Document, Types } from "mongoose";

export type ResourceType = "notes" | "book" | "slides" | "video";
export type PriceType = "free" | "paid";

export interface IResource extends Document {
  _id: Types.ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  subject: string;
  resourceType: ResourceType;
  priceType: PriceType;
  price: number;
  coverImageUrl: string;
  fileUrl: string;
  uploader: Types.ObjectId;
  avgRating: number;
  reviewCount: number;
  downloadCount: number;
  createdAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    resourceType: {
      type: String,
      enum: ["notes", "book", "slides", "video"],
      required: true,
    },
    priceType: { type: String, enum: ["free", "paid"], default: "free" },
    price: { type: Number, default: 0 },
    coverImageUrl: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text", shortDescription: "text" });

export default model<IResource>("Resource", resourceSchema);
