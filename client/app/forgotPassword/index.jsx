// app/forgotPassword.jsx
// Uses Field from components/SignupLayout.jsx (same file the signup and login screens use).
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Field } from "../../components/SignupLayout";
import { useDispatch } from "react-redux";
import { sendVerificationCode } from "../../stores/authSlice";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Replace with your real call, e.g.
 *   await dispatch(requestPasswordReset({ email })).unwrap();
 * It should email the user a reset code (your User model already has
 * passwordResetToken / passwordResetExpires for this).
 */
const requestPasswordReset = async (email) => {
  return email;
};

const Index = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/Login");
  };

  const handleReset = async () => {
    if (loading) return;

    const clean = email.trim();
    if (!clean) {
      setError("Please enter your email");
      return;
    }
    if (!EMAIL_REGEX.test(clean)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await dispatch(sendVerificationCode(clean)).unwrap();
      router.push({ pathname: "/enterCode", params: { email: clean } });
    } catch (err) {
      setError("We couldn't send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <View className="px-5 pt-4">
            <TouchableOpacity
              onPress={goBack}
              activeOpacity={0.7}
              className="items-center justify-center w-10 h-10 bg-white rounded-full"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View className="px-6 mt-8">
            <View className="items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF8D9]">
              <Ionicons name="lock-closed-outline" size={26} color="#477C19" />
            </View>
            <Text className="mt-5 text-[28px] font-bold leading-9 text-[#172B4D]">
              Forgot password?
            </Text>
            <Text className="mt-2 text-base leading-6 text-gray-500">
              Enter your email and we'll send you a code to reset your password.
            </Text>
          </View>

          {/* Form card */}
          <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">
            <Field
              label="Your email"
              icon="mail-outline"
              placeholder="Enter your email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError("");
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={handleReset}
            />
          </View>

          <View className="flex-1 min-h-[24px]" />

          {/* Actions */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center py-4 rounded-2xl ${
                loading ? "bg-green-300" : "bg-green-500"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-base font-semibold text-white">
                Reset Password
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
              <Text className="text-sm text-gray-500">Remembered it? </Text>
              <TouchableOpacity onPress={goBack} hitSlop={8}>
                <Text className="text-sm font-semibold text-[#477C19]">
                  Back to log in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;
