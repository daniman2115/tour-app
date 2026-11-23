import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/userModel.js";
import TourGuide from "./models/tourGuide.js";

dotenv.config();

const SLOTS = (days, startTime, endTime) => days.map((day) => ({ day, startTime, endTime }));
const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MON_FRI = DAY_ORDER.slice(0, 5);

const GUIDES = [
  { name: "Abebe Kebede", email: "abebe@example.com", bio: "Historian and licensed guide from Addis Ababa.", title: "Local Guide", location: "Addis Ababa, Ethiopia", languages: ["Amharic","English","French"], areasOfExpertise: ["Historical Landmarks","Cultural Tours","Nature Walks"], experience: 6, pricePerHour: 25, rating: 4.8, totalReviews: 140, completedCalls: 200, availability: SLOTS(MON_FRI,"09:00","17:00"), isVerified: true },
  { name: "Selam Tadesse", email: "selam@example.com", bio: "Born and raised in Lalibela.", title: "Local Guide", location: "Lalibela, Ethiopia", languages: ["Amharic","English"], areasOfExpertise: ["Historical Landmarks","Photography"], experience: 4, pricePerHour: 20, rating: 4.9, totalReviews: 96, completedCalls: 150, availability: SLOTS(DAY_ORDER.slice(1,6),"10:00","18:00"), isVerified: true },
  { name: "Marco Bellini", email: "marco@example.com", bio: "Rome-born archaeologist.", title: "Local Guide", location: "Rome, Italy", languages: ["Italian","English"], areasOfExpertise: ["Cities","Museums","Food & Coffee"], experience: 9, pricePerHour: 40, rating: 4.7, totalReviews: 310, completedCalls: 520, availability: SLOTS(DAY_ORDER.slice(0,6),"09:00","19:00"), isVerified: true },
  { name: "Aiko Tanaka", email: "aiko@example.com", bio: "Tea-house host and Kyoto native.", title: "Local Guide", location: "Kyoto, Japan", languages: ["Japanese","English"], areasOfExpertise: ["Temples","Cultural Tours","Crafts"], experience: 7, pricePerHour: 45, rating: 4.9, totalReviews: 205, completedCalls: 330, availability: SLOTS(["Monday","Wednesday","Thursday","Friday","Saturday","Sunday"],"08:00","16:00"), isVerified: true },
  { name: "Hassan Juma", email: "hassan@example.com", bio: "Stone Town guide.", title: "Local Guide", location: "Zanzibar, Tanzania", languages: ["Swahili","English","Arabic"], areasOfExpertise: ["Markets","Beaches","Historical Landmarks"], experience: 8, pricePerHour: 22, rating: 4.5, totalReviews: 120, completedCalls: 240, availability: SLOTS(DAY_ORDER,"09:00","15:00"), isVerified: false },
  { name: "Liam Carter", email: "liam@example.com", bio: "Park ranger turned virtual guide.", title: "Local Guide", location: "Niagara Falls, Canada", languages: ["English","French"], areasOfExpertise: ["Nature Walks","Photography"], experience: 5, pricePerHour: 38, rating: 4.6, totalReviews: 88, completedCalls: 130, availability: SLOTS(MON_FRI,"11:00","19:00"), isVerified: true },
  { name: "Ibrahim Naseem", email: "ibrahim@example.com", bio: "Island-born guide and diver.", title: "Local Guide", location: "Malé, Maldives", languages: ["English","Dhivehi"], areasOfExpertise: ["Beaches","Marine Life"], experience: 6, pricePerHour: 50, rating: 4.9, totalReviews: 160, completedCalls: 210, availability: SLOTS(["Tuesday","Wednesday","Thursday","Saturday","Sunday"],"15:00","21:00"), isVerified: true },
  { name: "Kate Norman", email: "kate@example.com", bio: "Geologist and London local.", title: "Local Guide", location: "London, United Kingdom", languages: ["English"], areasOfExpertise: ["Cities","Museums","Markets"], experience: 5, pricePerHour: 35, rating: 4.4, totalReviews: 180, completedCalls: 260, availability: SLOTS(MON_FRI,"10:00","18:00"), isVerified: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");

  const hashed = await bcrypt.hash("password123", 10);

  for (const g of GUIDES) {
    let user = await User.findOne({ email: g.email });
    if (!user) {
      user = await User.create({
        name: g.name,
        email: g.email,
        password: hashed,
        gender: "male",
        location: g.location,
        role: "guide",
      });
    } else {
      user.role = "guide";
      await user.save();
    }

    const existing = await TourGuide.findOne({ userId: user._id });
    if (!existing) {
      await TourGuide.create({
        userId: user._id,
        bio: g.bio,
        title: g.title,
        location: g.location,
        languages: g.languages,
        areasOfExpertise: g.areasOfExpertise,
        experience: g.experience,
        pricePerHour: g.pricePerHour,
        rating: g.rating,
        totalReviews: g.totalReviews,
        completedCalls: g.completedCalls,
        availability: g.availability,
        isVerified: g.isVerified,
        isActive: true,
      });
      console.log("Created guide:", g.name);
    } else {
      console.log("Guide exists:", g.name);
    }
  }

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});