import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const LOCATIONS = [
  "Addis Ababa, Ethiopia",
  "Debre Berhan, Ethiopia",
  "Bahir Dar, Ethiopia",
  "Hawassa, Ethiopia",
  "Adama, Ethiopia",
  "Gondar, Ethiopia",
  "Mekelle, Ethiopia",
  "Dire Dawa, Ethiopia",
  "Jimma, Ethiopia",
  "Lalibela, Ethiopia",
  "Bole International Airport, Addis Ababa",
  "Unity Park, Addis Ababa",
  "National Museum of Ethiopia, Addis Ababa",
  "Entoto Park, Addis Ababa",
  "Lake Tana, Bahir Dar",
];

const POPULAR = [
  "Lalibela, Ethiopia",
  "Lake Tana, Bahir Dar",
  "Unity Park, Addis Ababa",
  "Entoto Park, Addis Ababa",
  "Gondar, Ethiopia",
];

const MAX_RECENTS = 5;

const getSuggestions = (value) => {
  const q = value.trim().toLowerCase();
  if (!q) return LOCATIONS.slice(0, 5); // popular picks while the field is empty
  return LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 5);
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
const Suggestions = ({ items, emptyQuery, onSelect, tint }) => {
  if (items.length === 0) return null;
  return (
    <View className="mt-2 overflow-hidden bg-white border border-gray-200 rounded-2xl">
      {emptyQuery && (
        <Text className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400">Popular places</Text>
      )}
      {items.map((location, index) => (
        <TouchableOpacity
          key={location}
          onPress={() => onSelect(location)}
          activeOpacity={0.7}
          className={`flex-row items-center px-4 py-3 ${
            index !== items.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <Ionicons name="location-outline" size={19} color={tint} />
          <Text className="flex-1 ml-3 text-sm text-[#24334D]">{location}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LocationField = ({
  label,
  icon,
  iconColor,
  tileClass,
  value,
  selected,
  error,
  placeholder,
  returnKeyType,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  onSubmitEditing,
  inputRef,
}) => (
  <View>
    <View
      className={`flex-row items-center rounded-2xl border bg-[#F7F9FC] px-3 py-3 ${
        error ? "border-red-300" : "border-gray-200"
      }`}
    >
      <View className={`h-11 w-11 items-center justify-center rounded-xl ${tileClass}`}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <View className="flex-1 ml-3">
        <Text className="mb-1 text-xs font-semibold text-gray-500">{label}</Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="p-0 text-sm text-[#172B4D]"
          autoCorrect={false}
          returnKeyType={returnKeyType}
        />
      </View>

      {selected && value.length > 0 && (
        <Ionicons name="checkmark-circle" size={18} color="#22C55E" style={{ marginRight: 8 }} />
      )}
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={10} accessibilityLabel={`Clear ${label}`}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>

    {error ? (
      <View className="flex-row items-center mt-2">
        <Ionicons name="alert-circle" size={15} color="#DC2626" />
        <Text className="flex-1 ml-1.5 text-xs text-red-600">{error}</Text>
      </View>
    ) : null}
  </View>
);

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const Index = () => {
  const { user } = useSelector((state) => state.auth);
  const unreadNotifications = user?.unreadNotifications ?? 0; // wire to your notifications state

  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const [errors, setErrors] = useState({});
  const [recents, setRecents] = useState([]); // in memory; persist with your storage/API if you like

  const toRef = useRef(null);

  const fromSuggestions = getSuggestions(fromLocation);
  const toSuggestions = getSuggestions(toLocation);

  const selectFrom = (location) => {
    setFromLocation(location);
    setSelectedFrom(location);
    setShowFromSuggestions(false);
    setErrors((e) => ({ ...e, from: undefined, same: undefined }));
    toRef.current?.focus();
  };

  const selectTo = (location) => {
    setToLocation(location);
    setSelectedTo(location);
    setShowToSuggestions(false);
    setErrors((e) => ({ ...e, to: undefined, same: undefined }));
  };

  // Let a tap on a suggestion register before the list disappears
  const hideLater = (setter) => setTimeout(() => setter(false), 150);

  const swap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
    setSelectedFrom(selectedTo);
    setSelectedTo(selectedFrom);
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
    setErrors({});
  };

  const applyRecent = (item) => {
    setFromLocation(item.from);
    setToLocation(item.to);
    setSelectedFrom(item.from);
    setSelectedTo(item.to);
    setErrors({});
  };

  const handleSearch = () => {
    const from = fromLocation.trim();
    const to = toLocation.trim();

    const next = {};
    if (!from) next.from = "Enter where you're starting from";
    if (!to) next.to = "Enter your destination";
    if (from && to && from.toLowerCase() === to.toLowerCase()) {
      next.same = "Start and destination can't be the same";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setShowFromSuggestions(false);
    setShowToSuggestions(false);

    // Remember this search (newest first, no duplicates)
    setRecents((prev) =>
      [{ from, to }, ...prev.filter((r) => !(r.from === from && r.to === to))].slice(0, MAX_RECENTS)
    );

    // Keep your existing navigation.
    router.push("../Login");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        {/* <View className="flex-row items-center px-5 pt-4">
          <Image
            className="w-12 h-12 rounded-2xl"
            resizeMode="cover"
            source={require("../../../assets/images/homeimg.png")}
          />
          <View className="flex-1 ml-3">
            <Text className="text-sm text-gray-500">Welcome back,</Text>
            <Text className="text-lg font-bold text-[#172B4D]" numberOfLines={1}>
              {user?.name || "Visitor"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/Notification")}
            activeOpacity={0.7}
            className="items-center justify-center bg-white rounded-full w-11 h-11"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#172B4D" />
            {unreadNotifications > 0 && (
              <View className="absolute w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full top-2.5 right-3" />
            )}
          </TouchableOpacity>
        </View> */}

        <View className="px-5 mt-6">
          <Text className="text-[28px] font-bold leading-9 text-[#172B4D]">
            Where would{"\n"}you like to go?
          </Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">
            Discover new places and plan your next journey.
          </Text>
        </View>

        {/* Search card */}
        <View className="p-5 mx-5 mt-6 bg-white rounded-3xl">
          <Text className="mb-4 text-base font-bold text-[#172B4D]">Plan your trip</Text>

          {/* FROM */}
          <View className="z-20">
            <LocationField
              label="FROM"
              icon="location-outline"
              iconColor="#578A2B"
              tileClass="bg-[#EAF6D9]"
              value={fromLocation}
              selected={!!selectedFrom}
              error={errors.from}
              placeholder="Enter your current location"
              returnKeyType="next"
              onChangeText={(text) => {
                setFromLocation(text);
                setSelectedFrom(null);
                setShowFromSuggestions(true);
                if (errors.from || errors.same) setErrors((e) => ({ ...e, from: undefined, same: undefined }));
              }}
              onFocus={() => setShowFromSuggestions(true)}
              onBlur={() => hideLater(setShowFromSuggestions)}
              onSubmitEditing={() => toRef.current?.focus()}
              onClear={() => {
                setFromLocation("");
                setSelectedFrom(null);
                setShowFromSuggestions(true);
              }}
            />
            {showFromSuggestions && (
              <Suggestions
                items={fromSuggestions}
                emptyQuery={!fromLocation.trim()}
                onSelect={selectFrom}
                tint="#578A2B"
              />
            )}
          </View>

          {/* Connector + swap */}
          <View className="flex-row items-center justify-between my-1">
            <View className="h-6 ml-8 border-l-2 border-gray-300 border-dashed" />
            <TouchableOpacity
              onPress={swap}
              activeOpacity={0.7}
              className="items-center justify-center bg-white border border-gray-200 rounded-full w-9 h-9"
              accessibilityLabel="Swap start and destination"
            >
              <Ionicons name="swap-vertical" size={18} color="#4060B2" />
            </TouchableOpacity>
          </View>

          {/* TO */}
          <View className="z-10">
            <LocationField
              inputRef={toRef}
              label="TO"
              icon="navigate-outline"
              iconColor="#E88942"
              tileClass="bg-[#FFF0E5]"
              value={toLocation}
              selected={!!selectedTo}
              error={errors.to || errors.same}
              placeholder="Enter your destination"
              returnKeyType="search"
              onChangeText={(text) => {
                setToLocation(text);
                setSelectedTo(null);
                setShowToSuggestions(true);
                if (errors.to || errors.same) setErrors((e) => ({ ...e, to: undefined, same: undefined }));
              }}
              onFocus={() => setShowToSuggestions(true)}
              onBlur={() => hideLater(setShowToSuggestions)}
              onSubmitEditing={handleSearch}
              onClear={() => {
                setToLocation("");
                setSelectedTo(null);
                setShowToSuggestions(true);
              }}
            />
            {showToSuggestions && (
              <Suggestions
                items={toSuggestions}
                emptyQuery={!toLocation.trim()}
                onSelect={selectTo}
                tint="#E88942"
              />
            )}
          </View>

          {/* Search */}
          <TouchableOpacity
            onPress={handleSearch}
            activeOpacity={0.85}
            className="flex-row items-center justify-center py-4 mt-5 bg-green-500 rounded-2xl"
          >
            <MaterialIcons name="search" size={22} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">Search Destinations</Text>
          </TouchableOpacity>
        </View>

        {/* Popular destinations */}
        <View className="mt-7">
          <Text className="px-5 mb-3 text-base font-bold text-[#172B4D]">Popular destinations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {POPULAR.map((place) => {
              const on = toLocation === place;
              return (
                <TouchableOpacity
                  key={place}
                  onPress={() => selectTo(place)}
                  activeOpacity={0.75}
                  className={`flex-row items-center px-4 py-2.5 mr-2 rounded-full border ${
                    on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                  }`}
                >
                  <Ionicons name="location-outline" size={15} color="#578A2B" />
                  <Text className={`ml-1.5 text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>
                    {place.split(",")[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent searches */}
        {recents.length > 0 && (
          <View className="mx-5 mt-7">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-[#172B4D]">Recent searches</Text>
              <TouchableOpacity onPress={() => setRecents([])} hitSlop={8}>
                <Text className="text-sm font-semibold text-[#4060B2]">Clear</Text>
              </TouchableOpacity>
            </View>

            <View className="px-4 overflow-hidden bg-white rounded-2xl">
              {recents.map((item, index) => (
                <TouchableOpacity
                  key={`${item.from}-${item.to}`}
                  onPress={() => applyRecent(item)}
                  activeOpacity={0.7}
                  className={`flex-row items-center py-4 ${
                    index !== recents.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
                    <Ionicons name="time-outline" size={21} color="#578A2B" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
                      {item.to}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
                      From {item.from}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={25} color="#A0A8B5" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Illustration */}
        <View className="mx-5 mt-7">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-base font-bold text-[#172B4D]">Ready to explore?</Text>
              <Text className="mt-1 text-sm text-gray-500">Your next adventure starts here.</Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF8D9]">
              <Ionicons name="compass-outline" size={22} color="#578A2B" />
            </View>
          </View>

          <View className="p-3 overflow-hidden bg-white rounded-3xl">
            <Image
              className="w-full"
              style={{ height: 220 }}
              resizeMode="contain"
              source={require("../../../assets/images/locserarch.png")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;