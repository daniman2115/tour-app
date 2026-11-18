// app/(signup)/Password.jsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SignupLayout, { Field } from "../../components/SignupLayout";

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

export default function PasswordScreen() {
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const confirmRef = useRef(null);

  const handleNext = () => {
    const next = {};
    if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    if (confirm !== password) {
      next.confirm = "Passwords don't match";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    router.push({
      pathname: "/Name",
      params: { email, password },
    });
  };

  const strength = strengthOf(password);
  const s = STRENGTH[password.length === 0 ? 0 : strength];

  const eye = (visible, toggle) => (
    <TouchableOpacity onPress={toggle} hitSlop={10} accessibilityLabel="Show or hide password">
      <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SignupLayout
      step={2}
      title="Create a password"
      subtitle="Use at least 6 characters. The longer, the safer."
      onSubmit={handleNext}
    >
      <Field
        label="Password"
        icon="lock-closed-outline"
        placeholder="Enter password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
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
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
          }}
          error={errors.confirm}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleNext}
          right={eye(showConfirm, () => setShowConfirm((v) => !v))}
        />
      </View>
    </SignupLayout>
  );
}