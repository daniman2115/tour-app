// hooks/useHome.js
// All the state and logic for the home screen. The three home layouts
// (HomeA / HomeB / HomeC) only differ in how they display this.
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toggleFavorite, useFavorites } from "../data/favoritesStore";
import {
  DEFAULT_FILTERS,
  DURATION_FN,
  LANGUAGES,
  getAvailableTodayGuides,
  getRecentReviews,
  getStats,
  getUpcomingBooking,
} from "../data/homeData";
import { GUIDES, PLACES } from "../data/mockData";

export default function useHome() {
  const { user } = useSelector((state) => state.auth);
  const unreadNotifications = user?.unreadNotifications ?? 0; // wire to your notifications state
  const favorites = useFavorites();

  const [places, setPlaces] = useState(PLACES);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("Popular");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const activeFilterCount =
    (filters.maxPrice !== null ? 1 : 0) + (filters.duration !== "Any" ? 1 : 0);
  // true -> show results instead of the discovery sections
  const isSearching = query.trim() !== "" || category !== "All" || activeFilterCount > 0;

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  /* ------------------------------ places ------------------------------ */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (q && !`${p.name} ${p.country} ${p.category}`.toLowerCase().includes(q)) return false;
      if (category === "Saved" && !favorites.includes(p.id)) return false;
      if (category !== "All" && category !== "Saved" && p.category !== category) return false;
      if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
      if (!DURATION_FN[filters.duration](p.days)) return false;
      return true;
    });
  }, [places, query, category, filters, favorites]);

  const listed = useMemo(() => {
    const copy = [...filtered];
    if (tab === "Popular") copy.sort((a, b) => b.popularity - a.popularity);
    if (tab === "Latest") copy.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    return copy;
  }, [filtered, tab]);

  const recommended = useMemo(
    () => [...filtered].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [filtered]
  );

  const featured = places.find((p) => p.featured) || places[0];

  const featuredList = useMemo(
    () =>
      [...places]
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.popularity - a.popularity)
        .slice(0, 4),
    [places]
  );

  /* ------------------------------ guides ------------------------------ */
  // Search matches guides too; hidden when a place category is chosen
  const matchedGuides = useMemo(() => {
    if (category !== "All") return [];
    const q = query.trim().toLowerCase();
    return GUIDES.filter(
      (g) =>
        g.isActive &&
        (!q ||
          `${g.name} ${g.location} ${g.languages.join(" ")} ${g.areasOfExpertise.join(" ")}`
            .toLowerCase()
            .includes(q))
    ).sort((a, b) => b.rating - a.rating);
  }, [category, query]);

  const topGuides = useMemo(
    () => [...GUIDES].filter((g) => g.isActive).sort((a, b) => b.rating - a.rating),
    []
  );
  const availableToday = useMemo(() => getAvailableTodayGuides(), []);

  /* --------------------------- other sections -------------------------- */
  const upcoming = useMemo(() => getUpcomingBooking(), []);
  const reviews = useMemo(() => getRecentReviews(6), []);
  const stats = useMemo(() => getStats(), []);
  const activeLanguage = LANGUAGES.find((l) => l.toLowerCase() === query.trim().toLowerCase());

  /* ------------------------------ navigation --------------------------- */
  const openPlace = (place) => router.push(`/place/${place.id}`);
  const openGuide = (guide) => router.push(`/guide/${guide.id}`);
  const openBookings = () => router.push("/myBookings");
  const openCalls = () => router.push("/callLogs");
  const openNotifications = () => router.push("/Notification");
  const openProfile = () => router.push("/Profile");
  const joinCall = () => {
    // TODO: route to your call screen using booking.streamCallId
    router.push("/myBookings");
  };

  /* ------------------------------ actions ------------------------------ */
  const toggleFav = (place) => {
    const nowSaved = toggleFavorite(place.id);
    showToast(nowSaved ? "Saved to your list" : "Removed from saved");
    // TODO: persist favorites with your API
  };

  const clearAll = () => {
    setQuery("");
    setCategory("All");
    setFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700)); // fetch places, then setPlaces(response)
    setPlaces(PLACES);
    setRefreshing(false);
  };

  const toggleLanguage = (language) => setQuery(activeLanguage === language ? "" : language);

  const quickActions = [
    { icon: "calendar-outline", label: "Meetings", onPress: openBookings },
    { icon: "call-outline", label: "Calls", onPress: openCalls },
    { icon: "heart-outline", label: "Saved", onPress: () => setCategory("Saved"), badge: favorites.length },
    { icon: "notifications-outline", label: "Alerts", onPress: openNotifications, badge: unreadNotifications },
  ];

  return {
    user, unreadNotifications, favorites,
    query, setQuery, category, setCategory, tab, setTab,
    filters, draftFilters, setDraftFilters, filterOpen, setFilterOpen,
    activeFilterCount, isSearching, refreshing, toast,
    listed, recommended, featured, featuredList,
    matchedGuides, topGuides, availableToday,
    upcoming, reviews, stats, activeLanguage, quickActions,
    openPlace, openGuide, openBookings, openCalls, openNotifications, openProfile, joinCall,
    toggleFav, clearAll, openFilters, applyFilters, onRefresh, toggleLanguage,
  };
}