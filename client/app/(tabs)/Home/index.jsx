import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import GuideCard from "../../../components/GuideCard";
import { toggleFavorite, useFavorites } from "../../../data/favoritesStore";
import { imageOf, money, normalizePlace, normalizeGuide } from "../../../data/mockData";
import { fetchPlaces, fetchTopGuides } from "../../../services/placeService";

const HERO_IMAGE = require("../../../assets/images/homebg.png");
const HERO_SHADOW = require("../../../assets/images/homeshadow.png");
const AVATAR = require("../../../assets/images/homeimg.png");

const BANNER_GREEN = "#22C55E";

const CATEGORIES = ["All", "Cities", "Nature", "Beaches", "History", "Saved"];
const CATEGORY_ICONS = {
  All: "apps-outline",
  Cities: "business-outline",
  Nature: "leaf-outline",
  Beaches: "sunny-outline",
  History: "library-outline",
  Saved: "heart-outline",
};
const TABS = ["Popular", "Latest", "All"];
const MAX_PRICES = [null, 600, 800, 1000];
const DURATIONS = ["Any", "1-3 days", "4-6 days", "7+ days"];
const DEFAULT_FILTERS = { maxPrice: null, duration: "Any" };

const DURATION_FN = {
  Any: () => true,
  "1-3 days": (d) => d <= 3,
  "4-6 days": (d) => d >= 4 && d <= 6,
  "7+ days": (d) => d >= 7,
};

const SOFT_SHADOW = {
  elevation: 3,
  shadowColor: "#172B4D",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
const HeartButton = ({ saved, onPress, size = 36 }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    hitSlop={8}
    style={{ width: size, height: size }}
    className="items-center justify-center rounded-full bg-white/90"
    accessibilityLabel={saved ? "Remove from saved" : "Save place"}
  >
    <Ionicons
      name={saved ? "heart" : "heart-outline"}
      size={size * 0.55}
      color={saved ? "#EF4444" : "#172B4D"}
    />
  </TouchableOpacity>
);

const SectionTitle = ({ title, subtitle, right }) => (
  <View className="flex-row items-end justify-between px-5 mt-8 mb-4">
    <View className="flex-1 pr-3">
      <Text className="text-lg font-bold text-[#172B4D]">{title}</Text>
      {subtitle ? <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

const PlaceCard = ({ place, saved, onPress, onToggleFav }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.92}
    style={SOFT_SHADOW}
    className="p-3 bg-white w-60 rounded-3xl"
  >
    <View className="relative">
      <Image className="w-full h-40 rounded-2xl" source={imageOf(place)} />

      <View className="absolute flex-row items-center px-2.5 py-1 rounded-full top-2.5 left-2.5 bg-white/90">
        <Ionicons name="star" size={12} color="#FAC22F" />
        <Text className="ml-1 text-xs font-bold text-[#172B4D]">{place.rating}</Text>
      </View>

      <View className="absolute top-2 right-2">
        <HeartButton saved={saved} onPress={onToggleFav} size={32} />
      </View>

      <View className="absolute px-3 py-1.5 rounded-full bottom-2.5 left-2.5 bg-[#172B4D]/85">
        <Text className="text-xs font-semibold text-white">{money(place.price)}</Text>
      </View>
    </View>

    <Text className="mt-3 text-base font-bold text-[#172B4D]" numberOfLines={1}>
      {place.name}
    </Text>

    <View className="flex-row items-center justify-between mt-1.5">
      <View className="flex-row items-center flex-1 pr-2">
        <Ionicons name="location" size={14} color="#578A2B" />
        <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
          {place.country}
        </Text>
      </View>
      <View className="px-2.5 py-1 rounded-full bg-[#F0F7E8]">
        <Text className="text-xs font-medium text-[#477C19]">{place.days} days</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const FilterSheet = ({ visible, draft, setDraft, onApply, onReset, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <View className="justify-end flex-1 bg-black/40">
      <Pressable className="flex-1" onPress={onClose} />
      <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl">
        <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
        <Text className="mb-5 text-lg font-bold text-[#172B4D]">Filters</Text>

        <Text className="mb-2 text-sm font-semibold text-[#24334D]">Maximum price</Text>
        <View className="flex-row flex-wrap mb-3">
          {MAX_PRICES.map((p) => {
            const on = draft.maxPrice === p;
            return (
              <TouchableOpacity
                key={String(p)}
                onPress={() => setDraft((d) => ({ ...d, maxPrice: p }))}
                activeOpacity={0.7}
                className={`px-4 py-2.5 mb-2 mr-2 rounded-full border ${
                  on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                }`}
              >
                <Text className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>
                  {p === null ? "Any" : `Up to ${money(p)}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="mb-2 text-sm font-semibold text-[#24334D]">Duration</Text>
        <View className="flex-row flex-wrap">
          {DURATIONS.map((d) => {
            const on = draft.duration === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDraft((cur) => ({ ...cur, duration: d }))}
                activeOpacity={0.7}
                className={`px-4 py-2.5 mb-2 mr-2 rounded-full border ${
                  on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                }`}
              >
                <Text className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row mt-5">
          <TouchableOpacity
            onPress={onReset}
            activeOpacity={0.7}
            className="items-center justify-center flex-1 py-3.5 mr-2 bg-gray-100 rounded-xl"
          >
            <Text className="text-[15px] font-semibold text-gray-600">Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApply}
            activeOpacity={0.8}
            className="items-center justify-center flex-1 py-3.5 ml-2 bg-green-500 rounded-xl"
          >
            <Text className="text-[15px] font-semibold text-white">Show results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const Index = () => {
  const { user } = useSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const unreadNotifications = user?.unreadNotifications ?? 0;
  const favorites = useFavorites();

  const [places, setPlaces] = useState([]);
  const [guides, setGuides] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("Popular");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [rawPlaces, rawGuides] = await Promise.all([
        fetchPlaces(),
        fetchTopGuides(),
      ]);
      setPlaces(rawPlaces.map(normalizePlace));
      setGuides(rawGuides.map(normalizeGuide));
    } catch (err) {
      console.warn("Failed to fetch home data:", err.message);
      setPlaces([]);
      setGuides([]);

    } finally {
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const activeFilterCount =
    (filters.maxPrice !== null ? 1 : 0) + (filters.duration !== "Any" ? 1 : 0);
  const hasAnyFilter = query.trim() !== "" || category !== "All" || activeFilterCount > 0;

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  /* Navigation */
  const openPlace = (place) => router.push(`/place/${place.id}`);
  const openGuide = (guide) => router.push(`/guide/${guide.id}`);

  /* Everything that passes search, category and filters */
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

  /* Guides respond to search, and are hidden when a place category is chosen */
  const filteredGuides = useMemo(() => {
    if (category !== "All") return [];
    const q = query.trim().toLowerCase();
    return guides.filter(
      (g) =>
        g.isActive &&
        (!q ||
          `${g.name} ${g.location} ${(g.languages || []).join(" ")} ${(g.areasOfExpertise || []).join(" ")}`
            .toLowerCase()
            .includes(q))
    );
  }, [guides, category, query]);

  const featured = places.find((p) => p.featured) || places[0];
  const showFeatured = !hasAnyFilter && featured;

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
    await loadData();
    setRefreshing(false);
  };

  /* -------------------------------- render ------------------------------- */
  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <StatusBar barStyle="light-content" backgroundColor={BANNER_GREEN} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ADE80"
            progressViewOffset={insets.top}
          />
        }
      >
        {/* Top banner */}
        <View
          style={{ paddingTop: insets.top + 12, backgroundColor: BANNER_GREEN }}
          className="px-5 pb-16 overflow-hidden rounded-b-[36px]"
        >
          <View className="absolute w-64 h-64 rounded-full -right-16 -top-20 bg-white/10" />
          <View className="absolute rounded-full w-44 h-44 -left-14 -bottom-10 bg-white/10" />
          <View className="absolute w-16 h-16 rounded-full right-24 top-32 bg-white/10" />

          {/* Greeting row */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/Profile")}
              activeOpacity={0.85}
              accessibilityLabel="Open profile"
            >
              <Image
                className="w-12 h-12 border-2 border-white rounded-2xl"
                source={AVATAR}
              />
            </TouchableOpacity>

            <View className="flex-1 ml-3">
              <Text className="text-sm text-white/80">{greeting()}</Text>
              <Text className="text-lg font-bold text-white" numberOfLines={1}>
                {user?.name || "Visitor"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/Notification")}
              activeOpacity={0.8}
              className="items-center justify-center rounded-full w-11 h-11 bg-white/20"
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={22} color="white" />
              {unreadNotifications > 0 && (
                <View className="absolute w-2.5 h-2.5 bg-red-500 border-2 rounded-full border-[#22C55E] top-2.5 right-3" />
              )}
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <Text className="mt-6 text-[30px] font-extrabold leading-9 text-white">
            Explore the{"\n"}beautiful world!
          </Text>
          <Text className="mt-2 text-sm leading-5 text-white/85">
            Live video tours with local guides, wherever you want to go.
          </Text>

          {/* Quick facts from your data */}
          <View className="flex-row mt-4">
            <View className="flex-row items-center px-3 py-1.5 mr-2 rounded-full bg-white/20">
              <Ionicons name="earth-outline" size={14} color="white" />
              <Text className="ml-1.5 text-xs font-semibold text-white">
                {places.length} destinations
              </Text>
            </View>
            <View className="flex-row items-center px-3 py-1.5 rounded-full bg-white/20">
              <Ionicons name="people-outline" size={14} color="white" />
              <Text className="ml-1.5 text-xs font-semibold text-white">
                {guides.length} local guides
              </Text>
            </View>
          </View>
        </View>

        {/* Search bar, floating over the banner edge */}
        <View className="px-5 -mt-7">
          <View
            style={{ ...SOFT_SHADOW, shadowOpacity: 0.14, elevation: 6 }}
            className="flex-row items-center px-4 bg-white rounded-2xl h-[58px]"
          >
            <Ionicons name="search-outline" size={21} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search places or guides"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              className="flex-1 ml-3 text-[15px] text-[#172B4D]"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                hitSlop={10}
                accessibilityLabel="Clear search"
                style={{ marginRight: 8 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            <View className="w-px h-6 mx-2 bg-gray-200" />

            <TouchableOpacity
              onPress={openFilters}
              activeOpacity={0.7}
              hitSlop={8}
              className="items-center justify-center w-9 h-9"
              accessibilityLabel="Filters"
            >
              <Ionicons name="options-outline" size={24} color="#477C19" />
              {activeFilterCount > 0 && (
                <View className="absolute items-center justify-center w-4 h-4 bg-green-500 rounded-full -top-0.5 -right-0.5">
                  <Text className="text-[10px] font-bold text-white">{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                activeOpacity={0.75}
                className={`flex-row items-center px-4 py-2.5 mr-2 rounded-full border ${
                  active ? "bg-green-500 border-green-500" : "bg-white border-gray-200"
                }`}
              >
                <Ionicons
                  name={CATEGORY_ICONS[c]}
                  size={16}
                  color={active ? "#FFFFFF" : "#578A2B"}
                />
                <Text className={`ml-1.5 text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`}>
                  {c}
                  {c === "Saved" && favorites.length > 0 ? ` (${favorites.length})` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured */}
        {showFeatured && (
          <TouchableOpacity
            onPress={() => openPlace(featured)}
            activeOpacity={0.92}
            style={SOFT_SHADOW}
            className="h-64 mx-5 mt-6 overflow-hidden rounded-[28px]"
          >
            <Image source={HERO_IMAGE} className="absolute w-full h-full" resizeMode="cover" />
            <Image source={HERO_SHADOW} className="absolute bottom-0 w-full h-36" resizeMode="stretch" />

            <View className="flex-row items-start justify-between p-4">
              <View className="flex-row items-center px-3 py-1.5 rounded-full bg-white/90">
                <Ionicons name="sparkles" size={13} color="#477C19" />
                <Text className="ml-1.5 text-xs font-semibold text-[#477C19]">Top travel location</Text>
              </View>
              <HeartButton saved={favorites.includes(featured.id)} onPress={() => toggleFav(featured)} />
            </View>

            <View className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between p-5">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold text-white" numberOfLines={1}>
                  {featured.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location" size={15} color="#04E0F8" />
                  <Text className="ml-1 text-sm text-white">
                    {featured.country} · {featured.coords}
                  </Text>
                </View>
              </View>
              <View className="px-3.5 py-2 rounded-full bg-white/95">
                <Text className="text-sm font-bold text-[#172B4D]">From {money(featured.price)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Travel places */}
        <SectionTitle
          title="Travel Places"
          subtitle="Find your next destination"
          right={
            <View className="flex-row p-1 bg-white rounded-full">
              {TABS.map((t) => {
                const active = tab === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTab(t)}
                    activeOpacity={0.8}
                    className={`px-3 py-1.5 rounded-full ${active ? "bg-[#EAF8D9]" : ""}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${active ? "text-[#477C19]" : "text-gray-500"}`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />

        {listed.length === 0 ? (
          <View className="items-center px-10 mt-2">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
              <Ionicons
                name={category === "Saved" ? "heart-outline" : "search-outline"}
                size={36}
                color="#578A2B"
              />
            </View>
            <Text className="mt-5 text-lg font-bold text-[#172B4D]">
              {category === "Saved" && !hasAnyFilter ? "Nothing saved yet" : "No places found"}
            </Text>
            <Text className="mt-1 text-sm text-center text-gray-500">
              {category === "Saved"
                ? "Tap the heart on any place to save it here."
                : "Try a different search or adjust your filters."}
            </Text>
            {hasAnyFilter && (
              <TouchableOpacity
                onPress={clearAll}
                activeOpacity={0.8}
                className="px-5 py-3 mt-5 rounded-xl bg-[#EEF2FB]"
              >
                <Text className="text-sm font-semibold text-[#4060B2]">Clear search and filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            horizontal
            data={listed}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
            ItemSeparatorComponent={() => <View className="w-4" />}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                saved={favorites.includes(item.id)}
                onPress={() => openPlace(item)}
                onToggleFav={() => toggleFav(item)}
              />
            )}
          />
        )}

        {/* Top guides */}
        {filteredGuides.length > 0 && (
          <>
            <SectionTitle title="Top Guides" subtitle="Verified locals, ready for a live tour" />
            <FlatList
              horizontal
              data={filteredGuides}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              ItemSeparatorComponent={() => <View className="w-3.5" />}
              renderItem={({ item }) => (
                <GuideCard guide={item} onPress={() => openGuide(item)} />
              )}
            />
          </>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <>
            <SectionTitle title="Recommended for you" subtitle="Highest rated right now" />
            <View
              style={SOFT_SHADOW}
              className="px-4 mx-5 overflow-hidden bg-white rounded-3xl"
            >
              {recommended.map((place, index) => (
                <TouchableOpacity
                  key={place.id}
                  onPress={() => openPlace(place)}
                  activeOpacity={0.7}
                  className={`flex-row items-center py-4 ${
                    index !== recommended.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <Image className="w-16 h-16 rounded-2xl" source={imageOf(place)} />
                  <View className="flex-1 ml-3">
                    <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={13} color="#6B7280" />
                      <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
                        {place.country}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="star" size={13} color="#FAC22F" />
                      <Text className="ml-1 text-xs text-gray-500">
                        {place.rating} ({place.reviews.toLocaleString()})
                      </Text>
                    </View>
                  </View>
                  <View className="items-end ml-2">
                    <Text className="text-sm font-bold text-[#172B4D]">{money(place.price)}</Text>
                    <View className="px-3 py-1 mt-2 rounded-full bg-[#EEF2FB]">
                      <Text className="text-xs font-semibold text-[#4060B2]">View</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Toast (sits above the floating tab bar) */}
      {toast ? (
        <View
          style={{ bottom: insets.bottom + 96 }}
          className="absolute left-5 right-5"
          pointerEvents="none"
        >
          <View className="flex-row items-center px-4 py-3 rounded-2xl bg-[#172B4D]">
            <Ionicons name="checkmark-circle" size={18} color="#86D36B" />
            <Text className="ml-2 text-sm font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}

      <FilterSheet
        visible={filterOpen}
        draft={draftFilters}
        setDraft={setDraftFilters}
        onApply={applyFilters}
        onReset={() => setDraftFilters(DEFAULT_FILTERS)}
        onClose={() => setFilterOpen(false)}
      />
    </View>
  );
};

export default Index;
