import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const tourGuideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      unique: true,
    },

    bio: { type: String, maxlength: 300 },

    title: { type: String, default: "Local Guide", maxlength: 50 },

    timezone: { type: String, default: "Africa/Addis_Ababa" },


    languages: {
      type: [String],
      default: [],
    },

    areasOfExpertise: {
      type: [String],
      default: [],
    },

    location: {
      type: String,
      required: [true, "please enter your location"],
    },

    experience: {
      type: Number,
      default: 0,
    },

    pricePerHour: {
      type: Number,
      required: [true, "please enter your price per hour"],
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    completedCalls: {
      type: Number,
      default: 0,
    },

    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },

    profileImage: {
      type: String,
    },

    streamUserId: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TourGuide", tourGuideSchema);
