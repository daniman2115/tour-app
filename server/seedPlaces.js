/**
 * Run once to seed the database with the initial places:
 *   node seedPlaces.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Place from "./models/placeModel.js";

dotenv.config();

const PLACES = [
  {
    name: "Ocean Vaadhoo",
    country: "Maldives",
    category: "Beaches",
    coords: "20°53'",
    price: 1200,
    days: 6,
    rating: 4.9,
    reviews: 842,
    popularity: 98,
    featured: true,
    description:
      "Famous for its glowing shoreline at night, Vaadhoo is a quiet island of turquoise water and white sand. Your guide walks you along the beach and out to the reef.",
  },
  {
    name: "City Rome",
    country: "Italy",
    category: "Cities",
    coords: "41°53'",
    price: 750,
    days: 5,
    rating: 4.7,
    reviews: 1260,
    popularity: 95,
    description:
      "Walk through the Colosseum, the Forum and hidden courtyards with a local who knows the stories behind every stone.",
  },
  {
    name: "Lalibela",
    country: "Ethiopia",
    category: "History",
    coords: "12°01'",
    price: 620,
    days: 3,
    rating: 4.8,
    reviews: 390,
    popularity: 90,
    description:
      "Eleven rock-hewn churches carved from a single hillside. Explore the tunnels, courtyards and living traditions of this pilgrimage site.",
  },
  {
    name: "Niagara Falls",
    country: "Canada",
    category: "Nature",
    coords: "43°05'",
    price: 540,
    days: 4,
    rating: 4.6,
    reviews: 980,
    popularity: 88,
    description:
      "Feel the spray of the falls from the boat deck and the viewing galleries, then explore the quieter trails along the gorge.",
  },
  {
    name: "Simien Mountains",
    country: "Ethiopia",
    category: "Nature",
    coords: "13°13'",
    price: 480,
    days: 7,
    rating: 4.8,
    reviews: 275,
    popularity: 82,
    description:
      "Dramatic cliffs, gelada monkeys and endless highland views. A slow, scenic trek led by a local mountain guide.",
  },
  {
    name: "Kyoto Old Town",
    country: "Japan",
    category: "History",
    coords: "35°01'",
    price: 980,
    days: 6,
    rating: 4.9,
    reviews: 710,
    popularity: 93,
    description:
      "Temples, tea houses and lantern-lit lanes. Learn the customs and craft traditions of Japan's former capital.",
  },
  {
    name: "Zanzibar Coast",
    country: "Tanzania",
    category: "Beaches",
    coords: "6°10'",
    price: 710,
    days: 5,
    rating: 4.5,
    reviews: 330,
    popularity: 78,
    description:
      "Spice markets, Stone Town alleys and calm Indian Ocean beaches, all in one relaxed tour.",
  },
  {
    name: "London Walks",
    country: "United Kingdom",
    category: "Cities",
    coords: "51°30'",
    price: 890,
    days: 5,
    rating: 4.4,
    reviews: 1510,
    popularity: 85,
    description:
      "Markets, museums and riverside paths with a guide who shows you the city beyond the postcards.",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");

  await Place.deleteMany({});
  const created = await Place.insertMany(PLACES);
  console.log(`Seeded ${created.length} places`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
