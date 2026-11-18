// Put this file at: components/SignupLayout.jsx  (project root, NOT inside /app,
// otherwise Expo Router will treat it as a screen).
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { forwardRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TOTAL_STEPS = 6; // Email, Password, Name, Gender, Location, Verify

/* Inline error message */
export const FieldError = ({ message }) =>
  message ? (
    <View className="flex-row items-center mt-2">
      <Ionicons name="alert-circle" size={15} color="#DC2626" />
      <Text className="flex-1 ml-1.5 text-xs text-red-600">{message}</Text>
    </View>
  ) : null;

/* Labeled text input with icon, focus ring and error state */
export const Field = forwardRef(function Field(
  { label, icon, error, hint, right, onFocus, onBlur, ...inputProps },
  ref
) {
  const [focused, setFocused] = useState(false);
  const border = error
    ? "border-red-300"
    : focused
      ? "border-green-400"
      : "border-gray-200";

  return (
    <View>
      {label ? (
        <Text className="mb-2 text-sm font-semibold text-[#24334D]">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-center px-4 bg-[#F7F9FC] border rounded-2xl h-14 ${border}`}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color={focused ? "#578A2B" : "#9CA3AF"} />
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#9CA3AF"
          className={`flex-1 text-[15px] text-[#172B4D] ${icon ? "ml-3" : ""}`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {right}
      </View>
      <FieldError message={error} />
      {hint && !error ? (
        <Text className="mt-2 text-xs text-gray-400">{hint}</Text>
      ) : null}
    </View>
  );
});

/* Shared screen scaffold for every signup step */
export default function SignupLayout({
  step,
  title,
  subtitle,
  children,
  buttonLabel = "Next",
  onSubmit,
  loading = false,
  showBack = true,
  loginHref = "/Login",
}) {
  const canGoBack = showBack && router.canGoBack();

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
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4">
            {canGoBack ? (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
                className="items-center justify-center w-10 h-10 bg-white rounded-full"
                accessibilityLabel="Go back"
              >
                <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
              </TouchableOpacity>
            ) : (
              <View className="w-10 h-10" />
            )}
            <Text className="flex-1 ml-4 text-lg font-bold text-[#172B4D]">
              Create account
            </Text>
            <View className="px-3 py-1 rounded-full bg-[#EAF8D9]">
              <Text className="text-xs font-semibold text-[#477C19]">
                Step {step} of {TOTAL_STEPS}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View className="flex-row px-5 mt-5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                className={`flex-1 h-1.5 rounded-full ${i === 0 ? "" : "ml-1.5"} ${
                  i < step ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </View>

          {/* Title */}
          <View className="px-6 mt-8">
            <Text className="text-[28px] font-bold leading-9 text-[#172B4D]">{title}</Text>
            {subtitle ? (
              <Text className="mt-2 text-base leading-6 text-gray-500">{subtitle}</Text>
            ) : null}
          </View>

          {/* Form card */}
          <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">{children}</View>

          <View className="flex-1 min-h-[24px]" />

          {/* Action */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={onSubmit}
              disabled={loading}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center py-4 rounded-2xl ${
                loading ? "bg-green-300" : "bg-green-500"
              }`}
            >
              {loading ? <ActivityIndicator color="white" style={{ marginRight: 8 }} /> : null}
              <Text className="text-base font-semibold text-white">{buttonLabel}</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
              <Text className="text-sm text-gray-500">Have an account? </Text>
              <TouchableOpacity onPress={() => router.replace(loginHref)} hitSlop={8}>
                <Text className="text-sm font-semibold text-[#477C19]">Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}