import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { editProfile } from "../../stores/authSlice";
import ImageCropper from "../../components/ImageCropper";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Morning", "Afternoon", "Evening", "Flexible"];
const LANGUAGE_SUGGESTIONS = [
  "Amharic",
  "English",
  "French",
  "Oromo",
  "Tigrinya",
  "Arabic",
];
const EXPERTISE_SUGGESTIONS = [
  "Cultural Tours",
  "Historical Landmarks",
  "Nature Walks",
  "Food & Coffee",
  "Markets",
  "Museums",
];
const DESCRIPTION_MAX = 300;

const buildProfile = (user) => ({
  avatar: user?.avatar || null,
  name: user?.name || "",
  title: user?.title || "Local Guide",
  description:
    user?.description ||
    "Hi! I'm a passionate local from Addis Ababa. I love sharing my culture, traditions, and the hidden gems of my city with visitors from around the world. Let's explore together!",
  languages: user?.languages || ["Amharic", "English", "French"],
  expertise: user?.expertise || [
    "Cultural Tours",
    "Historical Landmarks",
    "Nature Walks",
  ],
  available: user?.available ?? true,
  days: user?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
  timeOfDay: user?.timeOfDay || "Flexible",
  timezone: user?.timezone || "East Africa Time (UTC+3)",
  experienceYears: user?.experienceYears ?? 3,
});

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */
const Chip = ({ label, onRemove }) => (
  <View className="flex-row items-center px-3 py-1.5 mb-2 mr-2 rounded-full bg-[#EAF8D9]">
    <Text className="text-sm font-medium text-[#477C19]">{label}</Text>
    {onRemove && (
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={8}
        className="ml-1.5"
        accessibilityLabel={`Remove ${label}`}
      >
        <Ionicons name="close-circle" size={16} color="#477C19" />
      </TouchableOpacity>
    )}
  </View>
);

const EmptyHint = ({ text }) => (
  <Text className="text-sm text-gray-400">{text}</Text>
);

const SectionCard = ({ title, subtitle, icon, onEdit, children }) => (
  <View className="p-4 mx-5 mt-4 bg-white rounded-2xl">
    <View className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
        <Ionicons name={icon} size={21} color="#578A2B" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold text-[#24334D]">
          {title}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text>
      </View>
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        className="flex-row items-center px-3 py-1.5 rounded-full bg-[#EEF2FB]"
        accessibilityLabel={`Edit ${title}`}
      >
        <Ionicons name="pencil" size={13} color="#4060B2" />
        <Text className="ml-1 text-xs font-semibold text-[#4060B2]">Edit</Text>
      </TouchableOpacity>
    </View>
    <View className="mt-4">{children}</View>
  </View>
);

const Field = ({ label, children, hint }) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm font-semibold text-[#24334D]">{label}</Text>
    {children}
    {hint ? <Text className="mt-1.5 text-xs text-gray-400">{hint}</Text> : null}
  </View>
);

const inputClass =
  "rounded-xl border border-gray-200 bg-[#F7F9FC] px-4 py-3 text-[15px] text-[#172B4D]";

/* Add / remove chips with suggestions */
const ChipEditor = ({ items, onChange, suggestions, placeholder }) => {
  const [text, setText] = useState("");

  const add = (value) => {
    const v = value.trim();
    if (!v) return;
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) {
      setText("");
      return;
    }
    onChange([...items, v]);
    setText("");
  };

  const remaining = suggestions.filter(
    (s) => !items.some((i) => i.toLowerCase() === s.toLowerCase()),
  );

  return (
    <View>
      <View className="flex-row items-center">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="done"
          onSubmitEditing={() => add(text)}
          className={`flex-1 ${inputClass}`}
        />
        <TouchableOpacity
          onPress={() => add(text)}
          activeOpacity={0.8}
          className="items-center justify-center ml-2 h-[48px] w-[48px] rounded-xl bg-green-500"
          accessibilityLabel="Add"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap mt-4">
        {items.length === 0 ? (
          <EmptyHint text="Nothing added yet." />
        ) : (
          items.map((item) => (
            <Chip
              key={item}
              label={item}
              onRemove={() => onChange(items.filter((i) => i !== item))}
            />
          ))
        )}
      </View>

      {remaining.length > 0 && (
        <View className="mt-2">
          <Text className="mb-2 text-xs text-gray-400">Suggestions</Text>
          <View className="flex-row flex-wrap">
            {remaining.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => add(s)}
                activeOpacity={0.7}
                className="flex-row items-center px-3 py-1.5 mb-2 mr-2 border border-gray-200 rounded-full"
              >
                <Ionicons name="add" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-600">{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

/* Bottom sheet used for every edit action */
const Sheet = ({
  visible,
  title,
  error,
  saving,
  onClose,
  onSave,
  children,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="justify-end flex-1 bg-black/40"
    >
      <Pressable className="flex-1" onPress={onClose} />
      <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl max-h-[85%]">
        <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
        <Text className="mb-4 text-lg font-bold text-[#172B4D]">{title}</Text>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {error ? (
          <Text className="mt-2 text-sm text-red-600">{error}</Text>
        ) : null}

        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="items-center justify-center flex-1 py-3.5 mr-2 rounded-xl bg-gray-100"
          >
            <Text className="text-[15px] font-semibold text-gray-600">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.8}
            className={`items-center justify-center flex-1 py-3.5 ml-2 rounded-xl ${
              saving ? "bg-green-300" : "bg-green-500"
            }`}
          >
            <Text className="text-[15px] font-semibold text-white">
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const Index = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [selectedAvatar, setSelectedAvatar] = useState(null);
const [avatarModalVisible, setAvatarModalVisible] = useState(false);
const [uploadingAvatar, setUploadingAvatar] = useState(false);

const [cropSource, setCropSource] = useState(null);
const [cropVisible, setCropVisible] = useState(false);

  const [profile, setProfile] = useState(() => buildProfile(user));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(null); // "basic" | "about" | "languages" | ...
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef(null);

  // Read-only numbers that come from completed calls, not from this form
  const stats = {
    rating: user?.rating ?? 4.4,
    calls: user?.completedCalls ?? 200,
    reviews: user?.reviews ?? 140,
  };

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const openEdit = (key) => {
    setDraft(profile);
    setError("");
    setEditing(key);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const flashSaved = () => {
    setJustSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 2000);
  };

  /**
   * Persist the profile. Replace the body with your real API call / thunk, e.g.
   *   await dispatch(updateProfile(next)).unwrap();
   */
  const persist = async (next) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400)); // <-- your API call here
      setProfile(next);
      flashSaved();
      return true;
    } catch (e) {
      Alert.alert(
        "Couldn't save changes",
        "Check your connection and try again.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validate = (key, d) => {
    switch (key) {
      case "basic":
        if (!d.name.trim()) return "Enter your name.";
        if (!d.title.trim())
          return "Enter your title, for example Local Guide.";
        return "";
      case "about":
        if (d.description.trim().length < 20)
          return "Write at least 20 characters so visitors know who you are.";
        return "";
      case "languages":
        return d.languages.length === 0 ? "Add at least one language." : "";
      case "expertise":
        return d.expertise.length === 0
          ? "Add at least one area of expertise."
          : "";
      case "availability":
        return d.available && d.days.length === 0
          ? "Pick at least one day you're available."
          : "";
      default:
        return "";
    }
  };

  const saveSheet = async () => {
    const message = validate(editing, draft);
    if (message) {
      setError(message);
      return;
    }
    const next = {
      ...draft,
      name: draft.name.trim(),
      title: draft.title.trim(),
      description: draft.description.trim(),
    };
    const ok = await persist(next);
    if (ok) setEditing(null);
  };



const pickAvatar = async () => {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access needed",
        "Allow photo access in your device settings to change your profile picture.",
      );
      return;
    }

   const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],
  allowsEditing: false,
  quality: 1,
});

if (result.canceled || !result.assets?.[0]?.uri) return;

setCropSource(result.assets[0]);
setCropVisible(true);
  } catch (error) {
    Alert.alert(
      "Unable to select photo",
      error?.message || "Please try again.",
    );
  }
};


const handleCropConfirm = (cropped) => {
  setCropVisible(false);
  // Wait for the crop modal to finish closing before opening the next one (iOS)
  setTimeout(
    () => {
      setSelectedAvatar({
        uri: cropped.uri,
        fileName: `profile-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      });
      setAvatarModalVisible(true);
    },
    Platform.OS === "ios" ? 400 : 50,
  );
};

const handleCropCancel = () => {
  setCropVisible(false);
  setCropSource(null);
};

const confirmAvatar = async () => {
  if (!selectedAvatar?.uri || uploadingAvatar) return;

  setUploadingAvatar(true);

  try {
    const formData = new FormData();

    formData.append("profileImage", {
      uri: selectedAvatar.uri,
      name: selectedAvatar.fileName || `profile-${Date.now()}.jpg`,
      type: selectedAvatar.mimeType || "image/jpeg",
    });

    const result = await dispatch(editProfile(formData)).unwrap();

    // Your backend returns { success, message, user }
    const updatedUser = result?.user ?? result;
    const imageUrl = updatedUser?.profileImage;

    if (!imageUrl) {
      throw new Error("The server did not return the profile image URL.");
    }

    setProfile((prev) => ({
      ...prev,
      avatar: imageUrl,
    }));

    setAvatarModalVisible(false);
    setSelectedAvatar(null);
    flashSaved();

    Alert.alert("Success", "Your profile picture has been updated.");
  } catch (error) {
    Alert.alert(
      "Upload failed",
      typeof error === "string"
        ? error
        : error?.message || "Could not upload your profile picture.",
    );
  } finally {
    setUploadingAvatar(false);
  }
};

const cancelAvatar = () => {
  if (uploadingAvatar) return;

  setAvatarModalVisible(false);
  setSelectedAvatar(null);
};



  const toggleDay = (day) =>
    patch({
      days: draft.days.includes(day)
        ? draft.days.filter((d) => d !== day)
        : [...draft.days, day],
    });

  const sheetTitles = {
    basic: "Edit your details",
    about: "Edit description",
    languages: "Languages you speak",
    expertise: "Areas of expertise",
    availability: "Edit availability",
    experience: "Edit experience",
  };

  /* ----------------------------- sheet bodies ----------------------------- */
  const renderSheetBody = () => {
    switch (editing) {
      case "basic":
        return (
          <>
            <Field label="Full name">
              <TextInput
                value={draft.name}
                onChangeText={(t) => patch({ name: t })}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                className={inputClass}
              />
            </Field>
            <Field
              label="Title"
              hint="Shown under your name, e.g. Historical Sites Specialist"
            >
              <TextInput
                value={draft.title}
                onChangeText={(t) => patch({ title: t })}
                placeholder="Local Guide"
                placeholderTextColor="#9CA3AF"
                maxLength={50}
                className={inputClass}
              />
            </Field>
          </>
        );

      case "about":
        return (
          <Field label="About you">
            <TextInput
              value={draft.description}
              onChangeText={(t) => patch({ description: t })}
              placeholder="Tell visitors who you are and what you love to show them."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={DESCRIPTION_MAX}
              textAlignVertical="top"
              className={`${inputClass} min-h-[140px]`}
            />
            <Text className="mt-1.5 text-xs text-right text-gray-400">
              {draft.description.length}/{DESCRIPTION_MAX}
            </Text>
          </Field>
        );

      case "languages":
        return (
          <ChipEditor
            items={draft.languages}
            onChange={(languages) => patch({ languages })}
            suggestions={LANGUAGE_SUGGESTIONS}
            placeholder="Add a language"
          />
        );

      case "expertise":
        return (
          <ChipEditor
            items={draft.expertise}
            onChange={(expertise) => patch({ expertise })}
            suggestions={EXPERTISE_SUGGESTIONS}
            placeholder="Add an area of expertise"
          />
        );

      case "availability":
        return (
          <>
            <View className="flex-row items-center justify-between p-4 mb-5 rounded-2xl bg-[#F5F8F0]">
              <View className="flex-1 pr-3">
                <Text className="text-[15px] font-semibold text-[#24334D]">
                  Available for calls
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  Turn off to stop receiving new booking requests.
                </Text>
              </View>
              <Switch
                value={draft.available}
                onValueChange={(v) => patch({ available: v })}
                trackColor={{ false: "#D1D5DB", true: "#86D36B" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Field label="Days you're available">
              <View className="flex-row flex-wrap">
                {DAYS.map((day) => {
                  const on = draft.days.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(day)}
                      activeOpacity={0.7}
                      className={`items-center justify-center mb-2 mr-2 h-11 w-[52px] rounded-xl border ${
                        on
                          ? "bg-green-500 border-green-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${on ? "text-white" : "text-gray-600"}`}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            <Field label="Preferred time of day">
              <View className="flex-row flex-wrap">
                {TIMES.map((time) => {
                  const on = draft.timeOfDay === time;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => patch({ timeOfDay: time })}
                      activeOpacity={0.7}
                      className={`px-4 py-2.5 mb-2 mr-2 rounded-full border ${
                        on
                          ? "bg-[#EAF8D9] border-green-400"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            <Field label="Time zone">
              <TextInput
                value={draft.timezone}
                onChangeText={(t) => patch({ timezone: t })}
                placeholder="East Africa Time (UTC+3)"
                placeholderTextColor="#9CA3AF"
                className={inputClass}
              />
            </Field>
          </>
        );

      case "experience":
        return (
          <Field label="Years of experience as a guide">
            <View className="flex-row items-center justify-between p-4 rounded-2xl bg-[#F5F8F0]">
              <TouchableOpacity
                onPress={() =>
                  patch({
                    experienceYears: Math.max(0, draft.experienceYears - 1),
                  })
                }
                activeOpacity={0.7}
                className="items-center justify-center bg-white w-11 h-11 rounded-xl"
                accessibilityLabel="Decrease years"
              >
                <Ionicons name="remove" size={22} color="#477C19" />
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-3xl font-bold text-[#172B4D]">
                  {draft.experienceYears}
                </Text>
                <Text className="text-xs text-gray-500">
                  {draft.experienceYears === 1 ? "year" : "years"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  patch({
                    experienceYears: Math.min(60, draft.experienceYears + 1),
                  })
                }
                activeOpacity={0.7}
                className="items-center justify-center bg-white w-11 h-11 rounded-xl"
                accessibilityLabel="Increase years"
              >
                <Ionicons name="add" size={22} color="#477C19" />
              </TouchableOpacity>
            </View>
          </Field>
        );

      default:
        return null;
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="items-center justify-center w-10 h-10 bg-white rounded-full"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
          </TouchableOpacity>

          <View className="flex-1 ml-4">
            <Text className="text-2xl font-bold text-[#172B4D]">
              Edit Profile
            </Text>
            <Text className="mt-0.5 text-sm text-gray-500">
              Update your personal information
            </Text>
          </View>

          {justSaved && (
            <View className="flex-row items-center px-3 py-1 rounded-full bg-[#EAF8D9]">
              <Ionicons name="checkmark-circle" size={14} color="#477C19" />
              <Text className="ml-1 text-xs font-semibold text-[#477C19]">
                Saved
              </Text>
            </View>
          )}
        </View>

        {/* Profile Card */}
        <View className="mx-5 overflow-hidden bg-white rounded-3xl">
          <View className="bg-green-400 h-28">
            <View className="absolute w-40 h-40 rounded-full -right-8 -top-14 bg-white/20" />
            <View className="absolute w-24 h-24 rounded-full -left-8 top-10 bg-white/20" />
          </View>

          <View className="items-center px-5 pb-6">
            <View className="relative -mt-16">
              <Image
                className="border-4 border-white rounded-full h-28 w-28"
                source={
                  user?.profileImage
                    ? { uri: user.profileImage }
                    : require("../../assets/images/profile.jpg")
                }
              />
              <TouchableOpacity
                onPress={pickAvatar}
                activeOpacity={0.8}
                className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4060B2]"
                accessibilityLabel="Change profile photo"
              >
                <Entypo name="camera" size={17} color="white" />
              </TouchableOpacity>
            </View>

            <Text
              className="mt-3 text-xl font-bold text-[#172B4D]"
              numberOfLines={1}
            >
              {profile.name || "Your name"}
            </Text>
            <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
              {profile.title}
            </Text>

            <View className="flex-row items-center mt-2">
              <View className="rounded-full bg-[#EAF8D9] px-3 py-1">
                <Text className="text-xs font-semibold text-[#477C19]">
                  Virtual Tour Member
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openEdit("basic")}
                activeOpacity={0.7}
                className="flex-row items-center px-3 py-1 ml-2 rounded-full bg-[#EEF2FB]"
                accessibilityLabel="Edit name and title"
              >
                <Ionicons name="pencil" size={12} color="#4060B2" />
                <Text className="ml-1 text-xs font-semibold text-[#4060B2]">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View className="mt-5 w-full flex-row items-center rounded-2xl bg-[#F5F8F0] py-4">
              <View className="items-center flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-[#172B4D]">
                    {stats.rating}
                  </Text>
                  <Ionicons
                    name="star"
                    size={16}
                    color="#FAC22F"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text className="mt-1 text-xs text-gray-500">Rating</Text>
              </View>
              <View className="w-px h-9 bg-[#DDE6CF]" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-[#172B4D]">
                  {stats.calls}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  Completed calls
                </Text>
              </View>
              <View className="w-px h-9 bg-[#DDE6CF]" />
              <View className="items-center flex-1">
                <Text className="text-xl font-bold text-[#172B4D]">
                  {stats.reviews}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">Reviews</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About */}
        <SectionCard
          title="Description"
          subtitle="Introduce yourself to visitors"
          icon="document-text-outline"
          onEdit={() => openEdit("about")}
        >
          {profile.description ? (
            <Text className="text-[15px] leading-6 text-[#24334D]">
              {profile.description}
            </Text>
          ) : (
            <EmptyHint text="Add a short introduction so visitors know who they'll meet." />
          )}
        </SectionCard>

        {/* Languages */}
        <SectionCard
          title="Languages Spoken"
          subtitle="Languages you can guide in"
          icon="language-outline"
          onEdit={() => openEdit("languages")}
        >
          <View className="flex-row flex-wrap">
            {profile.languages.length ? (
              profile.languages.map((l) => <Chip key={l} label={l} />)
            ) : (
              <EmptyHint text="Add the languages you speak." />
            )}
          </View>
        </SectionCard>

        {/* Expertise */}
        <SectionCard
          title="Areas of Expertise"
          subtitle="What you love showing people"
          icon="compass-outline"
          onEdit={() => openEdit("expertise")}
        >
          <View className="flex-row flex-wrap">
            {profile.expertise.length ? (
              profile.expertise.map((e) => <Chip key={e} label={e} />)
            ) : (
              <EmptyHint text="Add what you specialise in." />
            )}
          </View>
        </SectionCard>

        {/* Availability */}
        <SectionCard
          title="Availability"
          subtitle="When visitors can book you"
          icon="calendar-outline"
          onEdit={() => openEdit("availability")}
        >
          <View className="flex-row items-center">
            <View
              className={`h-2.5 w-2.5 rounded-full ${
                profile.available ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <Text className="ml-2 text-[15px] font-semibold text-[#24334D]">
              {profile.available
                ? "Available for calls"
                : "Not taking calls right now"}
            </Text>
          </View>

          {profile.available && (
            <>
              <View className="flex-row mt-4">
                {DAYS.map((day) => {
                  const on = profile.days.includes(day);
                  return (
                    <View
                      key={day}
                      className={`items-center justify-center mr-1.5 h-9 flex-1 rounded-lg ${
                        on ? "bg-green-500" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${on ? "text-white" : "text-gray-400"}`}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View className="flex-row items-center mt-4">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-600">
                  {profile.timeOfDay}
                </Text>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color="#6B7280"
                  style={{ marginLeft: 16 }}
                />
                <Text
                  className="flex-1 ml-2 text-sm text-gray-600"
                  numberOfLines={1}
                >
                  {profile.timezone}
                </Text>
              </View>
            </>
          )}
        </SectionCard>

        {/* Experience */}
        <SectionCard
          title="Experience"
          subtitle="Your track record as a guide"
          icon="ribbon-outline"
          onEdit={() => openEdit("experience")}
        >
          <View className="flex-row">
            <View className="flex-1 mr-2 rounded-2xl bg-[#F5F8F0] p-4">
              <Text className="text-2xl font-bold text-[#172B4D]">
                {profile.experienceYears}+
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Years as a guide
              </Text>
            </View>
            <View className="flex-1 ml-2 rounded-2xl bg-[#F5F8F0] p-4">
              <Text className="text-2xl font-bold text-[#172B4D]">
                {stats.calls}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Video tours completed
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      {/* Edit sheet */}
      <Sheet
        visible={editing !== null}
        title={sheetTitles[editing] || ""}
        error={error}
        saving={saving}
        onClose={closeEdit}
        onSave={saveSheet}
      >
        {renderSheetBody()}
      </Sheet>
      
{/* Profile picture preview and confirmation */}
<Modal
  visible={avatarModalVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={cancelAvatar}
>
  <View className="flex-1 items-center justify-center bg-black/60 px-6">
    <View className="w-full max-w-sm rounded-3xl bg-white p-6">
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-[#172B4D]">
            Profile picture
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Preview your photo before saving.
          </Text>
        </View>

        <TouchableOpacity
          onPress={cancelAvatar}
          disabled={uploadingAvatar}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          accessibilityLabel="Cancel profile picture selection"
        >
          <Ionicons name="close" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Image preview */}
      <View className="mb-5 items-center rounded-2xl bg-[#F5F8F0] py-7">
        <View className="rounded-full border-4 border-white">
          {selectedAvatar?.uri ? (
            <Image
              source={{ uri: selectedAvatar.uri }}
              className="h-40 w-40 rounded-full"
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View className="mt-4 flex-row items-center">
          <Ionicons
            name="checkmark-circle"
            size={17}
            color="#578A2B"
          />
          <Text className="ml-2 text-sm font-medium text-[#477C19]">
            Photo selected
          </Text>
        </View>
      </View>

      {/* Confirmation actions */}
      <TouchableOpacity
        onPress={confirmAvatar}
        disabled={uploadingAvatar || !selectedAvatar?.uri}
        activeOpacity={0.85}
        className={`mb-3 h-14 flex-row items-center justify-center rounded-2xl ${
          uploadingAvatar ? "bg-green-300" : "bg-green-500"
        }`}
      >
        {uploadingAvatar ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text className="ml-2 text-base font-bold text-white">
              Uploading photo...
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color="#FFFFFF"
            />
            <Text className="ml-2 text-base font-bold text-white">
              Confirm and save
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={cancelAvatar}
        disabled={uploadingAvatar}
        activeOpacity={0.7}
        className="h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white"
      >
        <Text className="text-sm font-semibold text-gray-600">
          Cancel
        </Text>
      </TouchableOpacity>

      <Text className="mt-4 text-center text-xs leading-5 text-gray-400">
        Your profile picture will only be updated after you confirm.
      </Text>
    </View>
  </View>
</Modal>

<ImageCropper
  visible={cropVisible}
  uri={cropSource?.uri}
  width={cropSource?.width}
  height={cropSource?.height}
  shape="circle"
  onCancel={handleCropCancel}
  onConfirm={handleCropConfirm}
/>

    </SafeAreaView>
  );
};

export default Index;
