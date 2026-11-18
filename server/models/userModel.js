import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
    },

    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "please enter your email"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "please enter password"],
    },

    gender: {
      type: String,
      required: [true, "please enter your gender"],
      enum: ["male", "female"],
    },

    location: {
      type: String,
      required: [true, "please enter your location"],
    },

    role: {
      type: String,
      enum: ["visitor", "guide"],
      default: "visitor",
    },

    profileImage: {
      type: String,
    },

    phone: {
      type: String,
    },

    bio: { type: String, maxlength: 240 },
  languages: { type: [String], default: [] },
  interests: { type: [String], default: [] },

  country: { type: String },
  city: { type: String },
  timezone: { type: String },

  tourPreferences: {
    pace: { type: String, enum: ["Relaxed", "Balanced", "Packed"], default: "Balanced" },
    group: { type: String, enum: ["Solo", "Couple", "Family", "Friends"], default: "Solo" },
    length: { type: Number, enum: [30, 60, 90], default: 60 }, // minutes, same unit as Booking.duration
  },

notifications: {
  reminders: { type: Boolean, default: true },
  replies: { type: Boolean, default: true },
  offers: { type: Boolean, default: false },
},

savedGuides: [{ type: mongoose.Schema.Types.ObjectId, ref: "TourGuide" }],

    balance: {
      type: Number,
      default: 0,
    },

    googleId: {
      type: String,
    },

    streamUserId: {
      type: String,
    },

    pushToken: {
      type: String,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    lastActive: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: String,

    verificationCodeExpires: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
