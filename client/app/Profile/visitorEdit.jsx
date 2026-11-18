import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
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
const LANGUAGE_SUGGESTIONS = ["English", "French", "German", "Spanish", "Arabic", "Chinese"];
const INTEREST_SUGGESTIONS = [
  "History",
  "Food & Coffee",
  "Architecture",
  "Markets",
  "Nature",
  "Music & Art",
  "Religion & Culture",
];
const PACES = [
  { key: "Relaxed", hint: "Take it slow, linger at each stop" },
  { key: "Balanced", hint: "A mix of stops and stories" },
  { key: "Packed", hint: "See as much as possible" },
];
const GROUPS = ["Solo", "Couple", "Family", "Friends"];
const LENGTHS = ["30 min", "60 min", "90 min"];
const BIO_MAX = 240;

const buildProfile = (user) => ({
  name: user?.name || user?.fullName || "",
  country: user?.country || "",
  city: user?.city || "",
  bio: user?.bio || "",
  languages: user?.languages || ["English"],
  interests: user?.interests || [],
  pace: user?.pace || "Balanced",
  group: user?.group || "Solo",
  length: user?.length || "60 min",
  notify: user?.notify || { reminders: true, replies: true, offers: false },
});

/* ------------------------------------------------------------------ */
/* Small reusable pieces                                               */
/* ------------------------------------------------------------------ */
const inputClass =
  "rounded-xl border border-gray-200 bg-[#F7F9FC] px-4 py-3 text-[15px] text-[#172B4D]";

const Chip = ({ label, onRemove }) => (
  <View className="flex-row items-center px-3 py-1.5 mb-2 mr-2 rounded-full bg-[#EAF8D9]">
    <Text className="text-sm font-medium text-[#477C19]">{label}</Text>
    {onRemove && (
      <TouchableOpacity onPress={onRemove} hitSlop={8} className="ml-1.5" accessibilityLabel={`Remove ${label}`}>
        <Ionicons name="close-circle" size={16} color="#477C19" />
      </TouchableOpacity>
    )}
  </View>
);

const EmptyHint = ({ text }) => <Text className="text-sm text-gray-400">{text}</Text>;

const SectionCard = ({ title, subtitle, icon, onEdit, children }) => (
  <View className="p-4 mx-5 mt-4 bg-white rounded-2xl">
    <View className="flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
        <Ionicons name={icon} size={21} color="#578A2B" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold text-[#24334D]">{title}</Text>
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

/* single-choice pills */
const Pills = ({ options, value, onChange }) => (
  <View className="flex-row flex-wrap">
    {options.map((o) => {
      const on = value === o;
      return (
        <TouchableOpacity
          key={o}
          onPress={() => onChange(o)}
          activeOpacity={0.7}
          className={`px-4 py-2.5 mb-2 mr-2 rounded-full border ${
            on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
          }`}
        >
          <Text className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>{o}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const ChipEditor = ({ items, onChange, suggestions, placeholder }) => {
  const [text, setText] = useState("");

  const add = (value) => {
    const v = value.trim();
    if (v && !items.some((i) => i.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setText("");
  };

  const remaining = suggestions.filter((s) => !items.some((i) => i.toLowerCase() === s.toLowerCase()));

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
            <Chip key={item} label={item} onRemove={() => onChange(items.filter((i) => i !== item))} />
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

const ToggleRow = ({ title, subtitle, value, onChange }) => (
  <View className="flex-row items-center justify-between p-4 mb-3 rounded-2xl bg-[#F5F8F0]">
    <View className="flex-1 pr-3">
      <Text className="text-[15px] font-semibold text-[#24334D]">{title}</Text>
      <Text className="mt-0.5 text-xs text-gray-500">{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#D1D5DB", true: "#86D36B" }}
      thumbColor="#FFFFFF"
    />
  </View>
);

const Sheet = ({ visible, title, error, saving, onClose, onSave, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="justify-end flex-1 bg-black/40"
    >
      <Pressable className="flex-1" onPress={onClose} />
      <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl max-h-[85%]">
        <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
        <Text className="mb-4 text-lg font-bold text-[#172B4D]">{title}</Text>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="items-center justify-center flex-1 py-3.5 mr-2 rounded-xl bg-gray-100"
          >
            <Text className="text-[15px] font-semibold text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.8}
            className={`items-center justify-center flex-1 py-3.5 ml-2 rounded-xl ${
              saving ? "bg-green-300" : "bg-green-500"
            }`}
          >
            <Text className="text-[15px] font-semibold text-white">{saving ? "Saving..." : "Save changes"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const VisitorProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const [cropVisible, setCropVisible] = useState(false);

  const [profile, setProfile] = useState(() => buildProfile(user));
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(null); // "basic" | "about" | "languages" | "interests" | "style" | "notify"
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef(null);

  // Read-only numbers that come from bookings, not from this form
  const stats = {
    tours: user?.toursTaken ?? 0,
    saved: user?.savedGuides ?? 0,
    reviews: user?.reviewsWritten ?? 0,
  };

  const patch = (changes) => setDraft((d) => ({ ...d, ...changes }));

  const openEdit = (key) => {
    setDraft(profile);
    setError("");
    setEditing(key);
  };

  const closeEdit = () => {
    if (!saving) setEditing(null);
  };

  const flashSaved = () => {
    setJustSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 2000);
  };

  /** Replace the body with your real API call / thunk. */
  const persist = async (next) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400)); // <-- your API call here
      setProfile(next);
      flashSaved();
      return true;
    } catch (e) {
      Alert.alert("Couldn't save changes", "Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validate = (key, d) => {
    switch (key) {
      case "basic":
        return d.name.trim() ? "" : "Enter your name.";
      case "languages":
        return d.languages.length === 0 ? "Add at least one language so guides can match you." : "";
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
      country: draft.country.trim(),
      city: draft.city.trim(),
      bio: draft.bio.trim(),
    };
    console.log({next});
    await dispatch(editProfile(next)).unwrap();
     setEditing(null);
  };

  /* ------------------------------ avatar flow ------------------------------ */
  const pickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    } catch (e) {
      Alert.alert("Unable to select photo", e?.message || "Please try again.");
    }
  };

  const handleCropConfirm = (cropped) => {
    setCropVisible(false);
    // wait for the crop modal to close before opening the next one (iOS)
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
      const updatedUser = result?.user ?? result;
      if (!updatedUser?.profileImage) {
        throw new Error("The server did not return the profile image URL.");
      }

      setAvatarModalVisible(false);
      setSelectedAvatar(null);
      flashSaved();
      Alert.alert("Success", "Your profile picture has been updated.");
    } catch (e) {
      Alert.alert(
        "Upload failed",
        typeof e === "string" ? e : e?.message || "Could not upload your profile picture.",
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

  /* ----------------------------- sheet bodies ----------------------------- */
  const sheetTitles = {
    basic: "Edit your details",
    about: "About you",
    languages: "Languages you speak",
    interests: "What you want to see",
    style: "Tour preferences",
    notify: "Notifications",
  };

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
            <Field label="Country">
              <TextInput
                value={draft.country}
                onChangeText={(t) => patch({ country: t })}
                placeholder="Where do you live?"
                placeholderTextColor="#9CA3AF"
                className={inputClass}
              />
            </Field>
            <Field label="City" hint="Helps guides pick a good time for your time zone.">
              <TextInput
                value={draft.city}
                onChangeText={(t) => patch({ city: t })}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                className={inputClass}
              />
            </Field>
          </>
        );

      case "about":
        return (
          <Field label="A little about you">
            <TextInput
              value={draft.bio}
              onChangeText={(t) => patch({ bio: t })}
              placeholder="Share why you want to explore, and anything your guide should know."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={BIO_MAX}
              textAlignVertical="top"
              className={`${inputClass} min-h-[130px]`}
            />
            <Text className="mt-1.5 text-xs text-right text-gray-400">
              {draft.bio.length}/{BIO_MAX}
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

      case "interests":
        return (
          <ChipEditor
            items={draft.interests}
            onChange={(interests) => patch({ interests })}
            suggestions={INTEREST_SUGGESTIONS}
            placeholder="Add something you're curious about"
          />
        );

      case "style":
        return (
          <>
            <Field label="Pace">
              {PACES.map((p) => {
                const on = draft.pace === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => patch({ pace: p.key })}
                    activeOpacity={0.7}
                    className={`flex-row items-center p-3.5 mb-2 rounded-2xl border ${
                      on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`text-[15px] font-semibold ${on ? "text-[#477C19]" : "text-[#24334D]"}`}>
                        {p.key}
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-500">{p.hint}</Text>
                    </View>
                    {on && <Ionicons name="checkmark-circle" size={20} color="#477C19" />}
                  </TouchableOpacity>
                );
              })}
            </Field>
            <Field label="Who's joining">
              <Pills options={GROUPS} value={draft.group} onChange={(group) => patch({ group })} />
            </Field>
            <Field label="Preferred tour length">
              <Pills options={LENGTHS} value={draft.length} onChange={(length) => patch({ length })} />
            </Field>
          </>
        );

      case "notify":
        return (
          <>
            <ToggleRow
              title="Tour reminders"
              subtitle="Get a nudge before a booked tour starts."
              value={draft.notify.reminders}
              onChange={(v) => patch({ notify: { ...draft.notify, reminders: v } })}
            />
            <ToggleRow
              title="Guide replies"
              subtitle="Know when a guide answers your message."
              value={draft.notify.replies}
              onChange={(v) => patch({ notify: { ...draft.notify, replies: v } })}
            />
            <ToggleRow
              title="New tours and offers"
              subtitle="Hear about tours that match your interests."
              value={draft.notify.offers}
              onChange={(v) => patch({ notify: { ...draft.notify, offers: v } })}
            />
          </>
        );

      default:
        return null;
    }
  };

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const notifyCount = Object.values(profile.notify).filter(Boolean).length;

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
            <Text className="text-2xl font-bold text-[#172B4D]">My profile</Text>
            <Text className="mt-0.5 text-sm text-gray-500">Help guides plan the right tour for you</Text>
          </View>

          {justSaved && (
            <View className="flex-row items-center px-3 py-1 rounded-full bg-[#EAF8D9]">
              <Ionicons name="checkmark-circle" size={14} color="#477C19" />
              <Text className="ml-1 text-xs font-semibold text-[#477C19]">Saved</Text>
            </View>
          )}
        </View>

        {/* Profile card: left-aligned, so it reads differently from the guide's centered card */}
        <View className="p-5 mx-5 bg-white rounded-3xl">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                className="w-24 h-24 border-4 border-[#EAF8D9] rounded-full"
                source={
                  user?.profileImage
                    ? { uri: user.profileImage }
                    : require("../../assets/images/profile.jpg")
                }
              />
              <TouchableOpacity
                onPress={pickAvatar}
                activeOpacity={0.8}
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#4060B2]"
                accessibilityLabel="Change profile photo"
              >
                <Entypo name="camera" size={15} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-[#172B4D]" numberOfLines={1}>
                {profile.name || "Your name"}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-sm text-gray-500" numberOfLines={1}>
                  {location || "Add where you're from"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => openEdit("basic")}
                activeOpacity={0.7}
                className="flex-row items-center self-start px-3 py-1 mt-2.5 rounded-full bg-[#EEF2FB]"
                accessibilityLabel="Edit name and location"
              >
                <Ionicons name="pencil" size={12} color="#4060B2" />
                <Text className="ml-1 text-xs font-semibold text-[#4060B2]">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center py-4 mt-5 rounded-2xl bg-[#F5F8F0]">
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-[#172B4D]">{stats.tours}</Text>
              <Text className="mt-1 text-xs text-gray-500">Tours taken</Text>
            </View>
            <View className="w-px h-9 bg-[#DDE6CF]" />
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-[#172B4D]">{stats.saved}</Text>
              <Text className="mt-1 text-xs text-gray-500">Saved guides</Text>
            </View>
            <View className="w-px h-9 bg-[#DDE6CF]" />
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-[#172B4D]">{stats.reviews}</Text>
              <Text className="mt-1 text-xs text-gray-500">Reviews</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <SectionCard
          title="About me"
          subtitle="Tell guides who's joining them"
          icon="person-outline"
          onEdit={() => openEdit("about")}
        >
          {profile.bio ? (
            <Text className="text-[15px] leading-6 text-[#24334D]">{profile.bio}</Text>
          ) : (
            <EmptyHint text="Add a short note so your guide can welcome you properly." />
          )}
        </SectionCard>

        {/* Interests */}
        <SectionCard
          title="What I want to see"
          subtitle="Guides use this to shape your tour"
          icon="heart-outline"
          onEdit={() => openEdit("interests")}
        >
          <View className="flex-row flex-wrap">
            {profile.interests.length ? (
              profile.interests.map((i) => <Chip key={i} label={i} />)
            ) : (
              <EmptyHint text="Pick a few topics to get better guide matches." />
            )}
          </View>
        </SectionCard>

        {/* Languages */}
        <SectionCard
          title="Languages I speak"
          subtitle="Match with guides you can talk to"
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

        {/* Tour preferences */}
        <SectionCard
          title="Tour preferences"
          subtitle="Your usual way of exploring"
          icon="options-outline"
          onEdit={() => openEdit("style")}
        >
          <View className="flex-row">
            <View className="flex-1 mr-2 rounded-2xl bg-[#F5F8F0] p-3.5">
              <Ionicons name="walk-outline" size={18} color="#578A2B" />
              <Text className="mt-2 text-[15px] font-bold text-[#172B4D]">{profile.pace}</Text>
              <Text className="mt-0.5 text-xs text-gray-500">Pace</Text>
            </View>
            <View className="flex-1 mx-1 rounded-2xl bg-[#F5F8F0] p-3.5">
              <Ionicons name="people-outline" size={18} color="#578A2B" />
              <Text className="mt-2 text-[15px] font-bold text-[#172B4D]">{profile.group}</Text>
              <Text className="mt-0.5 text-xs text-gray-500">Joining</Text>
            </View>
            <View className="flex-1 ml-2 rounded-2xl bg-[#F5F8F0] p-3.5">
              <Ionicons name="time-outline" size={18} color="#578A2B" />
              <Text className="mt-2 text-[15px] font-bold text-[#172B4D]">{profile.length}</Text>
              <Text className="mt-0.5 text-xs text-gray-500">Length</Text>
            </View>
          </View>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          title="Notifications"
          subtitle="Choose what we tell you about"
          icon="notifications-outline"
          onEdit={() => openEdit("notify")}
        >
          <View className="flex-row items-center">
            <View className={`h-2.5 w-2.5 rounded-full ${notifyCount ? "bg-green-500" : "bg-gray-300"}`} />
            <Text className="ml-2 text-[15px] font-semibold text-[#24334D]">
              {notifyCount ? `${notifyCount} of 3 turned on` : "All notifications are off"}
            </Text>
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
        <View className="items-center justify-center flex-1 px-6 bg-black/60">
          <View className="w-full max-w-sm p-6 bg-white rounded-3xl">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1 pr-3">
                <Text className="text-xl font-bold text-[#172B4D]">Profile picture</Text>
                <Text className="mt-1 text-sm text-gray-500">Preview your photo before saving.</Text>
              </View>
              <TouchableOpacity
                onPress={cancelAvatar}
                disabled={uploadingAvatar}
                className="items-center justify-center w-10 h-10 bg-gray-100 rounded-full"
                accessibilityLabel="Cancel profile picture selection"
              >
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View className="mb-5 items-center rounded-2xl bg-[#F5F8F0] py-7">
              <View className="border-4 border-white rounded-full">
                {selectedAvatar?.uri ? (
                  <Image source={{ uri: selectedAvatar.uri }} className="w-40 h-40 rounded-full" resizeMode="cover" />
                ) : null}
              </View>
            </View>

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
                  <Text className="ml-2 text-base font-bold text-white">Uploading photo...</Text>
                </>
              ) : (
                <Text className="text-base font-bold text-white">Save photo</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={cancelAvatar}
              disabled={uploadingAvatar}
              activeOpacity={0.7}
              className="items-center justify-center h-12 bg-white border border-gray-200 rounded-2xl"
            >
              <Text className="text-sm font-semibold text-gray-600">Cancel</Text>
            </TouchableOpacity>
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

export default VisitorProfile;