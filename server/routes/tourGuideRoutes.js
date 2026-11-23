import express from "express";
import {
  getGuides,
  getGuideById,
  getMyGuideProfile,
  createGuideProfile,
  updateMyGuideProfile,
} from "../controllers/tourGuideController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getGuides);
router.get("/my", protect, getMyGuideProfile);
router.get("/:id", getGuideById);
router.post("/", protect, createGuideProfile);
router.put("/my", protect, updateMyGuideProfile);

export default router;
