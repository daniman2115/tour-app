import asyncHandler from "express-async-handler";
import TourGuide from "../models/tourGuide.js";
import User from "../models/userModel.js";

// GET /api/guides — list all active guides (optional search/filter)
export const getGuides = asyncHandler(async (req, res) => {
  const { search, location, language, expertise } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { location: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }
  if (location) filter.location = { $regex: location, $options: "i" };
  if (language) filter.languages = { $in: [language] };
  if (expertise) filter.areasOfExpertise = { $in: [expertise] };

  const guides = await TourGuide.find(filter)
    .populate("userId", "name profileImage email")
    .sort({ rating: -1, completedCalls: -1 });

  res.json(guides);
});

// GET /api/guides/:id — single guide
export const getGuideById = asyncHandler(async (req, res) => {
  const guide = await TourGuide.findById(req.params.id).populate(
    "userId",
    "name profileImage email"
  );

  if (!guide) {
    res.status(404);
    throw new Error("Guide not found");
  }

  res.json(guide);
});

// GET /api/guides/my — the guide profile of the logged-in user
export const getMyGuideProfile = asyncHandler(async (req, res) => {
  const guide = await TourGuide.findOne({ userId: req.user._id }).populate(
    "userId",
    "name profileImage email"
  );

  if (!guide) {
    res.status(404);
    throw new Error("Guide profile not found");
  }

  res.json(guide);
});

// POST /api/guides — create a new guide profile for the logged-in user
export const createGuideProfile = asyncHandler(async (req, res) => {
  const existing = await TourGuide.findOne({ userId: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error("Guide profile already exists for this user");
  }

  const {
    bio, title, location, languages, areasOfExpertise,
    experience, pricePerHour, availability, timezone,
  } = req.body;

  if (!location || !pricePerHour) {
    res.status(400);
    throw new Error("Location and price per hour are required");
  }

  const guide = await TourGuide.create({
    userId: req.user._id,
    bio,
    title: title || "Local Guide",
    location,
    languages: languages || [],
    areasOfExpertise: areasOfExpertise || [],
    experience: experience || 0,
    pricePerHour,
    availability: availability || [],
    timezone: timezone || "UTC",
  });

  // Update user role to guide
  await User.findByIdAndUpdate(req.user._id, { role: "guide" });

  res.status(201).json(guide);
});

// PUT /api/guides/my — update the logged-in guide's profile
export const updateMyGuideProfile = asyncHandler(async (req, res) => {
  const guide = await TourGuide.findOne({ userId: req.user._id });

  if (!guide) {
    res.status(404);
    throw new Error("Guide profile not found");
  }

  const allowedFields = [
    "bio", "title", "location", "languages",
    "areasOfExpertise", "experience", "pricePerHour",
    "availability", "timezone", "isActive", "profileImage",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      guide[field] = req.body[field];
    }
  });

  const updated = await guide.save();
  res.json(updated);
});
