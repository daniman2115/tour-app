// app/guide/[id].jsx   ->  route: /guide/g1
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DAY_ORDER,
  WEEKDAYS,
  formatTime12,
  guideImageOf,
  imageOf,
  money,
  normalizeGuide,
  normalizePlace,
  timeAgo,
} from "../../data/mockData";
import { fetchGuideById, fetchGuideReviews } from "../../services/apiService";
import { fetchPlaces } from "../../services/placeService";

const Stars = ({ rating, size = 14 }) => (
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

const Card = ({ title, subtitle, icon, children }) => (
  <View className="p-4 mx-5 mt-4 bg-white rounded-2xl">
    <View className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
        <Ionicons name={icon} size={21} color="#578A2B" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold text-[#24334D]">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text> : null}
      </View>
    </View>
    <View className="mt-4">{children}</View>
  </View>
);

const Chip = ({ label }) => (
  <View className="px-3 py-1.5 mb-2 mr-2 rounded-full bg-[#EAF8D9]">
    <Text className="text-sm font-medium text-[#477C19]">{label}</Text>
  </View>
);

export default function GuideDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [guide, setGuide] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [rawGuide, rawReviews, rawPlaces] = await Promise.all([
          fetchGuideById(id),
          fetchGuideReviews(id),
          fetchPlaces(),
        ]);
        if (mounted) {
          const ng = normalizeGuide(rawGuide);
          setGuide(ng);
          setReviews((rawReviews || []).map((r) => ({ ...r, id: r._id, visitorName: r.visitorId?.name || r.visitorName || "Visitor" })));
          // Show places in the same country as the guide's location
          const country = (ng.location || "").split(",").pop()?.trim().toLowerCase();
          const filtered = (rawPlaces || [])
            .map(normalizePlace)
            .filter((p) => !country || (p.country || "").toLowerCase() === country);
          setPlaces(filtered.length ? filtered : (rawPlaces || []).map(normalizePlace).slice(0, 4));
        }
      } catch (err) {
        console.warn("Failed to fetch guide:", err.message);
        if (mounted) {
          setGuide(null);
          setReviews([]);
          setPlaces([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-[#F7F9FC]">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="mt-4 text-lg font-bold text-[#172B4D]">Loading…</Text>
      </View>
    );
  }

  if (!guide) {
    return (
      <View className="items-center justify-center flex-1 px-10 bg-[#F7F9FC]">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-lg font-bold text-[#172B4D]">Guide not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 mt-5 bg-green-500 rounded-xl"
        >
          <Text className="font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = WEEKDAYS[new Date().getDay()];
  const availabilityByDay = Object.fromEntries(guide.availability.map((s) => [s.day, s]));
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const book = () => router.push({ pathname: "/bookTour", params: { guideId: guide.id } });

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="items-center justify-center w-10 h-10 bg-white rounded-full"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
          </TouchableOpacity>
          <Text className="flex-1 ml-4 text-lg font-bold text-[#172B4D]">Guide profile</Text>
        </View>

        {/* Profile card */}
        <View className="mx-5 overflow-hidden bg-white rounded-3xl">
          <View className="bg-green-400 h-28">
            <View className="absolute w-40 h-40 rounded-full -right-8 -top-14 bg-white/20" />
            <View className="absolute w-24 h-24 rounded-full -left-8 top-10 bg-white/20" />
          </View>

          <View className="items-center px-5 pb-6">
            <Image
              className="border-4 border-white rounded-full -mt-16 h-28 w-28"
              source={guideImageOf(guide)}
            />

            <View className="flex-row items-center mt-3">
              <Text className="text-xl font-bold text-[#172B4D]" numberOfLines={1}>
                {guide.name}
              </Text>
              {guide.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#477C19"
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-500">{guide.location}</Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Stars rating={guide.rating} />
              <Text className="ml-2 text-sm text-gray-500">
                {guide.rating} ({guide.totalReviews} reviews)
              </Text>
            </View>

            <View className="mt-5 w-full flex-row items-center rounded-2xl bg-[#F5F8F0] py-4">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-[#172B4D]">{guide.completedCalls}</Text>
                <Text className="mt-1 text-xs text-gray-500">Completed calls</Text>
              </View>
              <View className="w-px h-9 bg-[#DDE6CF]" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-[#172B4D]">{guide.experience}+</Text>
                <Text className="mt-1 text-xs text-gray-500">Years guiding</Text>
              </View>
              <View className="w-px h-9 bg-[#DDE6CF]" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-[#172B4D]">{money(guide.pricePerHour)}</Text>
                <Text className="mt-1 text-xs text-gray-500">Per hour</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <Card title="About" subtitle={`Meet ${guide.name.split(" ")[0]}`} icon="document-text-outline">
          <Text className="text-[15px] leading-6 text-[#24334D]">{guide.bio}</Text>
        </Card>

        {/* Languages */}
        <Card title="Languages Spoken" subtitle="Languages they guide in" icon="language-outline">
          <View className="flex-row flex-wrap">
            {guide.languages.map((l) => (
              <Chip key={l} label={l} />
            ))}
          </View>
        </Card>

        {/* Expertise */}
        <Card title="Areas of Expertise" subtitle="What they love showing" icon="compass-outline">
          <View className="flex-row flex-wrap">
            {guide.areasOfExpertise.map((e) => (
              <Chip key={e} label={e} />
            ))}
          </View>
        </Card>

        {/* Tours */}
        {places.length > 0 && (
          <Card title="Tours Offered" subtitle="Places this guide covers" icon="map-outline">
            {places.map((place, index) => (
              <TouchableOpacity
                key={place.id}
                onPress={() => router.push(`/place/${place.id}`)}
                activeOpacity={0.7}
                className={`flex-row items-center py-3 ${
                  index !== places.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Image className="w-12 h-12 rounded-xl" source={imageOf(place)} />
                <View className="flex-1 ml-3">
                  <Text className="text-[15px] font-semibold text-[#24334D]">{place.name}</Text>
                  <Text className="mt-0.5 text-xs text-gray-500">{place.country}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#A0A8B5" />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Availability */}
        <Card title="Availability" subtitle="Weekly schedule" icon="calendar-outline">
          {DAY_ORDER.map((day, index) => {
            const slot = availabilityByDay[day];
            const isToday = day === today;
            return (
              <View
                key={day}
                className={`flex-row items-center justify-between py-2.5 ${
                  index !== DAY_ORDER.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`text-sm ${
                      isToday ? "font-bold text-[#477C19]" : "font-medium text-[#24334D]"
                    }`}
                  >
                    {day}
                  </Text>
                  {isToday && (
                    <View className="px-2 py-0.5 ml-2 rounded-full bg-[#EAF8D9]">
                      <Text className="text-[10px] font-semibold text-[#477C19]">Today</Text>
                    </View>
                  )}
                </View>
                <Text className={`text-sm ${slot ? "text-gray-600" : "text-gray-300"}`}>
                  {slot ? `${formatTime12(slot.startTime)} - ${formatTime12(slot.endTime)}` : "Unavailable"}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Reviews */}
        <Card
          title="Reviews"
          subtitle={`${guide.rating} average · ${guide.totalReviews} total`}
          icon="chatbubbles-outline"
        >
          {reviews.length === 0 ? (
            <Text className="text-sm text-gray-400">No reviews yet.</Text>
          ) : (
            <>
              {visibleReviews.map((r, index) => (
                <View
                  key={r.id}
                  className={`py-3 ${index !== visibleReviews.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-[#24334D]">{r.visitorName}</Text>
                    <Text className="text-xs text-gray-400">{timeAgo(r.createdAt)}</Text>
                  </View>
                  <View className="flex-row items-center mt-1.5">
                    <Stars rating={r.rating} size={13} />
                    {r.tipAmount > 0 && (
                      <View className="px-2 py-0.5 ml-2 rounded-full bg-[#FFF4D6]">
                        <Text className="text-[10px] font-semibold text-[#9A6B00]">
                          Tipped {money(r.tipAmount)}
                        </Text>
                      </View>
                    )}
                  </View>
                  {r.comment ? (
                    <Text className="mt-2 text-sm leading-5 text-gray-600">{r.comment}</Text>
                  ) : null}
                </View>
              ))}

              {reviews.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews((v) => !v)}
                  activeOpacity={0.7}
                  className="items-center py-2.5 mt-2 rounded-xl bg-[#EEF2FB]"
                >
                  <Text className="text-sm font-semibold text-[#4060B2]">
                    {showAllReviews ? "Show fewer" : `Show all ${reviews.length} reviews`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="absolute bottom-0 left-0 right-0 flex-row items-center px-5 pt-3 bg-white border-t border-gray-100"
      >
        <View className="flex-1">
          <Text className="text-xs text-gray-500">Price</Text>
          <Text className="text-lg font-bold text-[#172B4D]">{money(guide.pricePerHour)} / hour</Text>
        </View>
        <TouchableOpacity
          onPress={book}
          activeOpacity={0.85}
          className="px-8 py-4 bg-green-500 rounded-2xl"
        >
          <Text className="text-[15px] font-semibold text-white">Book now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
