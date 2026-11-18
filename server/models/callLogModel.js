import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: [true, "callId is required"],
    },

    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "initiatorId is required"],
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "receiverId is required"],
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    startedAt: {
      type: Date,
      required: [true, "startedAt is required"],
    },

    endedAt: {
      type: Date,
    },

    duration: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: [true, "call type is required"],
    },

    recordingUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CallLog", callLogSchema);
