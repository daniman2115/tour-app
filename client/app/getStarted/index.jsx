import { router } from "expo-router";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";

import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getStartedData } from "../../components/GetStarted";
import { useAppInit } from "../../contexts/AppInitContext";

const getStartedImage = require("../../assets/images/getstarted.png");

const Index = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { setValues } = useAppInit();
  const insets = useSafeAreaInsets();

  const handleSkip = async () => {
    if (isLoading) return;

    if (step < getStartedData.length) {
      setStep((previousStep) => previousStep + 1);
      return;
    }

    try {
      setIsLoading(true);


      // Save completion status
      if (Platform.OS === "web") {
        localStorage.setItem("getStartedCompleted", "true");
      } else {
        await SecureStore.setItemAsync("getStartedCompleted", "true");
      }

      // Update the context immediately
      setValues((previous) => ({
        ...previous,
        getStartedCompleted: true,
      }));

      router.replace("/(tabs)/Home");
    } catch (error) {
      console.error("Failed to save Get Started status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#F7F9FC]">
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      <Image
        className="absolute w-full h-full"
        resizeMode="cover"
        source={getStartedImage}
      />

      {/* Text, progress and button stacked at the bottom */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        className="absolute bottom-0 left-0 right-0 px-6"
      >
        <Text className="text-[28px] font-bold leading-9 text-center text-white">
          {getStartedData[step - 1]?.title}
        </Text>

        <Text className="mt-3 text-base leading-6 text-center text-slate-300">
          {getStartedData[step - 1]?.content}
        </Text>

        <View className="flex-row mt-8">
          {getStartedData.map((item, index) => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${index === 0 ? "" : "ml-2"} ${
                step >= index + 1 ? "bg-white" : "bg-[#a3a2a2]"
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.85}
          className="items-center justify-center py-4 mt-6 bg-green-500 rounded-2xl"
        >
          <Text className="text-base font-semibold text-white">
            {step < getStartedData.length ? "Skip" : "Get Started"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Index;
