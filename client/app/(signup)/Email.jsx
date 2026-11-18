// app/(signup)/Email.jsx
import { useState } from "react";
import { router } from "expo-router";
import SignupLayout, { Field } from "../../components/SignupLayout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean)) {
      setError("Please enter a valid email address");
      return;
    }
    router.push({ pathname: "/Password", params: { email: clean } });
  };

  return (
    <SignupLayout
      step={1}
      title="What's your email?"
      subtitle="We'll send a verification code to this address."
      onSubmit={handleNext}
    >
      <Field
        label="Email"
        icon="mail-outline"
        placeholder="name@example.com"
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
        returnKeyType="next"
        onSubmitEditing={handleNext}
      />
    </SignupLayout>
  );
}