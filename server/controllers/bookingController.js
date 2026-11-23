import asyncHandler from "express-async-handler";
import Booking from "../models/bookingModel.js";
import TourGuide from "../models/tourGuide.js";
import Notification from "../models/notificationModel.js";

// GET /api/bookings/my — bookings for the logged-in user (as traveler or guide)
export const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find guide profile if user is a guide
  const guideProfile = await TourGuide.findOne({ userId });

  const orQuery = [{ visitorId: userId }];
  if (guideProfile) orQuery.push({ guideId: guideProfile._id });

  const bookings = await Booking.find({ $or: orQuery })
    .populate({ path: "visitorId", select: "name profileImage" })
    .populate({
      path: "guideId",
      select: "title location rating totalReviews pricePerHour profileImage",
      populate: { path: "userId", select: "name profileImage" },
    })
    .sort({ scheduledAt: -1 });

  res.json(bookings);
});

// GET /api/bookings/:id
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("visitorId", "name profileImage")
    .populate({
      path: "guideId",
      populate: { path: "userId", select: "name profileImage" },
    });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  res.json(booking);
});

// POST /api/bookings — create a new booking (traveler)
export const createBooking = asyncHandler(async (req, res) => {
  const { guideId, scheduledAt, duration, notes } = req.body;

  if (!guideId || !scheduledAt) {
    res.status(400);
    throw new Error("guideId and scheduledAt are required");
  }

  const guide = await TourGuide.findById(guideId).populate("userId", "name");
  if (!guide) {
    res.status(404);
    throw new Error("Guide not found");
  }

  const durationMinutes = duration || 60;
  const price = (guide.pricePerHour / 60) * durationMinutes;

  const booking = await Booking.create({
    visitorId: req.user._id,
    guideId,
    scheduledAt,
    duration: durationMinutes,
    price: Math.round(price * 100) / 100,
    status: "pending",
    paymentStatus: "pending",
    notes: notes || "",
  });

  // Notify the guide
  await Notification.create({
    userId: guide.userId._id,
    type: "appointment_request",
    title: "New booking request",
    body: `${req.user.name} wants to book a tour on ${new Date(scheduledAt).toDateString()}.`,
    relatedId: booking._id.toString(),
  });

  res.status(201).json(booking);
});

// PATCH /api/bookings/:id/status — guide accepts/declines/cancels
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["confirmed", "cancelled", "completed"];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const booking = await Booking.findById(req.params.id)
    .populate("visitorId", "name")
    .populate({ path: "guideId", populate: { path: "userId", select: "_id" } });

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Authorization: guide or the traveler can update
  const guideUserId = booking.guideId?.userId?._id?.toString();
  const visitorId = booking.visitorId?._id?.toString();
  const requesterId = req.user._id.toString();

  if (requesterId !== guideUserId && requesterId !== visitorId) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.status = status;
  await booking.save();

  // Notify the other party
  const notifyUserId =
    requesterId === guideUserId
      ? booking.visitorId._id
      : booking.guideId.userId._id;

  const typeMap = {
    confirmed: "appointment_confirmed",
    cancelled: "appointment_cancelled",
    completed: "appointment_confirmed",
  };

  await Notification.create({
    userId: notifyUserId,
    type: typeMap[status],
    title:
      status === "confirmed"
        ? "Booking confirmed"
        : status === "cancelled"
        ? "Booking canceled"
        : "Call completed",
    body:
      status === "confirmed"
        ? `Your booking on ${new Date(booking.scheduledAt).toDateString()} has been confirmed.`
        : status === "cancelled"
        ? `The booking on ${new Date(booking.scheduledAt).toDateString()} was canceled.`
        : `Your call on ${new Date(booking.scheduledAt).toDateString()} is now complete.`,
    relatedId: booking._id.toString(),
  });

  res.json(booking);
});
