// app/(signup)/confirmSignUp.jsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SignupLayout, { FieldError } from "../../components/SignupLayout";
import { verifyEmail } from "../../stores/authSlice";

const RESEND_SECONDS = 30;

export default function ConfirmScreen() {
  const dispatch = useDispatch();
  const { email } = useLocalSearchParams();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isError) {
      alert(message);
      // dispatch(reset()); // Reset the state after showing error
    }

    // if (isSuccess && user?.isVerified) {
    //   router.push("/getStarted");
    // }
  }, [isSuccess, isError, message, dispatch, user]);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Create refs for each input
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleDigitChange = (rawText, index) => {
    const text = rawText.replace(/\D/g, "");
    if (text.length > 1) return;
    if (error) setError("");

    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);

    // Move to next input if a digit is entered
    if (text && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }
    // Move to previous input if deleted
    if (!text && index > 0) {
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Backspace on an already-empty box jumps back and clears the previous one
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1].current.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join("");
    if (code.length === 6) {
      const data = {
        code,
        email: email,
      };
      dispatch(verifyEmail(data));
    } else {
      setError("Please enter the complete 6-digit code");
    }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    // TODO: dispatch your "resend verification code" action here.
    // Your backend needs an endpoint that generates a new code and emails it.
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setCooldown(RESEND_SECONDS);
    inputRefs.current[0].current?.focus();
  };

  return (
    <SignupLayout
      step={6}
      title="Check your email"
      subtitle={`Enter the 6-digit code we sent to ${email}`}
      buttonLabel="Confirm"
      onSubmit={handleSubmit}
      loading={isLoading}
      showBack={false}
      loginHref="../Login"
    >
      <Text className="mb-3 text-sm font-semibold text-[#24334D]">Verification code</Text>

      <View className="flex-row justify-between">
        {digits.map((digit, index) => {
          const filled = digit !== "";
          const focused = focusedIndex === index;
          return (
            <TextInput
              key={index}
              ref={inputRefs.current[index]}
              className={`w-12 h-14 text-xl font-bold text-center text-[#172B4D] border-2 rounded-xl ${
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
              editable={!isLoading}
              selectTextOnFocus
              returnKeyType={index === 5 ? "done" : "next"}
              blurOnSubmit={false}
            />
          );
        })}
      </View>

      <FieldError message={error} />

      <View className="flex-row items-center justify-center mt-6">
        <Text className="text-sm text-gray-500">Didn't get the code? </Text>
        <TouchableOpacity onPress={handleResend} disabled={cooldown > 0} hitSlop={8}>
          <Text
            className={`text-sm font-semibold ${
              cooldown > 0 ? "text-gray-400" : "text-[#477C19]"
            }`}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </Text>
        </TouchableOpacity>
      </View>
    </SignupLayout>
  );
}