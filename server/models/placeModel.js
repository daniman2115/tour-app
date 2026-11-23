import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "place name is required"], trim: true },
    country: { type: String, required: [true, "country is required"], trim: true },
    coords: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      enum: ["Beaches", "Cities", "Nature", "History", "Adventure", "Other"],
    },
    price: { type: Number, required: true, min: 0 },
    days: { type: Number, required: true, min: 1 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Place", placeSchema);
