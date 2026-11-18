import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "visitorId is required"],
    },

    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourGuide",
      required: [true, "guideId is required"],
    },

    scheduledAt: {
      type: Date,
      required: [true, "please enter the scheduled date and time"],
    },

    duration: {
      type: Number,
      required: [true, "please enter the duration in minutes"],
      default: 60,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    price: {
      type: Number,
      required: [true, "please enter the price"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    streamCallId: {
      type: String,
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Booking", bookingSchema);
