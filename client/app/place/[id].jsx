// app/place/[id].jsx   ->  route: /place/p1
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toggleFavorite, useFavorites } from "../../data/favoritesStore";
import {
  getGuidesForPlace,
  getPlace,
  guideImageOf,
  imageOf,
  money,
} from "../../data/mockData";

export default function PlaceDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const favorites = useFavorites();
  const place = getPlace(id);
  const guides = useMemo(() => getGuidesForPlace(id), [id]);

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  };

  if (!place) {
    return (
      <View className="items-center justify-center flex-1 px-10 bg-[#F7F9FC]">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-lg font-bold text-[#172B4D]">Place not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 mt-5 bg-green-500 rounded-xl"
        >
          <Text className="font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = favorites.includes(place.id);
  const topGuide = guides[0];
  const minRate = guides.length ? Math.min(...guides.map((g) => g.pricePerHour)) : null;

  const onToggleFav = () => {
    const nowSaved = toggleFavorite(place.id);
    showToast(nowSaved ? "Saved to your list" : "Removed from saved");
    // TODO: persist favorites with your API
  };

  const bookTopGuide = () => {
    if (!topGuide) return;
    router.push({
      pathname: "/bookTour",
      params: { guideId: topGuide.id, placeId: place.id },
    });
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        {/* Hero image */}
        <View className="h-80">
          <Image source={imageOf(place)} className="absolute w-full h-full" resizeMode="cover" />
          <View
            style={{ paddingTop: insets.top + 8 }}
            className="flex-row items-center justify-between px-5"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/90"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onToggleFav}
              activeOpacity={0.8}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/90"
              accessibilityLabel={saved ? "Remove from saved" : "Save place"}
            >
              <Ionicons
                name={saved ? "heart" : "heart-outline"}
                size={22}
                color={saved ? "#EF4444" : "#172B4D"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content sheet */}
        <View className="-mt-8 bg-[#F7F9FC] rounded-t-3xl pt-6">
          <View className="flex-row items-start justify-between px-5">
            <View className="flex-1 pr-3">
              <Text className="text-2xl font-bold text-[#172B4D]">{place.name}</Text>
              <View className="flex-row items-center mt-1.5">
                <Ionicons name="location-outline" size={15} color="#578A2B" />
                <Text className="ml-1 text-sm text-gray-500">
                  {place.country} · {place.coords}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center px-3 py-1.5 rounded-full bg-[#FFF4D6]">
              <Ionicons name="star" size={14} color="#FAC22F" />
              <Text className="ml-1 text-sm font-semibold text-[#9A6B00]">{place.rating}</Text>
            </View>
          </View>

          {/* Quick facts */}
          <View className="flex-row px-5 mt-5">
            {[
              { value: `${place.days} days`, label: "Suggested stay" },
              { value: place.reviews.toLocaleString(), label: "Reviews" },
              { value: place.category, label: "Category" },
            ].map((fact, i) => (
              <View
                key={fact.label}
                className={`flex-1 p-3 bg-white rounded-2xl ${i === 0 ? "" : "ml-2"}`}
              >
                <Text className="text-[15px] font-bold text-[#172B4D]" numberOfLines={1}>
                  {fact.value}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500">{fact.label}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <View className="p-4 mx-5 mt-4 bg-white rounded-2xl">
            <Text className="text-base font-bold text-[#172B4D]">About this place</Text>
            <Text className="mt-2 text-sm leading-6 text-gray-600">{place.description}</Text>
          </View>

          {/* Guides */}
          <View className="mx-5 mt-7">
            <Text className="mb-3 text-base font-bold text-[#172B4D]">
              Local guides{guides.length ? ` (${guides.length})` : ""}
            </Text>

            {guides.length === 0 ? (
              <View className="items-center p-6 bg-white rounded-2xl">
                <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                <Text className="mt-2 text-sm text-center text-gray-500">
                  No guides are available for this place yet. Check back soon.
                </Text>
              </View>
            ) : (
              <View className="px-4 overflow-hidden bg-white rounded-2xl">
                {guides.map((guide, index) => (
                  <TouchableOpacity
                    key={guide.id}
                    onPress={() => router.push(`/guide/${guide.id}`)}
                    activeOpacity={0.7}
                    className={`flex-row items-center py-4 ${
                      index !== guides.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <Image className="w-14 h-14 rounded-2xl" source={guideImageOf(guide)} />
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
                          {guide.name}
                        </Text>
                        {guide.isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={15}
                            color="#477C19"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                      <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
                        {guide.languages.join(", ")}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={12} color="#FAC22F" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {guide.rating} ({guide.totalReviews})
                        </Text>
                      </View>
                    </View>
                    <View className="items-end ml-2">
                      <Text className="text-sm font-bold text-[#172B4D]">
                        {money(guide.pricePerHour)}
                      </Text>
                      <Text className="text-[11px] text-gray-400">per hour</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color="#A0A8B5" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="absolute bottom-0 left-0 right-0 flex-row items-center px-5 pt-3 bg-white border-t border-gray-100"
      >
        <View className="flex-1">
          <Text className="text-xs text-gray-500">{guides.length ? "Guides from" : "Guides"}</Text>
          <Text className="text-lg font-bold text-[#172B4D]">
            {minRate !== null ? `${money(minRate)}/hr` : "Coming soon"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={bookTopGuide}
          disabled={!topGuide}
          activeOpacity={0.85}
          className={`px-7 py-4 rounded-2xl ${topGuide ? "bg-green-500" : "bg-gray-300"}`}
        >
          <Text className="text-[15px] font-semibold text-white">Book a virtual tour</Text>
        </TouchableOpacity>
      </View>

      {toast ? (
        <View
          style={{ bottom: 96 + insets.bottom }}
          className="absolute left-5 right-5"
          pointerEvents="none"
        >
          <View className="flex-row items-center px-4 py-3 rounded-2xl bg-[#172B4D]">
            <Ionicons name="checkmark-circle" size={18} color="#86D36B" />
            <Text className="ml-2 text-sm font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}