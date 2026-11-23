import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createReview } from "../../services/apiService";

const PROFILE_FALLBACK = require("../../assets/images/profile.jpg");
const TIP_AMOUNTS = [5, 10, 15, 20];

const StarRow = ({ rating, onSelect }) => (
  <View className="flex-row justify-center mt-6 gap-x-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onSelect(star)} hitSlop={8} activeOpacity={0.7}>
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={40}
          color={star <= rating ? "#FAC22F" : "#9CA3AF"}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ratingLabel = (r) => {
  if (r === 5) return "Wow! A 5 star!";
  if (r === 4) return "Great experience!";
  if (r === 3) return "It was okay.";
  if (r === 2) return "Could be better.";
  if (r === 1) return "Not great.";
  return "Rate your experience";
};

const Index = () => {
  // bookingId and guideName are passed as route params from the call screen
  const { bookingId, guideName, guideImage } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    if (rating === 0) {
      Alert.alert("Rate first", "Please select a star rating before continuing.");
      return;
    }

    setLoading(true);
    try {
      if (bookingId) {
        await createReview({ bookingId, rating, tipAmount: tip, comment: "" });
      }
      router.replace("/(tabs)/Home");
    } catch (err) {
      Alert.alert(
        "Could not submit rating",
        err?.response?.data?.error || err.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1F2327]">
      <View className="flex-1">
        <View className="py-20 mx-6 mt-20 rounded-3xl bg-[#262C36]">
          <Image
            source={guideImage ? { uri: guideImage } : PROFILE_FALLBACK}
            className="self-center w-32 h-32 rounded-full"
          />
          <Text className="self-center mt-3 text-lg font-semibold text-white">
            {guideName ?? "Your Guide"}
          </Text>

          <Text className="self-center mt-10 text-xl font-semibold text-white">
            {ratingLabel(rating)}
          </Text>

          <StarRow rating={rating} onSelect={setRating} />

          <Text className="self-center mt-10 text-base font-semibold text-white">
            Add a tip?
          </Text>

          <View className="flex-row justify-center mt-4 gap-x-3">
            {TIP_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setTip((prev) => (prev === amount ? 0 : amount))}
                activeOpacity={0.7}
                className={`px-4 py-3 rounded-xl ${
                  tip === amount ? "bg-lime-400" : "bg-[#1F2327]"
                }`}
                style={{ elevation: 4, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
              >
                <Text className={`text-base font-bold ${tip === amount ? "text-black" : "text-white"}`}>
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleDone}
            disabled={loading}
            activeOpacity={0.85}
            className={`items-center self-center justify-center py-5 mt-16 mb-4 rounded-lg px-28 ${
              loading ? "bg-lime-200" : "bg-lime-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="font-bold text-black">Done</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Index;
