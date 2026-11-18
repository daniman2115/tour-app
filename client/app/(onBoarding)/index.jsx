import Ionicons from "@react-native-vector-icons/ionicons";
import Feather from "@react-native-vector-icons/feather";
import AntDesign from "@react-native-vector-icons/ant-design";
import { Redirect, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppInit } from "../../contexts/AppInitContext";

/* ------------------------------------------------------------------ */
/* Slides: edit the copy and icons here                                */
/* ------------------------------------------------------------------ */
const SLIDES = [
  {
    key: "world",
    icon: "earth",
    chips: [
      { icon: "videocam", style: "top-6 right-2" },
      { icon: "location", style: "bottom-10 left-0" },
    ],
    title: "See the world through a local's eyes",
    text: "Connect with local experts through live video calls and explore your destination before you even arrive.",
  },
  {
    key: "experts",
    icon: "videocam",
    chips: [
      { icon: "chatbubble-ellipses", style: "top-8 left-0" },
      { icon: "star", style: "bottom-8 right-2" },
    ],
    title: "Talk to real locals, live",
    text: "Book a video tour with a guide who actually lives there, and ask them anything along the way.",
  },
  {
    key: "plan",
    icon: "compass",
    chips: [
      { icon: "map", style: "top-6 right-0" },
      { icon: "heart", style: "bottom-10 left-2" },
    ],
    title: "Plan your trip with confidence",
    text: "Discover hidden gems, get a feel for the place, and decide where to go before you pack a bag.",
  },
];

/* Illustration built from shapes and icons, no image needed */
const Illustration = ({ slide }) => (
  <View className="items-center justify-center w-[300px] h-[300px]">
    <View className="absolute w-[290px] h-[290px] rounded-full bg-[#EAF8D9]" />
    <View className="absolute w-[210px] h-[210px] rounded-full bg-[#D3EEB0]" />

    <View className="items-center justify-center w-32 h-32 bg-green-500 shadow-lg rounded-[36px]">
      <Ionicons name={slide.icon} size={62} color="white" />
    </View>

    {slide.chips.map((chip) => (
      <View
        key={chip.icon}
        className={`absolute items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-md ${chip.style}`}
      >
        <Ionicons name={chip.icon} size={26} color="#578A2B" />
      </View>
    ))}

    <View className="absolute w-3 h-3 bg-green-400 rounded-full top-2 left-16" />
    <View className="absolute w-2 h-2 bg-green-300 rounded-full bottom-4 right-14" />
  </View>
);

export default function Index() {
  const { ready, onboardingCompleted, role, getStartedCompleted } = useAppInit();
  const { width } = useWindowDimensions();

  // Hooks must stay above the early returns below
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!ready) return <View className="flex-1 bg-[#F7F9FC]" >      
  <ActivityIndicator size="large" color="#10b981" />
  </View>
  ;

  if (onboardingCompleted && role) {
    return <Redirect href="../(signup)/Email" />;
  }

  if (onboardingCompleted && !role) {
    return <Redirect href="/onBoardingSecond" />;
  }

   if (onboardingCompleted && role && !getStartedCompleted) {
    return <Redirect href="/getStarted" />;
  }

  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (Platform.OS === "web") {
        localStorage.setItem("onboardingCompleted", "true");
      } else {
        await SecureStore.setItemAsync("onboardingCompleted", "true");
      }
    } catch (error) {
      // Don't block the user if saving fails; they'll just see this again next launch.
      console.error("Error saving onboarding status:", error);
    }
    router.push("/onBoardingSecond");
    setSaving(false);
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const onScrollEnd = (e) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* Top bar */}
      <View className="flex-row items-center justify-between px-6 pt-3">
        <View className="px-3 py-1.5 rounded-full bg-[#EAF8D9]">
          <Text className="text-xs font-semibold text-[#477C19]">Virtual Tour</Text>
        </View>

        <TouchableOpacity
          onPress={finish}
          disabled={isLast || saving}
          activeOpacity={0.7}
          hitSlop={10}
          style={{ opacity: isLast ? 0 : 1 }}
          accessibilityLabel="Skip introduction"
        >
          <Text className="text-sm font-semibold text-gray-500">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.key}
            style={{ width }}
            className="items-center justify-center px-8"
          >
            <Illustration slide={slide} />
            <Text className="mt-8 text-[28px] font-bold leading-9 text-center text-[#172B4D]">
              {slide.title}
            </Text>
            <Text className="mt-3 text-base leading-6 text-center text-gray-500">
              {slide.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots + button */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-center mb-5">
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              className={`h-2 mx-1 rounded-full ${
                i === index ? "w-7 bg-green-500" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={goNext}
          disabled={saving}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center py-4 rounded-2xl ${
            saving ? "bg-green-300" : "bg-green-500"
          }`}
          accessibilityLabel={isLast ? "Get started" : "Next"}
        >
          <Text className="text-base font-semibold text-white">
            {isLast ? "Get Started" : "Next"}
          </Text>
          <Feather name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
        {/* <TouchableOpacity onPress={() => router.push("./Home")}>
          <Text className="self-center text-white mt-9">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./locationSearch")}>
          <Text className="self-center mt-2 text-white">search location</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./tourGuideList")}>
          <Text className="self-center mt-2 text-white">tour guide list</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./Profile")}>
          <Text className="self-center mt-2 text-white">profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./scheduleCall")}>
          <Text className="self-center mt-2 text-white">schedule call</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./myBookings")}>
          <Text className="self-center mt-2 text-white">my bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./callLogs")}>
          <Text className="self-center mt-2 text-white">call logs</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./Notification")}>
          <Text className="self-center mt-2 text-white">notification</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./accountCreation")}>
          <Text className="self-center mt-2 text-white">account creation</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./selectPayment")}>
          <Text className="self-center mt-2 text-white">select payment</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./Settings")}>
          <Text className="self-center mt-2 text-white">settings</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./Rating")}>
          <Text className="self-center mt-2 text-white">rating</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./Video")}>
          <Text className="self-center mt-2 text-white">Video</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("./videoAccept")}>
          <Text className="self-center mt-2 text-white">video accept</Text>
        </TouchableOpacity> */}