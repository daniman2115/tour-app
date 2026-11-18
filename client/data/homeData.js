// data/homeData.js
// Extra placeholder data + helpers for the home screen.
// Builds on data/mockData.js (no changes needed there).
import {
  GUIDES,
  PLACES,
  REVIEWS,
  WEEKDAYS,
  formatTime12,
  getGuide,
  getPlace,
} from "./mockData";

/* ------------------------------ constants ---------------------------- */
export const CATEGORIES = ["All", "Cities", "Nature", "Beaches", "History", "Saved"];
export const CATEGORY_ICONS = {
  All: "apps-outline",
  Cities: "business-outline",
  Nature: "leaf-outline",
  Beaches: "sunny-outline",
  History: "library-outline",
  Saved: "heart-outline",
};
export const CATEGORY_TINT = {
  All: ["#EEF2FB", "#4060B2"],
  Cities: ["#EEF2FB", "#4060B2"],
  Nature: ["#EAF8D9", "#477C19"],
  Beaches: ["#FFF4D6", "#9A6B00"],
  History: ["#E6F6F7", "#0E7490"],
  Saved: ["#FDE8E8", "#DC2626"],
};
export const TABS = ["Popular", "Latest", "All"];
export const MAX_PRICES = [null, 600, 800, 1000];
export const DURATIONS = ["Any", "1-3 days", "4-6 days", "7+ days"];
export const DEFAULT_FILTERS = { maxPrice: null, duration: "Any" };
export const DURATION_FN = {
  Any: () => true,
  "1-3 days": (d) => d <= 3,
  "4-6 days": (d) => d >= 4 && d <= 6,
  "7+ days": (d) => d >= 7,
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* --------------------------- upcoming booking ------------------------ */
const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();

// Shape follows your Booking model (guide / place are merged in by the getter).
const UPCOMING_BOOKING = {
  id: "b1",
  guideId: "g1",
  placeId: "p3",
  scheduledAt: hoursFromNow(3),
  duration: 60,
  status: "confirmed",
  price: 25,
};

export const getUpcomingBooking = () => {
  const guide = getGuide(UPCOMING_BOOKING.guideId);
  if (!guide) return null;
  return { ...UPCOMING_BOOKING, guide, place: getPlace(UPCOMING_BOOKING.placeId) };
};

const minutesUntil = (iso) => Math.round((new Date(iso).getTime() - Date.now()) / 60000);

export const canJoin = (iso) => minutesUntil(iso) <= 10;

export const startsIn = (iso) => {
  const mins = minutesUntil(iso);
  if (mins <= 0) return "Starting now";
  if (mins < 60) return `Starts in ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const rest = mins % 60;
    return `Starts in ${hours}h${rest ? ` ${rest}m` : ""}`;
  }
  const d = new Date(iso);
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${WEEKDAYS[d.getDay()]} at ${formatTime12(hhmm)}`;
};

/* ------------------------------ derived data ------------------------- */
export const getAvailableTodayGuides = () => {
  const today = WEEKDAYS[new Date().getDay()];
  return GUIDES.filter((g) => g.isActive && g.availability.some((s) => s.day === today)).sort(
    (a, b) => b.rating - a.rating
  );
};

export const getRecentReviews = (n = 6) =>
  REVIEWS.filter((r) => r.comment)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, n)
    .map((r) => ({ ...r, guide: getGuide(r.guideId) }))
    .filter((r) => r.guide);

// Languages, most common first
export const LANGUAGES = (() => {
  const counts = {};
  GUIDES.forEach((g) => g.languages.forEach((l) => (counts[l] = (counts[l] || 0) + 1)));
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
})();

export const getStats = () => ({
  guides: GUIDES.length,
  places: PLACES.length,
  countries: new Set(PLACES.map((p) => p.country)).size,
  rating: (GUIDES.reduce((sum, g) => sum + g.rating, 0) / GUIDES.length).toFixed(1),
});