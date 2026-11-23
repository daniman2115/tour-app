import express from "express";
import {
  getPlaces,
  getPlaceById,
  getGuidesForPlace,
  getTopGuides,
  createPlace,
  seedPlaces,
} from "../controllers/placeController.js";

const router = express.Router();

router.get("/", getPlaces);
router.get("/guides/top", getTopGuides);
router.get("/:id", getPlaceById);
router.get("/:id/guides", getGuidesForPlace);
router.post("/", createPlace);
router.post("/seed", seedPlaces);

export default router;
