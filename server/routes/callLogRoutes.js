import express from "express";
import {
  getCallLogs,
  createCallLog,
  deleteCallLog,
} from "../controllers/callLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCallLogs);
router.post("/", protect, createCallLog);
router.delete("/:id", protect, deleteCallLog);

export default router;
