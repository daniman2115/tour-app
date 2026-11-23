import express from "express";
import { getGuideReviews, createReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/guide/:guideId", getGuideReviews);
router.post("/", protect, createReview);

export default router;
