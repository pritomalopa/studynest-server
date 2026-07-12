import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  tutor: Types.ObjectId;
  student: Types.ObjectId;
  subject: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    tutor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IBooking>("Booking", bookingSchema);
