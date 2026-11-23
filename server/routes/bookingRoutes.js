import express from "express";
import {
  getMyBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.post("/", protect, createBooking);
router.patch("/:id/status", protect, updateBookingStatus);

export default router;
