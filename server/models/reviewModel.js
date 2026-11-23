import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "TourGuide", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    tipAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);