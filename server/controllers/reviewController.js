import asyncHandler from "express-async-handler";
import Review from "../models/reviewModel.js";
import Booking from "../models/bookingModel.js";
import TourGuide from "../models/tourGuide.js";

// GET /api/reviews/guide/:guideId
export const getGuideReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ guideId: req.params.guideId })
    .populate("visitorId", "name profileImage")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// POST /api/reviews — submit a review after a completed call
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, tipAmount } = req.body;

  if (!bookingId || !rating) {
    res.status(400);
    throw new Error("bookingId and rating are required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.visitorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the traveler can review this booking");
  }

  if (booking.status !== "completed") {
    res.status(400);
    throw new Error("Can only review completed bookings");
  }

  // Prevent duplicate reviews
  const existing = await Review.findOne({ bookingId });
  if (existing) {
    res.status(400);
    throw new Error("You already reviewed this booking");
  }

  const review = await Review.create({
    bookingId,
    visitorId: req.user._id,
    guideId: booking.guideId,
    rating,
    comment: comment || "",
    tipAmount: tipAmount || 0,
  });

  // Recompute guide's average rating
  const allReviews = await Review.find({ guideId: booking.guideId });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await TourGuide.findByIdAndUpdate(booking.guideId, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: allReviews.length,
  });

  res.status(201).json(review);
});
