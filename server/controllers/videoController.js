import asyncHandler from "express-async-handler";
import { StreamChat } from "stream-chat";

const apiKey = process.env.API_GETSTREAM_PUBLISHABLE_KEY;
const secret = process.env.API_GETSTREAM_SECRET_KEY;

if (!apiKey || !secret) {
  throw new Error("Missing GetStream API keys");
}

const streamClient = StreamChat.getInstance(apiKey, secret, {
  timeout: 15000,
});
// Generate Stream token
export const getStreamToken = asyncHandler(async (req, res) => {
  const { userId } = req.body;
    console.log('tokening');

  if (!userId) {
    return res.status(400).json({
      error: "User ID is required",
    });
  }

  const token = streamClient.createToken(String(userId));

  return res.status(200).json({ token });
});


export const syncUserToStream = asyncHandler(async (req, res) => {
  const { userId, name, image } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: "User ID is required",
    });
  }

  try {
    const userData = {
      id: String(userId),
      ...(name?.trim() && name.trim() !== "Guest"
        ? { name: name.trim() }
        : {}),
      ...(image ? { image } : {}),
    };

    const result = await streamClient.upsertUser(userData);

    console.log("Stream user synchronized:", {
      id: result.users?.[String(userId)]?.id,
      name: result.users?.[String(userId)]?.name,
    });

    console.log({userId: String(userId)});
    console.log({name: result.users?.[String(userId)]?.name});

    return res.status(200).json({
      success: true,
      userId: String(userId),
      name: result.users?.[String(userId)]?.name,
    });
  } catch (error) {
    console.error("Stream sync failed:", error.message);

    return res.status(500).json({
      error: "Failed to sync user",
    });
  }
});

