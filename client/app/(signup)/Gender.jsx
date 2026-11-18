// app/(signup)/Gender.jsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SignupLayout, { FieldError } from "../../components/SignupLayout";

const OPTIONS = [
  { value: "male", label: "Male", icon: "male" },
  { value: "female", label: "Female", icon: "female" },
];

export default function GenderScreen() {
  const { email, password, name } = useLocalSearchParams();
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!gender) {
      setError("Please select your gender");
      return;
    }

    router.push({
      pathname: "/Location",
      params: {
        email,
        password,
        name,
        gender,
      },
    });
  };

  const choose = (value) => {
    setGender(value);
    if (error) setError("");
  };

  return (
    <SignupLayout
      step={4}
      title="Select your gender"
      subtitle="This helps us personalize your experience."
      onSubmit={handleNext}
    >
      {OPTIONS.map((option, index) => {
        const selected = gender === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => choose(option.value)}
            activeOpacity={0.8}
            className={`flex-row items-center p-4 border-2 rounded-2xl ${
              index === 0 ? "" : "mt-3"
            } ${selected ? "border-green-500 bg-[#F0F7E8]" : "border-gray-200 bg-white"}`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View
              className={`h-11 w-11 items-center justify-center rounded-xl ${
                selected ? "bg-green-500" : "bg-[#F0F7E8]"
              }`}
            >
              <Ionicons name={option.icon} size={22} color={selected ? "#FFFFFF" : "#578A2B"} />
            </View>
            <Text className="flex-1 ml-3 text-base font-semibold text-[#24334D]">
              {option.label}
            </Text>
            <View
              className={`items-center justify-center w-6 h-6 rounded-full border-2 ${
                selected ? "border-green-500 bg-green-500" : "border-gray-300"
              }`}
            >
              {selected && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
          </TouchableOpacity>
        );
      })}
      <FieldError message={error} />
    </SignupLayout>
  );
}