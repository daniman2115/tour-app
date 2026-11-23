import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createGuideProfile } from "../../services/apiService";

const LANGUAGES = ["Amharic", "English", "French", "Oromo", "Tigrinya", "Arabic", "Swahili", "Italian", "Japanese"];
const EXPERTISE = ["Cultural Tours", "Historical Landmarks", "Nature Walks", "Food & Coffee", "Markets", "Museums", "Beaches", "Adventure"];
const GENDERS = ["male", "female"];

const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`px-3 py-1.5 mb-2 mr-2 rounded-full border ${
      selected ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
    }`}
  >
    <Text className={`text-sm font-medium ${selected ? "text-[#477C19]" : "text-gray-600"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const Field = ({ label, children }) => (
  <View className="mb-4">
    <Text className="mb-1.5 text-sm font-semibold text-[#24334D]">{label}</Text>
    {children}
  </View>
);

const inputClass = "rounded-xl border border-gray-200 bg-[#F7F9FC] px-4 py-3 text-[15px] text-[#172B4D]";

const Index = () => {
  const [form, setForm] = useState({
    bio: "",
    title: "",
    location: "",
    pricePerHour: "",
    experience: "",
  });
  const [languages, setLanguages] = useState([]);
  const [expertise, setExpertise] = useState([]);
  const [loading, setLoading] = useState(false);

  const patch = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleItem = (list, setList, item) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    if (!form.location.trim()) {
      Alert.alert("Required", "Please enter your location.");
      return;
    }
    if (!form.pricePerHour || isNaN(Number(form.pricePerHour))) {
      Alert.alert("Required", "Please enter a valid price per hour.");
      return;
    }
    if (languages.length === 0) {
      Alert.alert("Required", "Please select at least one language.");
      return;
    }

    setLoading(true);
    try {
      await createGuideProfile({
        bio: form.bio.trim(),
        title: form.title.trim() || "Local Guide",
        location: form.location.trim(),
        pricePerHour: Number(form.pricePerHour),
        experience: Number(form.experience) || 0,
        languages,
        areasOfExpertise: expertise,
      });

      Alert.alert(
        "Profile created!",
        "Your tour guide profile is live. Travelers can now find and book you.",
        [{ text: "Go to Home", onPress: () => router.replace("/(tabs)/Home") }]
      );
    } catch (err) {
      Alert.alert(
        "Failed to create profile",
        err?.response?.data?.error || err.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="items-center justify-center w-10 h-10 bg-white rounded-full"
        >
          <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-2xl font-bold text-[#172B4D]">Become a Guide</Text>
          <Text className="mt-0.5 text-sm text-gray-500">Create your tour guide profile</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Title (e.g. Historical Sites Specialist)">
          <TextInput
            value={form.title}
            onChangeText={(t) => patch("title", t)}
            placeholder="Local Guide"
            placeholderTextColor="#9CA3AF"
            className={inputClass}
          />
        </Field>

        <Field label="Location *">
          <TextInput
            value={form.location}
            onChangeText={(t) => patch("location", t)}
            placeholder="City, Country"
            placeholderTextColor="#9CA3AF"
            className={inputClass}
          />
        </Field>

        <Field label="About yourself">
          <TextInput
            value={form.bio}
            onChangeText={(t) => patch("bio", t)}
            placeholder="Tell travelers who you are and what you love to show them."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
            className={`${inputClass} min-h-[100px]`}
          />
        </Field>

        <Field label="Price per hour (USD) *">
          <TextInput
            value={form.pricePerHour}
            onChangeText={(t) => patch("pricePerHour", t)}
            placeholder="e.g. 25"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className={inputClass}
          />
        </Field>

        <Field label="Years of experience">
          <TextInput
            value={form.experience}
            onChangeText={(t) => patch("experience", t)}
            placeholder="e.g. 3"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            className={inputClass}
          />
        </Field>

        <Field label="Languages spoken *">
          <View className="flex-row flex-wrap mt-1">
            {LANGUAGES.map((l) => (
              <Chip
                key={l}
                label={l}
                selected={languages.includes(l)}
                onPress={() => toggleItem(languages, setLanguages, l)}
              />
            ))}
          </View>
        </Field>

        <Field label="Areas of expertise">
          <View className="flex-row flex-wrap mt-1">
            {EXPERTISE.map((e) => (
              <Chip
                key={e}
                label={e}
                selected={expertise.includes(e)}
                onPress={() => toggleItem(expertise, setExpertise, e)}
              />
            ))}
          </View>
        </Field>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
          className={`items-center justify-center py-4 rounded-2xl mt-4 ${
            loading ? "bg-green-300" : "bg-green-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">Create Guide Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
