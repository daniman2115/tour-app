import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },

    type: {
      type: String,
      enum: [
        "appointment_request",
        "appointment_confirmed",
        "appointment_cancelled",
        "schedule_changed",
        "payment",
      ],
      required: [true, "notification type is required"],
    },

    title: {
      type: String,
      required: [true, "please enter the notification title"],
    },

    body: {
      type: String,
      required: [true, "please enter the notification body"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    relatedId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
