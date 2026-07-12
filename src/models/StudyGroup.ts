import { Schema, model, Document, Types } from "mongoose";

export interface IStudyGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  description: string;
  coverImageUrl: string;
  creator: Types.ObjectId;
  members: Types.ObjectId[];
  meetingSchedule: string;
  createdAt: Date;
}

const studyGroupSchema = new Schema<IStudyGroup>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    meetingSchedule: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IStudyGroup>("StudyGroup", studyGroupSchema);
