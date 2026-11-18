// components/HomeKit.jsx
// Shared building blocks for the home screen layouts.
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_TINT,
  DURATIONS,
  MAX_PRICES,
  canJoin,
  greeting,
  startsIn,
} from "../data/homeData";
import { guideImageOf, imageOf, money, timeAgo } from "../data/mockData";

export const AVATAR = require("../assets/images/homeimg.png");
export const HERO_IMAGE = require("../assets/images/homebg.png");
export const HERO_SHADOW = require("../assets/images/homeshadow.png");

/* ------------------------------------------------------------------ */
/* Small atoms                                                         */
/* ------------------------------------------------------------------ */
export const HeartButton = ({ saved, onPress, size = 36 }) => (
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

export const Stars = ({ rating, size = 13 }) => (
  <View className="flex-row">
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={rating >= i ? "star" : rating >= i - 0.5 ? "star-half" : "star-outline"}
        size={size}
        color="#FAC22F"
      />
    ))}
  </View>
);

export const SectionTitle = ({ title, subtitle, right, className = "px-5 mt-8 mb-3" }) => (
  <View className={`flex-row items-end justify-between ${className}`}>
    <View className="flex-1 pr-3">
      <Text className="text-lg font-bold text-[#172B4D]">{title}</Text>
      {subtitle ? <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

export const Segmented = ({ options, value, onChange }) => (
  <View className="flex-row p-1 bg-white rounded-full">
    {options.map((o) => {
      const active = value === o;
      return (
        <TouchableOpacity
          key={o}
          onPress={() => onChange(o)}
          activeOpacity={0.8}
          className={`px-3 py-1.5 rounded-full ${active ? "bg-[#EAF8D9]" : ""}`}
        >
          <Text className={`text-xs font-semibold ${active ? "text-[#477C19]" : "text-gray-500"}`}>
            {o}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/* Horizontal list with the standard side padding */
export const HList = ({ data, renderItem, gap = 14 }) => (
  <FlatList
    horizontal
    data={data}
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 20 }}
    ItemSeparatorComponent={() => <View style={{ width: gap }} />}
    renderItem={renderItem}
  />
);

/* ------------------------------------------------------------------ */
/* Header, search, categories                                          */
/* ------------------------------------------------------------------ */
export const HomeHeader = ({ name, unread, onProfile, onBell, dark = false }) => (
  <View className="flex-row items-center px-5">
    <TouchableOpacity onPress={onProfile} activeOpacity={0.8} accessibilityLabel="Open profile">
      <Image className="w-12 h-12 rounded-2xl" source={AVATAR} />
    </TouchableOpacity>
    <View className="flex-1 ml-3">
      <Text className={`text-sm ${dark ? "text-white/80" : "text-gray-500"}`}>{greeting()}</Text>
      <Text
        className={`text-lg font-bold ${dark ? "text-white" : "text-[#172B4D]"}`}
        numberOfLines={1}
      >
        {name || "Visitor"}
      </Text>
    </View>
    <TouchableOpacity
      onPress={onBell}
      activeOpacity={0.7}
      className={`items-center justify-center rounded-full w-11 h-11 ${dark ? "bg-white/20" : "bg-white"}`}
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={22} color={dark ? "#FFFFFF" : "#172B4D"} />
      {unread > 0 && (
        <View
          className={`absolute w-2.5 h-2.5 bg-red-500 border-2 rounded-full top-2.5 right-3 ${
            dark ? "border-green-400" : "border-white"
          }`}
        />
      )}
    </TouchableOpacity>
  </View>
);

export const SearchRow = ({ query, onChange, onOpenFilters, activeFilterCount, elevated = false }) => (
  <View className="flex-row items-center px-5">
    <View
      className={`flex-row items-center flex-1 px-4 bg-white rounded-2xl h-[52px] ${
        elevated ? "shadow-md" : ""
      }`}
      style={elevated ? { elevation: 5, shadowColor: "#172B4D", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } } : undefined}
    >
      <Ionicons name="search-outline" size={20} color="#9CA3AF" />
      <TextInput
        value={query}
        onChangeText={onChange}
        placeholder="Search places or guides"
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        className="flex-1 ml-3 text-[15px] text-[#172B4D]"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>

    <TouchableOpacity
      onPress={onOpenFilters}
      activeOpacity={0.8}
      className="items-center justify-center ml-3 bg-green-500 rounded-2xl h-[52px] w-[52px]"
      accessibilityLabel="Filters"
    >
      <Ionicons name="options-outline" size={24} color="white" />
      {activeFilterCount > 0 && (
        <View className="absolute items-center justify-center w-5 h-5 bg-white border border-green-500 rounded-full -top-1.5 -right-1.5">
          <Text className="text-[11px] font-bold text-green-600">{activeFilterCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const savedSuffix = (c, n) => (c === "Saved" && n > 0 ? ` (${n})` : "");

/* Pill chips */
export const CategoryChips = ({ category, setCategory, savedCount }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
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
          <Ionicons name={CATEGORY_ICONS[c]} size={16} color={active ? "#FFFFFF" : "#578A2B"} />
          <Text className={`ml-1.5 text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`}>
            {c}
            {savedSuffix(c, savedCount)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

/* Round icons with a label underneath */
export const CategoryCircles = ({ category, setCategory, savedCount }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 20 }}
  >
    {CATEGORIES.map((c) => {
      const active = category === c;
      return (
        <TouchableOpacity
          key={c}
          onPress={() => setCategory(c)}
          activeOpacity={0.75}
          className="items-center mr-5"
        >
          <View
            className={`items-center justify-center rounded-full h-14 w-14 border ${
              active ? "bg-green-500 border-green-500" : "bg-white border-gray-200"
            }`}
          >
            <Ionicons name={CATEGORY_ICONS[c]} size={22} color={active ? "#FFFFFF" : "#578A2B"} />
          </View>
          <Text
            className={`mt-2 text-xs font-semibold ${active ? "text-[#477C19]" : "text-gray-500"}`}
          >
            {c}
            {savedSuffix(c, savedCount)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

/* Tinted tiles */
export const CategoryTiles = ({ category, setCategory, savedCount }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 20 }}
  >
    {CATEGORIES.map((c) => {
      const active = category === c;
      const [bg, fg] = CATEGORY_TINT[c];
      return (
        <TouchableOpacity
          key={c}
          onPress={() => setCategory(c)}
          activeOpacity={0.8}
          className={`items-center w-[84px] py-3 mr-3 rounded-2xl bg-white border-2 ${
            active ? "border-green-500" : "border-transparent"
          }`}
        >
          <View
            style={{ backgroundColor: bg }}
            className="items-center justify-center w-12 h-12 rounded-xl"
          >
            <Ionicons name={CATEGORY_ICONS[c]} size={22} color={fg} />
          </View>
          <Text className="mt-2 text-xs font-semibold text-[#24334D]">
            {c}
            {savedSuffix(c, savedCount)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

export const LanguageChips = ({ languages, active, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 20 }}
  >
    {languages.map((l) => {
      const on = active === l;
      return (
        <TouchableOpacity
          key={l}
          onPress={() => onSelect(l)}
          activeOpacity={0.75}
          className={`flex-row items-center px-4 py-2.5 mr-2 rounded-full border ${
            on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
          }`}
        >
          <Ionicons name="language-outline" size={15} color="#578A2B" />
          <Text className={`ml-1.5 text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>
            {l}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

/* ------------------------------------------------------------------ */
/* Place components                                                    */
/* ------------------------------------------------------------------ */
export const Hero = ({ place, saved, onPress, onToggleFav }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.92}
    className="h-64 mx-5 overflow-hidden rounded-3xl"
  >
    <Image source={HERO_IMAGE} className="absolute w-full h-full" resizeMode="cover" />
    <Image source={HERO_SHADOW} className="absolute bottom-0 w-full h-36" resizeMode="stretch" />

    <View className="flex-row items-start justify-between p-4">
      <View className="px-3 py-1.5 rounded-full bg-white/90">
        <Text className="text-xs font-semibold text-[#477C19]">Top travel location</Text>
      </View>
      <HeartButton saved={saved} onPress={onToggleFav} />
    </View>

    <View className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between p-5">
      <View className="flex-1 pr-3">
        <Text className="text-xl font-bold text-white" numberOfLines={1}>
          {place.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location" size={15} color="#04E0F8" />
          <Text className="ml-1 text-sm text-white">
            {place.country} · {place.coords}
          </Text>
        </View>
      </View>
      <View className="px-3 py-1.5 rounded-full bg-white/90">
        <Text className="text-sm font-bold text-[#172B4D]">From {money(place.price)}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

/* White card used in carousels */
export const PlaceCard = ({ place, saved, onPress, onToggleFav }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="w-56 p-2.5 bg-white rounded-2xl">
    <View className="relative">
      <Image className="w-full h-36 rounded-xl" source={imageOf(place)} />
      <View className="absolute top-2 right-2">
        <HeartButton saved={saved} onPress={onToggleFav} size={32} />
      </View>
      <View className="absolute px-2.5 py-1 rounded-full bottom-2 left-2 bg-[#172B4D]/80">
        <Text className="text-xs font-semibold text-white">{money(place.price)}</Text>
      </View>
    </View>

    <Text className="mt-3 text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
      {place.name}
    </Text>

    <View className="flex-row items-center justify-between mt-1.5">
      <View className="flex-row items-center flex-1">
        <Ionicons name="location-outline" size={14} color="#578A2B" />
        <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
          {place.country}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Ionicons name="star" size={13} color="#FAC22F" />
        <Text className="ml-1 text-xs text-gray-500">{place.rating}</Text>
      </View>
    </View>

    <View className="self-start px-2.5 py-1 mt-2.5 rounded-full bg-[#F0F7E8]">
      <Text className="text-xs font-medium text-[#477C19]">{place.days} days</Text>
    </View>
  </TouchableOpacity>
);

/* Big image card with text over the photo */
export const PlaceCardLarge = ({ place, saved, onPress, onToggleFav }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.92}
    className="overflow-hidden rounded-3xl w-[280px] h-[200px]"
  >
    <Image source={imageOf(place)} className="absolute w-full h-full" resizeMode="cover" />
    <Image source={HERO_SHADOW} className="absolute bottom-0 w-full h-28" resizeMode="stretch" />

    <View className="flex-row items-start justify-between p-3">
      <View className="px-2.5 py-1 rounded-full bg-white/90">
        <Text className="text-[11px] font-semibold text-[#477C19]">{place.category}</Text>
      </View>
      <HeartButton saved={saved} onPress={onToggleFav} size={34} />
    </View>

    <View className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between p-4">
      <View className="flex-1 pr-2">
        <Text className="text-lg font-bold text-white" numberOfLines={1}>
          {place.name}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Ionicons name="location" size={13} color="#04E0F8" />
          <Text className="ml-1 text-xs text-white">{place.country}</Text>
          <Ionicons name="star" size={12} color="#FAC22F" style={{ marginLeft: 10 }} />
          <Text className="ml-1 text-xs text-white">{place.rating}</Text>
        </View>
      </View>
      <View className="px-2.5 py-1 rounded-full bg-white/90">
        <Text className="text-xs font-bold text-[#172B4D]">{money(place.price)}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

/* Borderless grid card (two per row) */
export const PlaceGridCard = ({ place, saved, onPress, onToggleFav, width }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ width }}>
    <View className="relative">
      <Image style={{ width, height: width * 1.05 }} className="rounded-2xl" source={imageOf(place)} />
      <View className="absolute top-2 right-2">
        <HeartButton saved={saved} onPress={onToggleFav} size={32} />
      </View>
    </View>
    <View className="flex-row items-center justify-between mt-2.5">
      <Text className="flex-1 pr-2 text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
        {place.name}
      </Text>
      <View className="flex-row items-center">
        <Ionicons name="star" size={12} color="#FAC22F" />
        <Text className="ml-1 text-xs text-gray-500">{place.rating}</Text>
      </View>
    </View>
    <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
      {place.country} · {place.days} days
    </Text>
    <Text className="mt-1 text-sm text-[#172B4D]">
      <Text className="font-bold">{money(place.price)}</Text>
      <Text className="text-gray-500"> per tour</Text>
    </Text>
  </TouchableOpacity>
);

export const PlacesGrid = ({ places, favorites, onOpen, onToggleFav }) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 40 - 14) / 2;
  return (
    <View className="flex-row flex-wrap justify-between px-5">
      {places.map((p) => (
        <View key={p.id} className="mb-5">
          <PlaceGridCard
            place={p}
            width={cardWidth}
            saved={favorites.includes(p.id)}
            onPress={() => onOpen(p)}
            onToggleFav={() => onToggleFav(p)}
          />
        </View>
      ))}
    </View>
  );
};

/* Vertical list rows */
export const PlaceRow = ({ place, saved, isLast, onPress, onToggleFav }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center py-4 ${isLast ? "" : "border-b border-gray-100"}`}
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
      <TouchableOpacity
        onPress={onToggleFav}
        hitSlop={8}
        className="items-center justify-center w-8 h-8 mt-1.5 rounded-full bg-[#F7F9FC]"
        accessibilityLabel={saved ? "Remove from saved" : "Save place"}
      >
        <Ionicons
          name={saved ? "heart" : "heart-outline"}
          size={17}
          color={saved ? "#EF4444" : "#6B7280"}
        />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const GuideRow = ({ guide, isLast, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center py-4 ${isLast ? "" : "border-b border-gray-100"}`}
  >
    <Image className="w-14 h-14 rounded-2xl" source={guideImageOf(guide)} />
    <View className="flex-1 ml-3">
      <View className="flex-row items-center">
        <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
          {guide.name}
        </Text>
        {guide.isVerified && (
          <Ionicons name="checkmark-circle" size={15} color="#477C19" style={{ marginLeft: 4 }} />
        )}
      </View>
      <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
        {guide.languages.join(", ")} · {guide.location.split(",")[0]}
      </Text>
      <View className="flex-row items-center mt-1">
        <Ionicons name="star" size={12} color="#FAC22F" />
        <Text className="ml-1 text-xs text-gray-500">
          {guide.rating} ({guide.totalReviews})
        </Text>
      </View>
    </View>
    <View className="items-end ml-2">
      <Text className="text-sm font-bold text-[#172B4D]">{money(guide.pricePerHour)}</Text>
      <Text className="text-[11px] text-gray-400">per hour</Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#A0A8B5" />
  </TouchableOpacity>
);

/* ------------------------------------------------------------------ */
/* Extra sections                                                      */
/* ------------------------------------------------------------------ */
export const UpcomingCard = ({ booking, onDetails, onJoin }) => {
  if (!booking) return null;
  const joinable = canJoin(booking.scheduledAt);
  return (
    <View className="p-4 mx-5 rounded-3xl bg-[#172B4D]">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold tracking-wide text-[#86D36B]">YOUR NEXT TOUR</Text>
        <View className="px-2.5 py-1 rounded-full bg-white/15">
          <Text className="text-[11px] font-semibold text-white">Confirmed</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-3">
        <Image className="w-14 h-14 rounded-2xl" source={guideImageOf(booking.guide)} />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-white" numberOfLines={1}>
            {booking.place ? `Virtual tour of ${booking.place.name}` : "Virtual tour"}
          </Text>
          <Text className="mt-0.5 text-sm text-white/70" numberOfLines={1}>
            with {booking.guide.name} · {booking.duration} min
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-3">
        <Ionicons name="time-outline" size={16} color="#86D36B" />
        <Text className="ml-1.5 text-sm font-semibold text-white">{startsIn(booking.scheduledAt)}</Text>
      </View>

      <View className="flex-row mt-4">
        <TouchableOpacity
          onPress={onDetails}
          activeOpacity={0.8}
          className="items-center justify-center flex-1 py-3 mr-2 rounded-xl bg-white/10"
        >
          <Text className="text-sm font-semibold text-white">Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onJoin}
          disabled={!joinable}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center flex-1 py-3 ml-2 rounded-xl ${
            joinable ? "bg-green-500" : "bg-white/20"
          }`}
        >
          <Ionicons name="videocam" size={16} color={joinable ? "#FFFFFF" : "#9CA3AF"} />
          <Text className={`ml-1.5 text-sm font-semibold ${joinable ? "text-white" : "text-gray-400"}`}>
            Join call
          </Text>
        </TouchableOpacity>
      </View>
      {!joinable && (
        <Text className="mt-2 text-xs text-center text-white/50">Joining opens 10 minutes before the start</Text>
      )}
    </View>
  );
};

export const QuickActions = ({ items }) => (
  <View className="flex-row px-5">
    {items.map((item, index) => (
      <TouchableOpacity
        key={item.label}
        onPress={item.onPress}
        activeOpacity={0.8}
        className={`items-center flex-1 py-3 bg-white rounded-2xl ${index === 0 ? "" : "ml-2.5"}`}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
          <Ionicons name={item.icon} size={21} color="#578A2B" />
          {item.badge > 0 && (
            <View className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-green-500 border-2 border-white">
              <Text className="text-[10px] font-bold text-white">{item.badge}</Text>
            </View>
          )}
        </View>
        <Text className="mt-2 text-xs font-semibold text-[#24334D]">{item.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const ReviewCard = ({ review, onOpenGuide }) => (
  <View className="p-4 bg-white rounded-2xl w-[290px]">
    <View className="flex-row items-center">
      <View className="items-center justify-center w-10 h-10 rounded-full bg-[#EAF8D9]">
        <Text className="text-base font-bold text-[#477C19]">{review.travelerName?.charAt(0)?.toUpperCase() ?? "?"}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold text-[#24334D]">{review.travelerName}</Text>
        <Text className="mt-0.5 text-xs text-gray-400">{timeAgo(review.createdAt)}</Text>
      </View>
      <Stars rating={review.rating} size={12} />
    </View>
    <Text className="mt-3 text-sm leading-5 text-gray-600" numberOfLines={3}>
      {review.comment}
    </Text>
    <TouchableOpacity
      onPress={onOpenGuide}
      activeOpacity={0.7}
      className="flex-row items-center pt-3 mt-3 border-t border-gray-100"
    >
      <Image className="w-6 h-6 rounded-full" source={guideImageOf(review.guide)} />
      <Text className="flex-1 ml-2 text-xs text-gray-500" numberOfLines={1}>
        Tour with <Text className="font-semibold text-[#24334D]">{review.guide.name}</Text>
      </Text>
      <MaterialIcons name="chevron-right" size={18} color="#A0A8B5" />
    </TouchableOpacity>
  </View>
);

const STEPS = [
  { icon: "search-outline", title: "Pick a guide", text: "Browse verified local experts by place and language." },
  { icon: "calendar-outline", title: "Book a time", text: "Choose a slot that fits your schedule." },
  { icon: "videocam-outline", title: "Join live", text: "Explore the place together over video." },
];

export const HowItWorks = () => (
  <View className="px-4 mx-5 bg-white rounded-2xl">
    {STEPS.map((step, index) => (
      <View
        key={step.title}
        className={`flex-row items-center py-4 ${index !== STEPS.length - 1 ? "border-b border-gray-100" : ""}`}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
          <Ionicons name={step.icon} size={21} color="#578A2B" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-[15px] font-semibold text-[#24334D]">
            {index + 1}. {step.title}
          </Text>
          <Text className="mt-1 text-xs leading-4 text-gray-500">{step.text}</Text>
        </View>
      </View>
    ))}
  </View>
);

export const StatsStrip = ({ stats }) => (
  <View className="flex-row items-center py-4 mx-5 bg-white rounded-2xl">
    {[
      { value: stats.guides, label: "Guides" },
      { value: stats.places, label: "Places" },
      { value: stats.countries, label: "Countries" },
      { value: stats.rating, label: "Avg rating" },
    ].map((s, index) => (
      <View key={s.label} className="flex-row items-center flex-1">
        {index > 0 && <View className="w-px h-8 bg-gray-100" />}
        <View className="items-center flex-1">
          <Text className="text-lg font-bold text-[#172B4D]">{s.value}</Text>
          <Text className="mt-0.5 text-[11px] text-gray-500">{s.label}</Text>
        </View>
      </View>
    ))}
  </View>
);

/* ------------------------------------------------------------------ */
/* Results, empty state, toast, filters                                */
/* ------------------------------------------------------------------ */
export const EmptyState = ({ category, onClear }) => (
  <View className="items-center px-10 mt-14">
    <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
      <Ionicons
        name={category === "Saved" ? "heart-outline" : "search-outline"}
        size={36}
        color="#578A2B"
      />
    </View>
    <Text className="mt-5 text-lg font-bold text-[#172B4D]">
      {category === "Saved" ? "Nothing saved yet" : "No results found"}
    </Text>
    <Text className="mt-1 text-sm text-center text-gray-500">
      {category === "Saved"
        ? "Tap the heart on any place to save it here."
        : "Try a different search or adjust your filters."}
    </Text>
    <TouchableOpacity
      onPress={onClear}
      activeOpacity={0.8}
      className="px-5 py-3 mt-5 rounded-xl bg-[#EEF2FB]"
    >
      <Text className="text-sm font-semibold text-[#4060B2]">Clear search and filters</Text>
    </TouchableOpacity>
  </View>
);

/* What the page shows while the user is searching / filtering */
export const ResultsView = ({ places, guides, favorites, category, onOpenPlace, onOpenGuide, onToggleFav, onClear }) => {
  if (places.length === 0 && guides.length === 0) {
    return <EmptyState category={category} onClear={onClear} />;
  }
  return (
    <>
      {places.length > 0 && (
        <>
          <SectionTitle title={`Places (${places.length})`} />
          <View className="px-4 mx-5 overflow-hidden bg-white rounded-2xl">
            {places.map((p, i) => (
              <PlaceRow
                key={p.id}
                place={p}
                saved={favorites.includes(p.id)}
                isLast={i === places.length - 1}
                onPress={() => onOpenPlace(p)}
                onToggleFav={() => onToggleFav(p)}
              />
            ))}
          </View>
        </>
      )}
      {guides.length > 0 && (
        <>
          <SectionTitle title={`Guides (${guides.length})`} />
          <View className="px-4 mx-5 overflow-hidden bg-white rounded-2xl">
            {guides.map((g, i) => (
              <GuideRow
                key={g.id}
                guide={g}
                isLast={i === guides.length - 1}
                onPress={() => onOpenGuide(g)}
              />
            ))}
          </View>
        </>
      )}
      <TouchableOpacity onPress={onClear} activeOpacity={0.7} className="items-center mt-6">
        <Text className="text-sm font-semibold text-[#4060B2]">Clear search and filters</Text>
      </TouchableOpacity>
    </>
  );
};

// Sits above the floating tab bar
export const Toast = ({ message, bottom = 108 }) =>
  message ? (
    <View style={{ bottom }} className="absolute left-5 right-5" pointerEvents="none">
      <View className="flex-row items-center px-4 py-3 rounded-2xl bg-[#172B4D]">
        <Ionicons name="checkmark-circle" size={18} color="#86D36B" />
        <Text className="ml-2 text-sm font-semibold text-white">{message}</Text>
      </View>
    </View>
  ) : null;

export const FilterSheet = ({ visible, draft, setDraft, onApply, onReset, onClose }) => (
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
                <Text className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>{d}</Text>
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