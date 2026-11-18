// data/mockData.js
// Placeholder data shaped like your Mongoose models (TourGuide, Review).
// Replace the getters at the bottom with API calls when your backend is ready.

export const FALLBACK_IMAGE = require("../assets/images/travel1.png");
export const GUIDE_AVATAR = require("../assets/images/profile.jpg");

/* ------------------------------ helpers ------------------------------ */
export const money = (n) => {
  const value = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `$${value.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const formatTime12 = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const timeAgo = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const slots = (days, startTime, endTime) =>
  days.map((day) => ({ day, startTime, endTime }));
const WEEK = DAY_ORDER;
const MON_FRI = DAY_ORDER.slice(0, 5);

/* -------------------------------- places ------------------------------ */
// There is no Place model in your backend yet, so this stays mock-only.
export const PLACES = [
  {
    id: "p1",
    name: "Ocean Vaadhoo",
    country: "Maldives",
    category: "Beaches",
    price: 1200,
    days: 6,
    rating: 4.9,
    reviews: 842,
    coords: "20°53'",
    popularity: 98,
    addedDaysAgo: 40,
    featured: true,
    description:
      "Famous for its glowing shoreline at night, Vaadhoo is a quiet island of turquoise water and white sand. Your guide walks you along the beach and out to the reef.",
  },
  {
    id: "p2",
    name: "City Rome",
    country: "Italy",
    category: "Cities",
    price: 750,
    days: 5,
    rating: 4.7,
    reviews: 1260,
    coords: "41°53'",
    popularity: 95,
    addedDaysAgo: 90,
    description:
      "Walk through the Colosseum, the Forum and hidden courtyards with a local who knows the stories behind every stone.",
  },
  {
    id: "p3",
    name: "Lalibela",
    country: "Ethiopia",
    category: "History",
    price: 620,
    days: 3,
    rating: 4.8,
    reviews: 390,
    coords: "12°01'",
    popularity: 90,
    addedDaysAgo: 6,
    description:
      "Eleven rock-hewn churches carved from a single hillside. Explore the tunnels, courtyards and living traditions of this pilgrimage site.",
  },
  {
    id: "p4",
    name: "Niagara Falls",
    country: "Canada",
    category: "Nature",
    price: 540,
    days: 4,
    rating: 4.6,
    reviews: 980,
    coords: "43°05'",
    popularity: 88,
    addedDaysAgo: 120,
    description:
      "Feel the spray of the falls from the boat deck and the viewing galleries, then explore the quieter trails along the gorge.",
  },
  {
    id: "p5",
    name: "Simien Mountains",
    country: "Ethiopia",
    category: "Nature",
    price: 480,
    days: 7,
    rating: 4.8,
    reviews: 275,
    coords: "13°13'",
    popularity: 82,
    addedDaysAgo: 12,
    description:
      "Dramatic cliffs, gelada monkeys and endless highland views. A slow, scenic trek led by a local mountain guide.",
  },
  {
    id: "p6",
    name: "Kyoto Old Town",
    country: "Japan",
    category: "History",
    price: 980,
    days: 6,
    rating: 4.9,
    reviews: 710,
    coords: "35°01'",
    popularity: 93,
    addedDaysAgo: 3,
    description:
      "Temples, tea houses and lantern-lit lanes. Learn the customs and craft traditions of Japan's former capital.",
  },
  {
    id: "p7",
    name: "Zanzibar Coast",
    country: "Tanzania",
    category: "Beaches",
    price: 710,
    days: 5,
    rating: 4.5,
    reviews: 330,
    coords: "6°10'",
    popularity: 78,
    addedDaysAgo: 20,
    description:
      "Spice markets, Stone Town alleys and calm Indian Ocean beaches, all in one relaxed tour.",
  },
  {
    id: "p8",
    name: "London Walks",
    country: "United Kingdom",
    category: "Cities",
    price: 890,
    days: 5,
    rating: 4.4,
    reviews: 1510,
    coords: "51°30'",
    popularity: 85,
    addedDaysAgo: 200,
    description:
      "Markets, museums and riverside paths with a guide who shows you the city beyond the postcards.",
  },
];

export const imageOf = (place) =>
  place.imageUrl ? { uri: place.imageUrl } : FALLBACK_IMAGE;
export const guideImageOf = (guide) =>
  guide.profileImage ? { uri: guide.profileImage } : GUIDE_AVATAR;

/* -------------------------------- guides ------------------------------ */
// Shape follows TourGuide, with the linked User's name merged in.
export const GUIDES = [
  {
    id: "g1",
    userId: "u1",
    name: "Abebe Kebede",
    bio: "Historian and licensed guide from Addis Ababa. I love sharing the stories behind Ethiopia's churches, highlands and everyday traditions.",
    languages: ["Amharic", "English", "French"],
    areasOfExpertise: [
      "Historical Landmarks",
      "Cultural Tours",
      "Nature Walks",
    ],
    location: "Addis Ababa, Ethiopia",
    experience: 6,
    pricePerHour: 25,
    rating: 4.8,
    totalReviews: 140,
    completedCalls: 200,
    availability: slots(MON_FRI, "09:00", "17:00"),
    isVerified: true,
    isActive: true,
    placeIds: ["p3", "p5"],
  },
  {
    id: "g2",
    userId: "u2",
    name: "Selam Tadesse",
    bio: "Born and raised in Lalibela. I'll walk you through the rock-hewn churches and introduce you to the priests and pilgrims who keep them alive.",
    languages: ["Amharic", "English"],
    areasOfExpertise: ["Historical Landmarks", "Photography"],
    location: "Lalibela, Ethiopia",
    experience: 4,
    pricePerHour: 20,
    rating: 4.9,
    totalReviews: 96,
    completedCalls: 150,
    availability: slots(DAY_ORDER.slice(1, 6), "10:00", "18:00"),
    isVerified: true,
    isActive: true,
    placeIds: ["p3"],
  },
  {
    id: "g3",
    userId: "u3",
    name: "Marco Bellini",
    bio: "Rome-born archaeologist. Expect ancient history, hidden courtyards and the best espresso stops between them.",
    languages: ["Italian", "English"],
    areasOfExpertise: ["Cities", "Museums", "Food & Coffee"],
    location: "Rome, Italy",
    experience: 9,
    pricePerHour: 40,
    rating: 4.7,
    totalReviews: 310,
    completedCalls: 520,
    availability: slots(DAY_ORDER.slice(0, 6), "09:00", "19:00"),
    isVerified: true,
    isActive: true,
    placeIds: ["p2"],
  },
  {
    id: "g4",
    userId: "u4",
    name: "Aiko Tanaka",
    bio: "Tea-house host and Kyoto native. I focus on slow, quiet tours of temples, gardens and craft workshops.",
    languages: ["Japanese", "English"],
    areasOfExpertise: ["Temples", "Cultural Tours", "Crafts"],
    location: "Kyoto, Japan",
    experience: 7,
    pricePerHour: 45,
    rating: 4.9,
    totalReviews: 205,
    completedCalls: 330,
    availability: slots(
      ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "08:00",
      "16:00",
    ),
    isVerified: true,
    isActive: true,
    placeIds: ["p6"],
  },
  {
    id: "g5",
    userId: "u5",
    name: "Hassan Juma",
    bio: "Stone Town guide with a love for spice markets, Swahili history and calm beaches.",
    languages: ["Swahili", "English", "Arabic"],
    areasOfExpertise: ["Markets", "Beaches", "Historical Landmarks"],
    location: "Zanzibar, Tanzania",
    experience: 8,
    pricePerHour: 22,
    rating: 4.5,
    totalReviews: 120,
    completedCalls: 240,
    availability: slots(WEEK, "09:00", "15:00"),
    isVerified: false,
    isActive: true,
    placeIds: ["p7"],
  },
  {
    id: "g6",
    userId: "u6",
    name: "Liam Carter",
    bio: "Park ranger turned virtual guide. I'll take you right up to the falls and along the quieter gorge trails.",
    languages: ["English", "French"],
    areasOfExpertise: ["Nature Walks", "Photography"],
    location: "Niagara Falls, Canada",
    experience: 5,
    pricePerHour: 38,
    rating: 4.6,
    totalReviews: 88,
    completedCalls: 130,
    availability: slots(MON_FRI, "11:00", "19:00"),
    isVerified: true,
    isActive: true,
    placeIds: ["p4"],
  },
  {
    id: "g7",
    userId: "u7",
    name: "Ibrahim Naseem",
    bio: "Island-born guide and diver. Join me on the beach at dusk to see Vaadhoo's glowing shoreline.",
    languages: ["English", "Dhivehi"],
    areasOfExpertise: ["Beaches", "Marine Life"],
    location: "Malé, Maldives",
    experience: 6,
    pricePerHour: 50,
    rating: 4.9,
    totalReviews: 160,
    completedCalls: 210,
    availability: slots(
      ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"],
      "15:00",
      "21:00",
    ),
    isVerified: true,
    isActive: true,
    placeIds: ["p1"],
  },
  {
    id: "g8",
    userId: "u8",
    name: "Kate Norman",
    bio: "Geologist and London local. I mix museums and markets with stories of the city's layers, from Roman walls to modern skylines.",
    languages: ["English"],
    areasOfExpertise: ["Cities", "Museums", "Markets"],
    location: "London, United Kingdom",
    experience: 5,
    pricePerHour: 35,
    rating: 4.4,
    totalReviews: 180,
    completedCalls: 260,
    availability: slots(MON_FRI, "10:00", "18:00"),
    isVerified: true,
    isActive: true,
    placeIds: ["p8"],
  },
];

/* -------------------------------- reviews ----------------------------- */
// Shape follows Review, with the visitor's name merged in.
const review = (
  id,
  guideId,
  visitorName,
  rating,
  comment,
  ago,
  tipAmount = 0,
) => ({
  id,
  guideId,
  visitorName,
  rating,
  comment,
  tipAmount,
  createdAt: daysAgo(ago),
});

export const REVIEWS = [
  review(
    "r1",
    "g1",
    "Sophie M.",
    5,
    "Abebe made the whole history of the highlands come alive. Great audio and so patient with my questions.",
    3,
    5,
  ),
  review(
    "r2",
    "g1",
    "Daniel R.",
    5,
    "Felt like I was really there. Highly recommend booking him before your trip.",
    12,
  ),
  review(
    "r3",
    "g1",
    "Priya K.",
    4,
    "Very knowledgeable. The connection dropped once but he picked up right where we left off.",
    40,
  ),
  review(
    "r4",
    "g2",
    "Tom W.",
    5,
    "Selam's passion for Lalibela is contagious. The best hour I spent planning my trip.",
    5,
    10,
  ),
  review(
    "r5",
    "g2",
    "Lena B.",
    5,
    "Wonderful, warm and funny. Showed me corners no guidebook mentions.",
    21,
  ),
  review(
    "r6",
    "g3",
    "Chris A.",
    5,
    "Marco knows Rome like the back of his hand. Loved the food stops.",
    7,
  ),
  review(
    "r7",
    "g3",
    "Mia S.",
    4,
    "Great stories, a bit fast-paced, but I learned a ton.",
    33,
  ),
  review(
    "r8",
    "g4",
    "Hannah L.",
    5,
    "Calm, thoughtful and beautifully paced. Aiko is a gem.",
    2,
    8,
  ),
  review(
    "r9",
    "g4",
    "Omar H.",
    5,
    "I booked the tea ceremony tour and it was the highlight of my week.",
    18,
  ),
  review(
    "r10",
    "g5",
    "Grace T.",
    4,
    "Great market walk, really friendly. Video quality could be better.",
    9,
  ),
  review(
    "r11",
    "g5",
    "Ivan P.",
    5,
    "Hassan's stories about Stone Town were incredible.",
    26,
  ),
  review(
    "r12",
    "g6",
    "Nora J.",
    5,
    "Seeing the falls live with Liam was amazing. So many facts!",
    4,
  ),
  review(
    "r13",
    "g6",
    "Ben D.",
    4,
    "Fun and well prepared. Would book again.",
    29,
  ),
  review(
    "r14",
    "g7",
    "Yuki N.",
    5,
    "The glowing beach at dusk was unforgettable. Ibrahim is superb.",
    6,
    15,
  ),
  review(
    "r15",
    "g7",
    "Carlos F.",
    5,
    "Smooth, beautiful and so informative.",
    22,
  ),
  review(
    "r16",
    "g8",
    "Amy C.",
    4,
    "Kate's geology angle on London was a fresh take. Loved it.",
    11,
  ),
  review(
    "r17",
    "g8",
    "Jonas V.",
    4,
    "Friendly and clear. A nice way to preview the city.",
    37,
  ),
];

/* -------------------------------- getters ----------------------------- */
export const getPlace = (id) => PLACES.find((p) => p.id === id) || null;
export const getGuide = (id) => GUIDES.find((g) => g.id === id) || null;
export const getGuidesForPlace = (placeId) =>
  GUIDES.filter((g) => g.isActive && g.placeIds.includes(placeId)).sort(
    (a, b) => b.rating - a.rating,
  );
export const getPlacesForGuide = (guide) =>
  guide.placeIds.map(getPlace).filter(Boolean);
export const getReviewsForGuide = (guideId) =>
  REVIEWS.filter((r) => r.guideId === guideId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
