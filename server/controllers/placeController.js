import asyncHandler from "express-async-handler";
import Place from "../models/placeModel.js";
import TourGuide from "../models/tourGuide.js";
import User from "../models/userModel.js";

// GET /api/places
// Query params: category, search, maxPrice, minDays, maxDays
export const getPlaces = asyncHandler(async (req, res) => {
  const { category, search, maxPrice, minDays, maxDays } = req.query;

  const filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (maxPrice) {
    filter.price = { $lte: Number(maxPrice) };
  }

  if (minDays || maxDays) {
    filter.days = {};
    if (minDays) filter.days.$gte = Number(minDays);
    if (maxDays) filter.days.$lte = Number(maxDays);
  }

  const places = await Place.find(filter).sort({ popularity: -1 });

  res.json(places);
});

// GET /api/places/:id
export const getPlaceById = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    res.status(404);
    throw new Error("Place not found");
  }

  res.json(place);
});

// GET /api/places/:id/guides — guides that cover this place
export const getGuidesForPlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    res.status(404);
    throw new Error("Place not found");
  }

  // Match guides by location (country) first; fall back to all active guides
  let guides = await TourGuide.find({
    isActive: true,
    location: { $regex: place.country, $options: "i" },
  })
    .populate("userId", "name profileImage")
    .sort({ rating: -1 })
    .limit(10);

  if (guides.length === 0) {
    guides = await TourGuide.find({ isActive: true })
      .populate("userId", "name profileImage")
      .sort({ rating: -1 })
      .limit(10);
  }

  res.json(guides);
});

// GET /api/places/guides/top — top guides for home screen
export const getTopGuides = asyncHandler(async (req, res) => {
  const guides = await TourGuide.find({ isActive: true })
    .populate("userId", "name profileImage")
    .sort({ rating: -1, completedCalls: -1 })
    .limit(10);

  res.json(guides);
});

// POST /api/places — admin: create a place
export const createPlace = asyncHandler(async (req, res) => {
  const {
    name, country, coords, category,
    price, days, description, imageUrl,
    popularity, featured,
  } = req.body;

  if (!name || !country || !category || !price || !days) {
    res.status(400);
    throw new Error("Please provide name, country, category, price and days");
  }

  const place = await Place.create({
    name, country, coords, category,
    price, days, description, imageUrl,
    popularity: popularity || 0,
    featured: featured || false,
  });

  res.status(201).json(place);
});

// POST /api/places/seed — dev only: seed from the mock array
export const seedPlaces = asyncHandler(async (req, res) => {
  const { places } = req.body;

  if (!places || !Array.isArray(places)) {
    res.status(400);
    throw new Error("Provide a places array in the request body");
  }

  await Place.deleteMany({});
  const created = await Place.insertMany(places);

  res.status(201).json({ count: created.length, places: created });
});
