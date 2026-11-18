// app/enterCode.jsx
// Uses FieldError from components/SignupLayout.jsx (same file the other auth screens use).
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
import { FieldError } from "../../components/SignupLayout";
import { useDispatch } from "react-redux";
import { sendVerificationCode, verifyResetCode } from "../../stores/authSlice";

const CODE_LENGTH = 6; // change to 6 if your backend sends 6-digit codes
const RESEND_SECONDS = 30;

// "alphabet@gmail.com" -> "al*****@gmail.com"
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your email";
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
};

const Index = () => {
  const { email } = useLocalSearchParams();

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const dispatch = useDispatch();

  const inputRefs = useRef(
    Array.from({ length: CODE_LENGTH }, () => React.createRef()),
  );

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/Login");
  };

  const handleDigitChange = (rawText, index) => {
    const text = rawText.replace(/\D/g, "");
    if (text.length > 1) return;
    if (error) setError("");

    const next = [...digits];
    next[index] = text;
    setDigits(next);

    // Move forward when a digit is typed, back when one is deleted
    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1].current?.focus();
    }
    if (!text && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Backspace on an already-empty box jumps back and clears the previous one
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputRefs.current[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError(`Please enter the complete ${CODE_LENGTH}-digit code`);
      return;
    }

    const data = {
      email,
      code: digits.join(""),
    };
    await dispatch(verifyResetCode(data)).unwrap();
    router.push({ pathname: "../confirmReset", params: { email, code } });
  };

  const handleResend = async () => {
    // if (cooldown > 0) return;
    await dispatch(sendVerificationCode(email)).unwrap();

    setDigits(Array(CODE_LENGTH).fill(""));
    setError("");
    setCooldown(RESEND_SECONDS);
    inputRefs.current[0].current?.focus();
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
              <Ionicons name="mail-open-outline" size={26} color="#477C19" />
            </View>
            <Text className="mt-5 text-[28px] font-bold leading-9 text-[#172B4D]">
              Check your email
            </Text>
            <Text className="mt-2 text-base leading-6 text-gray-500">
              We sent a {CODE_LENGTH}-digit code to{" "}
              <Text className="font-semibold text-[#24334D]">
                {maskEmail(email)}
              </Text>
              . Enter it below to reset your password.
            </Text>
          </View>

          {/* Code card */}
          <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">
            <Text className="mb-3 text-sm font-semibold text-[#24334D]">
              Verification code
            </Text>

            <View className="flex-row justify-between">
              {digits.map((digit, index) => {
                const filled = digit !== "";
                const focused = focusedIndex === index;
                return (
                  <TextInput
                    key={index}
                    ref={inputRefs.current[index]}
                    className={`w-14 h-14 text-xl font-bold text-center text-[#172B4D] border-2 rounded-xl ${
                      error
                        ? "border-red-300 bg-red-50"
                        : focused
                          ? "border-green-400 bg-white"
                          : filled
                            ? "border-green-300 bg-[#F0F7E8]"
                            : "border-gray-200 bg-[#F7F9FC]"
                    }`}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleDigitChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    autoFocus={index === 0}
                    selectTextOnFocus
                    returnKeyType={index === CODE_LENGTH - 1 ? "done" : "next"}
                    blurOnSubmit={false}
                    onSubmitEditing={
                      index === CODE_LENGTH - 1 ? handleSubmit : undefined
                    }
                  />
                );
              })}
            </View>

            <FieldError message={error} />

            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-sm text-gray-500">
                Haven't got the email yet?{" "}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={cooldown > 0}
                hitSlop={8}
              >
                <Text
                  className={`text-sm font-semibold ${
                    cooldown > 0 ? "text-gray-400" : "text-[#477C19]"
                  }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 min-h-[24px]" />

          {/* Action */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              className="items-center py-4 bg-green-500 rounded-2xl"
            >
              <Text className="text-base font-semibold text-white">
                Reset Password
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;
