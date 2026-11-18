// app/(signup)/Name.jsx
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import SignupLayout, { Field } from "../../components/SignupLayout";

export default function NameScreen() {
  const { email, password } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    router.push({
      pathname: "/Gender",
      params: {
        email,
        password,
        name: name.trim(),
      },
    });
  };

  return (
    <SignupLayout
      step={3}
      title="What's your name?"
      subtitle="Enter your full name as you'd like it to appear."
      onSubmit={handleNext}
    >
      <Field
        label="Full name"
        icon="person-outline"
        placeholder="Enter full name"
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (error) setError("");
        }}
        error={error}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={handleNext}
      />
    </SignupLayout>
  );
}