// app/bookTour.jsx   ->  route: /bookTour?guideId=g1&placeId=p3
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import {
  WEEKDAYS,
  formatTime12,
  getGuide,
  getPlace,
  guideImageOf,
  money,
} from "../../data/mockData";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DURATIONS = [30, 60, 90, 120]; // minutes (Booking.duration)
const DAYS_AHEAD = 14;
const LEAD_MINUTES = 30; // can't book a slot starting sooner than this

// Transaction.method values
const ALL_METHODS = [
  { value: "credit_card", label: "Credit card", icon: "card-outline" },
  { value: "paypal", label: "PayPal", icon: "logo-paypal" },
  { value: "apple_pay", label: "Apple Pay", icon: "logo-apple", iosOnly: true },
];
const METHODS = ALL_METHODS.filter((m) => !m.iosOnly || Platform.OS === "ios");

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const dateLabel = (d) =>
  `${WEEKDAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

const Card = ({ title, children }) => (
  <View className="p-4 mx-5 mt-4 bg-white rounded-2xl">
    <Text className="mb-3 text-[15px] font-semibold text-[#24334D]">{title}</Text>
    {children}
  </View>
);

export default function BookTour() {
  const { guideId, placeId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const user = useSelector((state) => state.auth.user);
  const guide = getGuide(guideId);
  const place = placeId ? getPlace(placeId) : null;

  /* Next 14 days, each flagged available if the guide works that weekday */
  const availabilityByDay = useMemo(
    () => (guide ? Object.fromEntries(guide.availability.map((s) => [s.day, s])) : {}),
    [guide]
  );
  const dates = useMemo(() => {
    return Array.from({ length: DAYS_AHEAD }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      return { date: d, available: !!availabilityByDay[WEEKDAYS[d.getDay()]] };
    });
  }, [availabilityByDay]);

  const [dateIndex, setDateIndex] = useState(() => Math.max(0, dates.findIndex((d) => d.available)));
  const [duration, setDuration] = useState(60);
  const [slot, setSlot] = useState(null); // "HH:MM"
  const [notes, setNotes] = useState(place ? `I'd like a virtual tour of ${place.name}.` : "");
  const [method, setMethod] = useState(METHODS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  /* Start times for the chosen day and duration, every 30 minutes */
  const slots = useMemo(() => {
    if (!guide) return [];
    const chosen = dates[dateIndex];
    const window = chosen && availabilityByDay[WEEKDAYS[chosen.date.getDay()]];
    if (!window) return [];

    const start = toMinutes(window.startTime);
    const end = toMinutes(window.endTime);
    const now = new Date();
    const isToday = chosen.date.toDateString() === now.toDateString();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const result = [];
    for (let t = start; t + duration <= end; t += 30) {
      if (isToday && t < nowMinutes + LEAD_MINUTES) continue;
      result.push(toHHMM(t));
    }
    return result;
  }, [guide, dates, dateIndex, duration, availabilityByDay]);

  if (!guide) {
    return (
      <View className="items-center justify-center flex-1 px-10 bg-[#F7F9FC]">
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="mt-4 text-lg font-bold text-[#172B4D]">Guide not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 mt-5 bg-green-500 rounded-xl"
        >
          <Text className="font-semibold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = Math.round(((guide.pricePerHour * duration) / 60) * 100) / 100;
  const chosenDate = dates[dateIndex]?.date;
  const canConfirm = !!slot && !submitting;

  const pickDate = (index) => {
    setDateIndex(index);
    setSlot(null);
  };

  const pickDuration = (value) => {
    setDuration(value);
    setSlot(null);
  };

  const confirm = async () => {
    if (!slot || !chosenDate) return;

    const [h, m] = slot.split(":").map(Number);
    const scheduledAt = new Date(chosenDate);
    scheduledAt.setHours(h, m, 0, 0);

    const visitorId = user?._id ?? user?.id;

    // Shapes match your Booking and Transaction models.
    const booking = {
      visitorId,
      guideId: guide.id,
      scheduledAt: scheduledAt.toISOString(),
      duration,
      status: "pending",
      price,
      paymentStatus: "paid",
      notes: notes.trim(),
    };
    const transaction = {
      payerId: visitorId,
      payeeId: guide.userId,
      amount: price,
      method,
      status: "completed",
    };

    setSubmitting(true);
    try {
      // TODO: replace with your API call, e.g.
      //   const res = await api.post("/bookings", { booking, transaction });
      // The server should create the Booking + Transaction and set streamCallId.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setConfirmation({ booking, transaction, scheduledAt });
    } catch (e) {
      Alert.alert("Couldn't complete your booking", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ success ------------------------------ */
  if (confirmation) {
    const { booking, scheduledAt, transaction } = confirmation;
    const methodLabel = ALL_METHODS.find((x) => x.value === transaction.method)?.label;
    return (
      <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top", "bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="items-center px-6 mt-14">
            <View className="items-center justify-center w-24 h-24 rounded-full bg-[#EAF8D9]">
              <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
            </View>
            <Text className="mt-6 text-2xl font-bold text-center text-[#172B4D]">
              Booking requested
            </Text>
            <Text className="mt-2 text-base leading-6 text-center text-gray-500">
              {guide.name.split(" ")[0]} will confirm your tour soon. You'll get a notification.
            </Text>
          </View>

          <View className="p-4 mx-5 mt-8 bg-white rounded-2xl">
            <View className="flex-row items-center">
              <Image className="w-14 h-14 rounded-2xl" source={guideImageOf(guide)} />
              <View className="flex-1 ml-3">
                <Text className="text-[15px] font-semibold text-[#24334D]">{guide.name}</Text>
                <Text className="mt-0.5 text-xs text-gray-500">{guide.location}</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-[#FFF4D6]">
                <Text className="text-xs font-semibold text-[#9A6B00]">Awaiting reply</Text>
              </View>
            </View>

            <View className="my-4 h-px bg-gray-100" />

            {[
              ["Date", dateLabel(scheduledAt)],
              ["Time", formatTime12(toHHMM(scheduledAt.getHours() * 60 + scheduledAt.getMinutes()))],
              ["Duration", `${booking.duration} min`],
              ["Payment", methodLabel],
              ["Total paid", money(booking.price)],
            ].map(([label, value]) => (
              <View key={label} className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm text-gray-500">{label}</Text>
                <Text className="text-sm font-semibold text-[#24334D]">{value}</Text>
              </View>
            ))}
          </View>

          <View className="flex-1 min-h-[24px]" />

          <View className="px-5 pb-3 mt-4">
            <TouchableOpacity
              onPress={() => router.replace("/myBookings")}
              activeOpacity={0.85}
              className="items-center py-4 bg-green-500 rounded-2xl"
            >
              <Text className="text-base font-semibold text-white">View my meetings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="items-center py-4 mt-2"
            >
              <Text className="text-base font-semibold text-gray-500">Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ------------------------------- form -------------------------------- */
  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
        >
          {/* Header */}
          <View className="flex-row items-center px-5 pt-4 pb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="items-center justify-center w-10 h-10 bg-white rounded-full"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
              <Text className="text-2xl font-bold text-[#172B4D]">Book a tour</Text>
              <Text className="mt-0.5 text-sm text-gray-500">Pick a time that works for you</Text>
            </View>
          </View>

          {/* Guide */}
          <TouchableOpacity
            onPress={() => router.push(`/guide/${guide.id}`)}
            activeOpacity={0.8}
            className="flex-row items-center p-4 mx-5 bg-white rounded-2xl"
          >
            <Image className="w-14 h-14 rounded-2xl" source={guideImageOf(guide)} />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
                  {guide.name}
                </Text>
                {guide.isVerified && (
                  <Ionicons name="checkmark-circle" size={15} color="#477C19" style={{ marginLeft: 4 }} />
                )}
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={12} color="#FAC22F" />
                <Text className="ml-1 text-xs text-gray-500">
                  {guide.rating} · {money(guide.pricePerHour)}/hr
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#A0A8B5" />
          </TouchableOpacity>

          {/* Date */}
          <Card title="Choose a date">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map(({ date, available }, index) => {
                const selected = index === dateIndex;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => available && pickDate(index)}
                    disabled={!available}
                    activeOpacity={0.8}
                    className={`items-center justify-center mr-2 w-16 py-3 rounded-2xl border ${
                      selected
                        ? "bg-green-500 border-green-500"
                        : available
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selected ? "text-white" : available ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {WEEKDAYS[date.getDay()].slice(0, 3)}
                    </Text>
                    <Text
                      className={`mt-1 text-lg font-bold ${
                        selected ? "text-white" : available ? "text-[#172B4D]" : "text-gray-300"
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                    <Text
                      className={`text-[10px] ${
                        selected ? "text-white/80" : available ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {MONTHS[date.getMonth()]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Card>

          {/* Duration */}
          <Card title="Duration">
            <View className="flex-row flex-wrap">
              {DURATIONS.map((d) => {
                const on = duration === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => pickDuration(d)}
                    activeOpacity={0.8}
                    className={`px-4 py-2.5 mb-2 mr-2 rounded-full border ${
                      on ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                    }`}
                  >
                    <Text className={`text-sm font-medium ${on ? "text-[#477C19]" : "text-gray-600"}`}>
                      {d} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Time */}
          <Card title="Choose a time">
            {slots.length === 0 ? (
              <Text className="text-sm text-gray-400">
                No times left for this day with a {duration}-minute tour. Try another date or a shorter
                duration.
              </Text>
            ) : (
              <View className="flex-row flex-wrap">
                {slots.map((s) => {
                  const on = slot === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSlot(s)}
                      activeOpacity={0.8}
                      className={`px-3.5 py-2.5 mb-2 mr-2 rounded-xl border ${
                        on ? "bg-green-500 border-green-500" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text className={`text-sm font-medium ${on ? "text-white" : "text-gray-600"}`}>
                        {formatTime12(s)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Notes */}
          <Card title="Notes for your guide (optional)">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything you'd like to see or ask about?"
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={300}
              textAlignVertical="top"
              className="rounded-xl border border-gray-200 bg-[#F7F9FC] px-4 py-3 text-[15px] text-[#172B4D] min-h-[96px]"
            />
            <Text className="mt-1.5 text-xs text-right text-gray-400">{notes.length}/300</Text>
          </Card>

          {/* Payment */}
          <Card title="Payment method">
            {METHODS.map((m, index) => {
              const on = method === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setMethod(m.value)}
                  activeOpacity={0.8}
                  className={`flex-row items-center p-3 border-2 rounded-2xl ${
                    index === 0 ? "" : "mt-2"
                  } ${on ? "border-green-500 bg-[#F0F7E8]" : "border-gray-200 bg-white"}`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-xl ${
                      on ? "bg-green-500" : "bg-[#F0F7E8]"
                    }`}
                  >
                    <Ionicons name={m.icon} size={20} color={on ? "#FFFFFF" : "#578A2B"} />
                  </View>
                  <Text className="flex-1 ml-3 text-[15px] font-semibold text-[#24334D]">{m.label}</Text>
                  <View
                    className={`items-center justify-center w-6 h-6 rounded-full border-2 ${
                      on ? "border-green-500 bg-green-500" : "border-gray-300"
                    }`}
                  >
                    {on && <Ionicons name="checkmark" size={14} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Summary */}
          <Card title="Summary">
            {[
              ["Date", chosenDate ? dateLabel(chosenDate) : "-"],
              ["Time", slot ? formatTime12(slot) : "Select a time"],
              ["Duration", `${duration} min`],
              ["Rate", `${money(guide.pricePerHour)} / hour`],
            ].map(([label, value]) => (
              <View key={label} className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm text-gray-500">{label}</Text>
                <Text className="text-sm font-semibold text-[#24334D]">{value}</Text>
              </View>
            ))}
            <View className="my-2 h-px bg-gray-100" />
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-base font-bold text-[#172B4D]">Total</Text>
              <Text className="text-base font-bold text-[#172B4D]">{money(price)}</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Bottom bar */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="absolute bottom-0 left-0 right-0 flex-row items-center px-5 pt-3 bg-white border-t border-gray-100"
        >
          <View className="flex-1">
            <Text className="text-xs text-gray-500">Total</Text>
            <Text className="text-lg font-bold text-[#172B4D]">{money(price)}</Text>
          </View>
          <TouchableOpacity
            onPress={confirm}
            disabled={!canConfirm}
            activeOpacity={0.85}
            className={`flex-row items-center px-7 py-4 rounded-2xl ${
              canConfirm ? "bg-green-500" : "bg-green-200"
            }`}
          >
            {submitting ? <ActivityIndicator color="white" style={{ marginRight: 8 }} /> : null}
            <Text className="text-[15px] font-semibold text-white">
              {slot ? "Confirm and pay" : "Select a time"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}