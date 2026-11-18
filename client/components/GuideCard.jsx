// components/GuideCard.jsx
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { guideImageOf, money } from "../data/mockData";

export default function GuideCard({ guide, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-48 p-2.5 bg-white rounded-2xl"
    >
      <View className="relative">
        <Image className="w-full h-32 rounded-xl" source={guideImageOf(guide)} />
        {guide.isVerified && (
          <View className="absolute flex-row items-center px-2 py-1 rounded-full top-2 left-2 bg-white/90">
            <Ionicons name="checkmark-circle" size={13} color="#477C19" />
            <Text className="ml-1 text-[10px] font-semibold text-[#477C19]">Verified</Text>
          </View>
        )}
      </View>

      <Text className="mt-3 text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
        {guide.name}
      </Text>

      <View className="flex-row items-center mt-1">
        <Ionicons name="location-outline" size={13} color="#6B7280" />
        <Text className="flex-1 ml-1 text-xs text-gray-500" numberOfLines={1}>
          {guide.location}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-2.5">
        <View className="flex-row items-center">
          <Ionicons name="star" size={13} color="#FAC22F" />
          <Text className="ml-1 text-xs text-gray-500">
            {guide.rating} ({guide.totalReviews})
          </Text>
        </View>
        <Text className="text-xs font-bold text-[#172B4D]">{money(guide.pricePerHour)}/hr</Text>
      </View>

      <View className="flex-row flex-wrap mt-2.5">
        {guide.languages.slice(0, 2).map((l) => (
          <View key={l} className="px-2 py-0.5 mb-1 mr-1.5 rounded-full bg-[#F0F7E8]">
            <Text className="text-[10px] font-medium text-[#477C19]">{l}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}