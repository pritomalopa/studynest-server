import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  authProvider: "local" | "google";
  firebaseUid?: string;
  role: "student" | "admin";
  university?: string;
  avatarUrl?: string;
  bio?: string;
  isTutor: boolean;
  tutorSubjects: string[];
  hourlyRate?: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Not required for Google-authenticated accounts
    password: { type: String, minlength: 8, select: false },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    firebaseUid: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    university: { type: String, trim: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    isTutor: { type: Boolean, default: false },
    tutorSubjects: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
