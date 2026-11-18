import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROLES = [
  {
    key: "tourGuide",
    title: "I'm a Tour Guide",
    subtitle: "Share your local knowledge and connect with visitors.",
    icon: "compass-outline",
    perks: [
      "Host live video tours",
      "Manage your bookings",
      "Build your guide profile",
    ],
  },
  {
    key: "visitor",
    title: "I'm a Visitor",
    subtitle: "Explore destinations with real local guides.",
    icon: "earth-outline",
    perks: [
      "Browse places and guides",
      "Book live virtual tours",
      "Save your favorite places",
    ],
  },
];

const saveRole = async (role) => {
  if (Platform.OS === "web") {
    localStorage.setItem("role", role);
  } else {
    await SecureStore.setItemAsync("role", role);
  }
};

const loadRole = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("role");
  }
  return SecureStore.getItemAsync("role");
};

const RoleCard = ({ role, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={role.title}
    className={`p-5 mb-4 rounded-3xl border-2 ${
      selected ? "bg-[#F7FBF0] border-green-500" : "bg-white border-transparent"
    }`}
  >
    <View className="flex-row items-start justify-between">
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl ${
          selected ? "bg-green-500" : "bg-[#F0F7E8]"
        }`}
      >
        <Ionicons
          name={role.icon}
          size={28}
          color={selected ? "#FFFFFF" : "#578A2B"}
        />
      </View>

      {/* Radio indicator */}
      <View
        className={`h-7 w-7 items-center justify-center rounded-full border-2 ${
          selected
            ? "bg-green-500 border-green-500"
            : "bg-white border-gray-300"
        }`}
      >
        {selected && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
    </View>

    <Text className="mt-4 text-xl font-bold text-[#172B4D]">{role.title}</Text>
    <Text className="mt-1 text-sm leading-5 text-gray-500">
      {role.subtitle}
    </Text>

    <View className="mt-4">
      {role.perks.map((perk) => (
        <View key={perk} className="flex-row items-center mt-2">
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={selected ? "#22A745" : "#A7C98A"}
          />
          <Text className="ml-2 text-sm text-[#24334D]">{perk}</Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);

const OnBoarding = () => {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // If the user comes back to this screen, keep their earlier choice
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await loadRole();
        if (active && stored && ROLES.some((r) => r.key === stored)) {
          setSelected(stored);
        }
      } catch (e) {
        // ignore: user can simply choose again
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSelect = (key) => {
    setSelected(key);
    setError("");
  };

  const handleContinue = async () => {
    if (!selected) {
      setError("Please choose your role to continue.");
      return;
    }
    setSaving(true);
    try {
      await saveRole(selected);
      router.push("../(signup)/Email");
    } catch (e) {
      setError("We couldn't save your choice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const disabled = !selected || saving;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]">
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Brand + heading */}
        <View className="items-center px-6 pt-8">
          <View className="items-center justify-center w-16 h-16 bg-green-500 rounded-3xl">
            <Ionicons name="earth" size={34} color="white" />
          </View>
          <Text className="mt-5 text-3xl font-bold text-[#172B4D]">
            Welcome
          </Text>
          <Text className="mt-2 text-base leading-6 text-center text-gray-500">
            Let's get started. Tell us how you'll use Virtual Tour.
          </Text>
        </View>

        {/* Roles */}
        <View className="px-5 mt-8" accessibilityRole="radiogroup">
          {ROLES.map((role) => (
            <RoleCard
              key={role.key}
              role={role}
              selected={selected === role.key}
              onPress={() => handleSelect(role.key)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pt-2 pb-4">
        {error ? (
          <View className="flex-row items-center px-4 py-3 mb-3 border border-red-100 rounded-2xl bg-red-50">
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text className="flex-1 ml-2 text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={disabled}
          activeOpacity={0.85}
          className={`flex-row items-center justify-center py-4 rounded-2xl ${
            disabled ? "bg-green-200" : "bg-green-500"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-base font-semibold text-white">
                Continue
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-sm text-gray-500">
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("../Login")} hitSlop={8}>
            <Text className="ml-1 text-sm font-semibold text-[#4060B2]">
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnBoarding;
