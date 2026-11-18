// app/setNewPassword.jsx
// Uses Field from components/SignupLayout.jsx (same file the other auth screens use).
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
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
import { resetPassword } from "../../stores/authSlice";

const strengthOf = (pw) => {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return score; // 0-4
};

const STRENGTH = [
  { label: "Too short", color: "bg-gray-200", text: "text-gray-400" },
  { label: "Weak", color: "bg-red-400", text: "text-red-500" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-600" },
  { label: "Good", color: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", color: "bg-green-500", text: "text-green-600" },
];

/**
 * Replace with your real call, e.g.
 *   await dispatch(resetPassword({ email, code, password })).unwrap();
 * The server should check the code, then save the new (hashed) password.
 */


const Index = () => {
  // Passed along from the previous reset screens
  const { email, code } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef(null);
  const dispatch = useDispatch();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/Login");
  };

  const handleUpdate = async () => {
    if (loading) return;

    const next = {};
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirm !== password) next.confirm = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await dispatch(resetPassword({ email, code, password })).unwrap();
      router.push("../resetSuccess");
    } catch (err) {
      setErrors({ form: "We couldn't update your password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthOf(password);
  const s = STRENGTH[password.length === 0 ? 0 : strength];

  const eye = (visible, toggle) => (
    <TouchableOpacity onPress={toggle} hitSlop={10} accessibilityLabel="Show or hide password">
      <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

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
              <Ionicons name="key-outline" size={26} color="#477C19" />
            </View>
            <Text className="mt-5 text-[28px] font-bold leading-9 text-[#172B4D]">
              Set a new password
            </Text>
            <Text className="mt-2 text-base leading-6 text-gray-500">
              Create a new password. Make sure it's different from your previous ones for security.
            </Text>
          </View>

          {/* Form card */}
          <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">
            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your new password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errors.password || errors.form) {
                  setErrors((e) => ({ ...e, password: undefined, form: undefined }));
                }
              }}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              blurOnSubmit={false}
              right={eye(showPassword, () => setShowPassword((v) => !v))}
            />

            {/* Strength meter */}
            <View className="mt-3">
              <View className="flex-row">
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className={`flex-1 h-1.5 rounded-full ${i === 1 ? "" : "ml-1.5"} ${
                      password.length > 0 && i <= strength ? s.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </View>
              <Text className={`mt-1.5 text-xs font-medium ${s.text}`}>{s.label}</Text>
            </View>

            <View className="mt-4">
              <Field
                ref={confirmRef}
                label="Confirm password"
                icon="shield-checkmark-outline"
                placeholder="Re-enter password"
                value={confirm}
                onChangeText={(t) => {
                  setConfirm(t);
                  if (errors.confirm || errors.form) {
                    setErrors((e) => ({ ...e, confirm: undefined, form: undefined }));
                  }
                }}
                error={errors.confirm || errors.form}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleUpdate}
                right={eye(showConfirm, () => setShowConfirm((v) => !v))}
              />
            </View>
          </View>

          <View className="flex-1 min-h-[24px]" />

          {/* Action */}
          <View className="px-5 mt-4">
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center py-4 rounded-2xl ${
                loading ? "bg-green-300" : "bg-green-500"
              }`}
            >
              {loading ? <ActivityIndicator color="white" style={{ marginRight: 8 }} /> : null}
              <Text className="text-base font-semibold text-white">Update Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;