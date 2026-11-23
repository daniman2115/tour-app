import asyncHandler from "express-async-handler";
import CallLog from "../models/callLogModel.js";

// GET /api/calls — call logs for the logged-in user
export const getCallLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const logs = await CallLog.find({
    $or: [{ initiatorId: userId }, { receiverId: userId }],
  })
    .populate("initiatorId", "name profileImage")
    .populate("receiverId", "name profileImage")
    .sort({ startedAt: -1 });

  // Shape for the client: add `type` (incoming/outgoing/missed) from requester perspective
  const shaped = logs.map((log) => {
    const isInitiator = log.initiatorId._id.toString() === userId.toString();
    const otherUser = isInitiator ? log.receiverId : log.initiatorId;
    const duration = log.duration || 0;

    let type;
    if (log.type === "missed") {
      type = "missed";
    } else if (isInitiator) {
      type = duration > 0 ? "outgoing" : "outgoing"; // not answered = outgoing with duration 0
    } else {
      type = "incoming";
    }

    return {
      _id: log._id,
      callId: log.callId,
      name: otherUser?.name || "Unknown",
      profileImage: otherUser?.profileImage || null,
      type,
      duration,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      recordingUrl: log.recordingUrl || null,
      bookingId: log.bookingId,
    };
  });

  res.json(shaped);
});

// POST /api/calls — save a call log (called after a stream video call ends)
export const createCallLog = asyncHandler(async (req, res) => {
  const { callId, receiverId, startedAt, endedAt, duration, type, recordingUrl, bookingId } = req.body;

  if (!callId || !receiverId || !startedAt) {
    res.status(400);
    throw new Error("callId, receiverId, and startedAt are required");
  }

  const log = await CallLog.create({
    callId,
    initiatorId: req.user._id,
    receiverId,
    startedAt,
    endedAt: endedAt || null,
    duration: duration || 0,
    type: type || "outgoing",
    recordingUrl: recordingUrl || null,
    bookingId: bookingId || null,
  });

  res.status(201).json(log);
});

// DELETE /api/calls/:id
export const deleteCallLog = asyncHandler(async (req, res) => {
  await CallLog.findOneAndDelete({
    _id: req.params.id,
    $or: [{ initiatorId: req.user._id }, { receiverId: req.user._id }],
  });

  res.json({ success: true });
});
