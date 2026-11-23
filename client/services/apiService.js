/**
 * Central API client.
 * All screens import from here — one place to change the base URL or add auth headers.
 */
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/users\/?$/, "");

const api = axios.create({ baseURL: BASE });

// Attach the JWT from SecureStore on every request
api.interceptors.request.use(async (config) => {
  try {
    const userString = await SecureStore.getItemAsync("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (_) {}
  return config;
});

/* ----------------------------- Guides ----------------------------- */
export const fetchGuides = (params = {}) =>
  api.get("/api/guides", { params }).then((r) => r.data);

export const fetchGuideById = (id) =>
  api.get(`/api/guides/${id}`).then((r) => r.data);

export const fetchMyGuideProfile = () =>
  api.get("/api/guides/my").then((r) => r.data);

export const createGuideProfile = (data) =>
  api.post("/api/guides", data).then((r) => r.data);

export const updateMyGuideProfile = (data) =>
  api.put("/api/guides/my", data).then((r) => r.data);

/* ----------------------------- Bookings ----------------------------- */
export const fetchMyBookings = () =>
  api.get("/api/bookings/my").then((r) => r.data);

export const fetchBookingById = (id) =>
  api.get(`/api/bookings/${id}`).then((r) => r.data);

export const createBooking = (data) =>
  api.post("/api/bookings", data).then((r) => r.data);

export const updateBookingStatus = (id, status) =>
  api.patch(`/api/bookings/${id}/status`, { status }).then((r) => r.data);

/* ----------------------------- Notifications ----------------------------- */
export const fetchNotifications = () =>
  api.get("/api/notifications").then((r) => r.data);

export const markNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.patch("/api/notifications/read-all").then((r) => r.data);

export const deleteNotification = (id) =>
  api.delete(`/api/notifications/${id}`).then((r) => r.data);

/* ----------------------------- Call Logs ----------------------------- */
export const fetchCallLogs = () =>
  api.get("/api/calls").then((r) => r.data);

export const createCallLog = (data) =>
  api.post("/api/calls", data).then((r) => r.data);

export const deleteCallLog = (id) =>
  api.delete(`/api/calls/${id}`).then((r) => r.data);

/* ----------------------------- Reviews ----------------------------- */
export const fetchGuideReviews = (guideId) =>
  api.get(`/api/reviews/guide/${guideId}`).then((r) => r.data);

export const createReview = (data) =>
  api.post("/api/reviews", data).then((r) => r.data);
