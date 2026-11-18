// app/Login.jsx  (keep it wherever your current Login screen lives;
// the relative imports below assume the same depth as before)
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, reset } from "@/stores/authSlice";
import { Field } from "../../components/SignupLayout";

WebBrowser.maybeCompleteAuthSession();

const Index = () => {
  const { user, isError, isSuccess, message, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setISubmitting] = useState(false);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const passwordRef = useRef(null);

  const handleGoogleLogin = async () => {
    try {
      setISubmitting(true);
      setIsGoogleLogin(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { user } = response.data;

        // Prepare data for your backend
        const googleUser = {
          isGoogleLogin: true,
          email: user?.email,
          name: user?.givenName + (user.familyName ? ` ${user.familyName}` : ""),
          id: user?.id,
        };

        dispatch(loginUser(googleUser));
      } else {
        alert("Google Signin was cancelled");
      }

      setISubmitting(false);
      setIsGoogleLogin(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            alert("Google Signin is in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            alert("play services is not available");
            break;

          default:
            alert(error.message);
        }
      } else {
        alert("An error occured");
      }
      setISubmitting(false);
      setIsGoogleLogin(false);
    }
  };

  useEffect(() => {
    if (isError) {
      alert(message);
      dispatch(reset());
    }
    // sendVerificationCode also sets isSuccess, and Login stays mounted
    // under forgot-password. Only leave Login after an actual session exists.
    if (isSuccess && user) {
      router.replace("/getStarted");
    }
  }, [isError, isSuccess, user, dispatch, message]);

  const handleLogIn = () => {
    const next = {};
    if (!email.trim()) next.email = "Please enter your email";
    if (!password) next.password = "Please enter your password";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const data = {
      email: email.trim(),
      password,
    };
    dispatch(loginUser(data));
  };

  const busy = isLoading || isSubmitting;

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
          {/* Title */}
          <View className="px-6 mt-10">
            <View className="self-start px-3 py-1 mb-3 rounded-full bg-[#EAF8D9]">
              <Text className="text-xs font-semibold text-[#477C19]">Virtual Tour</Text>
            </View>
            <Text className="text-[28px] font-bold leading-9 text-[#172B4D]">Welcome back</Text>
            <Text className="mt-2 text-base leading-6 text-gray-500">
              Log in to your Virtual Tour account.
            </Text>
          </View>

          {/* Form card */}
          <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={busy}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center h-14 bg-white border border-gray-200 rounded-2xl ${
                busy && !isGoogleLogin ? "opacity-50" : ""
              }`}
              accessibilityLabel="Continue with Google"
            >
              {isGoogleLogin ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <Image
                  className="w-6 h-6"
                  source={require("../../assets/images/google.png")}
                />
              )}
              <Text className="ml-3 text-[15px] font-semibold text-[#24334D]">
                {isGoogleLogin ? "Signing in..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-xs text-gray-400">or sign in with email</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <Field
              label="Email"
              icon="mail-outline"
              placeholder="name@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <View className="mt-4">
              <Field
                ref={passwordRef}
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                error={errors.password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogIn}
                right={
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={10}
                    accessibilityLabel="Show or hide password"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("../forgotPassword")}
              activeOpacity={0.7}
              hitSlop={8}
              className="self-end mt-3"
            >
              <Text className="text-sm font-semibold text-[#477C19]">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 min-h-[24px]" />

          {/* Actions */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={handleLogIn}
              disabled={busy}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center py-4 rounded-2xl ${
                busy ? "bg-green-300" : "bg-green-500"
              }`}
            >
              {isLoading && !isGoogleLogin ? (
                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-base font-semibold text-white">Log In</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
              <Text className="text-sm text-gray-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(signup)/Email")} hitSlop={8}>
                <Text className="text-sm font-semibold text-[#477C19]">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;