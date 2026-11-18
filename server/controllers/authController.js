import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import {
  sendVerificationCode,
  sendVerificationCodeMailgun,
} from "../authservice/emailService.js";
import crypto from "crypto";
import { uploadToCloudinary } from "../utils/cloudinaryUploadHelper.js";

export const register = asyncHandler(async (req, res) => {
  const { email, name, location, gender, password } = req.body;

  if (!email || !name || !location || !gender || !password) {
    res.status(400);
    throw new Error("please enter all fields");
  }

  const findUser = await User.findOne({ email });
  if (findUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    gender,
    location,
    verificationCode,
    verificationCodeExpires,
  });

  // await sendVerificationCode(user.email, verificationCode);

  try {
    await sendVerificationCodeMailgun(user.email, verificationCode);
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      location: user.location,
      token: generateToken(user._id),
      isVerified: user.isVerified,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// New verification endpoint for codes
export const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification code");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error("Email and verification code are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
    verificationCode: String(code),
    verificationCodeExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification code.");
  }

  res.status(200).json({
    success: true,
    message: "Verification code verified successfully.",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("please enter all fields");
  }
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      location: user.location,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      // streamToken: token
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !name) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        password: googleId,
        gender: "male",
        location: "Unknown",
        isVerified: true,
      });
    }

    // Generate token and send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      location: user.location,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400);
    throw new Error("Google authentication failed");
  }
});

export const sendVerificationResetCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400);
    throw new Error("Please enter a valid email.");
  }
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Prevent password reset for accounts without password authentication.
  if (!user.password) {
    res.status(400);
    throw new Error("This account cannot reset its password this way.");
  }

  // Generate a cryptographically secure six-digit code.
  const verificationCode = crypto.randomInt(100000, 1000000).toString();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  ((user.verificationCode = verificationCode),
    (user.verificationCodeExpires = verificationCodeExpires));

  await user.save();

  try {
    await sendVerificationCodeMailgun(user.email, verificationCode);
  } catch (error) {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Password reset code sent successfully.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    res.status(400);
    throw new Error("Email, verification code, and password are required.");
  }

  if (
    typeof email !== "string" ||
    typeof code !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400);
    throw new Error("Invalid request data.");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    res.status(400);
    throw new Error("Invalid email or verification code.");
  }

  // Verify the reset code and expiration.
  if (
    !user.verificationCode ||
    user.verificationCode !== code ||
    !user.verificationCodeExpires ||
    new Date(user.verificationCodeExpires).getTime() <= Date.now()
  ) {
    res.status(400);
    throw new Error("Invalid or expired verification code.");
  }

  // Prevent reusing the current password.
  if (user.password && (await bcrypt.compare(password, user.password))) {
    res.status(400);
    throw new Error(
      "Your new password cannot be the same as your current password.",
    );
  }

  user.password = await bcrypt.hash(password, 10);

  // Invalidate the code after a successful reset.
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});




export const updateProfile = async (req, res) => {
  try {
    console.log('profs');
    const userId = req.user?._id;
    console.log({userId});

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

        console.log('prof2');


    const updates = {};

    const allowedFields = [
      "name",
      "firstName",
      "lastName",
      "email",
      "gender",
      "location",
      "role",
      "phone",
      "bio",
      "country",
      "city",
      "timezone",
      "tourPreferences",
      "notifications",
      "savedGuides"
    ];

    // Update ordinary profile fields if provided.
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Upload the received image to Cloudinary.
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file,
        "profile",
        "image",
      );

      updates.profileImage = uploadResult.url;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields or image provided for update.",
      });
    }

        console.log('pro3');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -verificationCode -passwordResetToken");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log({updatedUser});

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
