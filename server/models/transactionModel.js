import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "bookingId is required"],
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "payerId is required"],
    },

    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "payeeId is required"],
    },

    amount: {
      type: Number,
      required: [true, "please enter the amount"],
    },

    method: {
      type: String,
      enum: ["credit_card", "paypal", "apple_pay"],
      required: [true, "please enter the payment method"],
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    externalRef: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);
