// app/(signup)/Location.jsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SignupLayout, { Field } from "../../components/SignupLayout";
import { registerUser } from "../../stores/authSlice";

export default function LocationScreen() {
  const { email, password, name, gender } = useLocalSearchParams();
  const dispatch = useDispatch();
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const { isError, message, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      alert(message);
    }
  }, [isError, message]);

  const handleNext = async () => {
    if (!location.trim()) {
      setError("Please enter your location");
      return;
    }

    const payload = {
      email,
      name,
      location: location.trim(),
      gender,
      password,
    };

    try {
      await dispatch(registerUser(payload)).unwrap();
      // The useEffect above handles the redirect based on isVerified
    } catch (err) {
      alert(`Registration failed: ${err}`);
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-[#F7F9FC]">
        <View className="items-center justify-center w-20 h-20 rounded-full bg-[#EAF8D9]">
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
        <Text className="mt-5 text-lg font-bold text-[#172B4D]">Creating your account...</Text>
        <Text className="mt-1 text-sm text-gray-500">This only takes a moment.</Text>
      </View>
    );
  }

  return (
    <SignupLayout
      step={5}
      title="Where are you based?"
      subtitle="Tell us your city or country."
      buttonLabel="Create account"
      onSubmit={handleNext}
    >
      <Field
        label="Location"
        icon="location-outline"
        placeholder="Enter your location"
        value={location}
        onChangeText={(t) => {
          setLocation(t);
          if (error) setError("");
        }}
        error={error}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={handleNext}
      />
    </SignupLayout>
  );
}