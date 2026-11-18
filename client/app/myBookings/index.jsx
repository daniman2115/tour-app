import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/* Sample data: replace with your API response                         */
/* status: "pending" | "confirmed" | "completed" | "canceled"          */
/* ------------------------------------------------------------------ */
const INITIAL_BOOKINGS = [
  {
    id: "b1",
    name: "Kate Norman",
    role: "Geologist",
    location: "London, UK",
    rating: 4.2,
    reviews: 1872,
    date: "2026-10-24T10:00:00",
    status: "pending",
  },
  {
    id: "b2",
    name: "Daniel Mekonnen",
    role: "Historian",
    location: "Addis Ababa, ET",
    rating: 4.8,
    reviews: 640,
    date: "2026-10-26T15:30:00",
    status: "confirmed",
  },
  {
    id: "b3",
    name: "Sara Bekele",
    role: "Nature Guide",
    location: "Hawassa, ET",
    rating: 4.6,
    reviews: 312,
    date: "2026-10-29T09:00:00",
    status: "pending",
  },
  {
    id: "b4",
    name: "Liam Carter",
    role: "Architect",
    location: "Toronto, CA",
    rating: 4.5,
    reviews: 980,
    date: "2026-10-12T11:00:00",
    status: "completed",
  },
  {
    id: "b5",
    name: "Hana Tesfaye",
    role: "Food Guide",
    location: "Gondar, ET",
    rating: 4.9,
    reviews: 221,
    date: "2026-10-05T17:00:00",
    status: "completed",
  },
  {
    id: "b6",
    name: "Omar Haddad",
    role: "Archaeologist",
    location: "Cairo, EG",
    rating: 4.3,
    reviews: 455,
    date: "2026-10-08T14:00:00",
    status: "canceled",
  },
];

const TABS = ["Upcoming", "Completed", "Canceled"];

const TAB_FILTER = {
  Upcoming: (b) => b.status === "pending" || b.status === "confirmed",
  Completed: (b) => b.status === "completed",
  Canceled: (b) => b.status === "canceled",
};

const EMPTY_COPY = {
  Upcoming: {
    icon: "calendar-outline",
    title: "No upcoming bookings",
    text: "New booking requests will show up here.",
  },
  Completed: {
    icon: "checkmark-done-outline",
    title: "No completed calls yet",
    text: "Finished calls will be listed here.",
  },
  Canceled: {
    icon: "close-circle-outline",
    title: "Nothing canceled",
    text: "Declined and canceled bookings appear here.",
  },
};

const STATUS_STYLE = {
  pending: { label: "Awaiting reply", bg: "bg-[#FFF4D6]", text: "text-[#9A6B00]" },
  confirmed: { label: "Confirmed", bg: "bg-[#EAF8D9]", text: "text-[#477C19]" },
  completed: { label: "Completed", bg: "bg-[#EEF2FB]", text: "text-[#4060B2]" },
  canceled: { label: "Canceled", bg: "bg-red-50", text: "text-red-600" },
};

/* What each confirmation sheet says and does */
const ACTIONS = {
  accept: {
    title: "Accept this booking?",
    text: "The visitor will be notified that you've confirmed.",
    button: "Yes, accept",
    nextStatus: "confirmed",
    toast: "Booking accepted",
    danger: false,
  },
  decline: {
    title: "Decline this booking?",
    text: "The visitor will be told you can't take this call.",
    button: "Yes, decline",
    nextStatus: "canceled",
    toast: "Booking declined",
    danger: true,
  },
  cancel: {
    title: "Cancel this booking?",
    text: "You already confirmed this call. The visitor will be notified.",
    button: "Yes, cancel",
    nextStatus: "canceled",
    toast: "Booking canceled",
    danger: true,
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status];
  return (
    <View className={`rounded-full px-3 py-1 ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  );
};

const GuideInfo = ({ booking, size = "md" }) => {
  const imgSize = size === "md" ? "h-16 w-16" : "h-14 w-14";
  return (
    <View className="flex-row items-center">
      <Image
        className={`${imgSize} rounded-2xl`}
        source={require("../../assets/images/profile.jpg")}
      />
      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
          {booking.name}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
          {booking.role}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="location-outline" size={13} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500" numberOfLines={1}>
            {booking.location}
          </Text>
          <Ionicons name="star" size={13} color="#FAC22F" style={{ marginLeft: 10 }} />
          <Text className="ml-1 text-xs text-gray-500">
            {booking.rating} ({booking.reviews.toLocaleString()})
          </Text>
        </View>
      </View>
    </View>
  );
};

const BookingCard = ({ booking, onAction }) => {
  const { status } = booking;
  return (
    <View className="p-4 mx-5 mb-3 bg-white rounded-2xl">
      {/* Date row */}
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
          <Ionicons name="calendar-outline" size={21} color="#578A2B" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-[15px] font-semibold text-[#24334D]">
            {formatDate(booking.date)}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500">{formatTime(booking.date)}</Text>
        </View>
        <StatusPill status={status} />
      </View>

      <View className="h-px my-4 bg-gray-100" />

      <GuideInfo booking={booking} />

      {/* Actions */}
      {status === "pending" && (
        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={() => onAction("decline", booking)}
            activeOpacity={0.7}
            className="items-center justify-center flex-1 py-3 mr-2 bg-gray-100 rounded-xl"
          >
            <Text className="text-[15px] font-semibold text-gray-600">Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onAction("accept", booking)}
            activeOpacity={0.8}
            className="items-center justify-center flex-1 py-3 ml-2 bg-green-500 rounded-xl"
          >
            <Text className="text-[15px] font-semibold text-white">Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "confirmed" && (
        <TouchableOpacity
          onPress={() => onAction("cancel", booking)}
          activeOpacity={0.7}
          className="items-center justify-center py-3 mt-4 border border-red-100 rounded-xl bg-red-50"
        >
          <Text className="text-[15px] font-semibold text-red-600">Cancel booking</Text>
        </TouchableOpacity>
      )}

      {status === "completed" && (
        <TouchableOpacity
          onPress={() => router.push("/callLogs")}
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-3 mt-4 rounded-xl bg-[#EEF2FB]"
        >
          <Ionicons name="call-outline" size={17} color="#4060B2" />
          <Text className="ml-2 text-[15px] font-semibold text-[#4060B2]">
            View in call history
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ConfirmSheet = ({ visible, action, booking, busy, onClose, onConfirm }) => {
  if (!action || !booking) return null;
  const a = ACTIONS[action];
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="justify-end flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl">
          <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
          <Text className="text-lg font-bold text-center text-[#172B4D]">{a.title}</Text>
          <Text className="mt-1 mb-5 text-sm text-center text-gray-500">{a.text}</Text>

          <View className="p-4 rounded-2xl bg-[#F5F8F0]">
            <GuideInfo booking={booking} size="sm" />
            <View className="flex-row items-center mt-3">
              <Ionicons name="calendar-outline" size={15} color="#477C19" />
              <Text className="ml-2 text-sm font-medium text-[#24334D]">
                {formatDate(booking.date)} at {formatTime(booking.date)}
              </Text>
            </View>
          </View>

          <View className="flex-row mt-5">
            <TouchableOpacity
              onPress={onClose}
              disabled={busy}
              activeOpacity={0.7}
              className="items-center justify-center flex-1 py-3.5 mr-2 rounded-xl bg-gray-100"
            >
              <Text className="text-[15px] font-semibold text-gray-600">Keep as is</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={busy}
              activeOpacity={0.8}
              className={`items-center justify-center flex-1 py-3.5 ml-2 rounded-xl ${
                a.danger
                  ? busy
                    ? "bg-red-300"
                    : "bg-red-500"
                  : busy
                    ? "bg-green-300"
                    : "bg-green-500"
              }`}
            >
              <Text className="text-[15px] font-semibold text-white">
                {busy ? "Please wait..." : a.button}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const Index = () => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const [pending, setPending] = useState(null); // { action, id }
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const counts = useMemo(() => {
    const result = {};
    TABS.forEach((t) => {
      result[t] = bookings.filter(TAB_FILTER[t]).length;
    });
    return result;
  }, [bookings]);

  const visible = useMemo(() => {
    const list = bookings.filter(TAB_FILTER[selectedTab]);
    // Upcoming: soonest first. Completed / Canceled: most recent first.
    return list.sort((a, b) =>
      selectedTab === "Upcoming"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }, [bookings, selectedTab]);

  const activeBooking = pending ? bookings.find((b) => b.id === pending.id) : null;

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const openAction = (action, booking) => setPending({ action, id: booking.id });
  const closeAction = () => {
    if (!busy) setPending(null);
  };

  /**
   * Replace with your API call, e.g.
   *   await api.patch(`/bookings/${id}`, { status });
   */
  const updateBookingStatus = async (id, status) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { id, status };
  };

  const confirmAction = async () => {
    if (!pending) return;
    const a = ACTIONS[pending.action];
    setBusy(true);
    try {
      await updateBookingStatus(pending.id, a.nextStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === pending.id ? { ...b, status: a.nextStatus } : b))
      );
      setPending(null);
      showToast(a.toast);
    } catch (e) {
      Alert.alert("Couldn't update booking", "Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  /** Replace with a real fetch, then setBookings(response) */
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRefreshing(false);
  };

  const empty = EMPTY_COPY[selectedTab];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

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
          <Text className="text-2xl font-bold text-[#172B4D]">My Meetings</Text>
          <Text className="mt-0.5 text-sm text-gray-500">Manage your scheduled meetings</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row p-1 mx-5 mb-4 bg-white rounded-2xl">
        {TABS.map((tab) => {
          const active = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                active ? "bg-green-500" : ""
              }`}
            >
              <Text
                className={`text-sm font-semibold ${active ? "text-white" : "text-gray-500"}`}
              >
                {tab}
              </Text>
              {counts[tab] > 0 && (
                <View
                  className={`ml-1.5 min-w-[20px] items-center rounded-full px-1.5 py-0.5 ${
                    active ? "bg-white/30" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${active ? "text-white" : "text-gray-500"}`}
                  >
                    {counts[tab]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />
        }
      >
        {visible.length === 0 ? (
          <View className="items-center px-10 mt-16">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
              <Ionicons name={empty.icon} size={36} color="#578A2B" />
            </View>
            <Text className="mt-5 text-lg font-bold text-[#172B4D]">{empty.title}</Text>
            <Text className="mt-1 text-sm text-center text-gray-500">{empty.text}</Text>
          </View>
        ) : (
          visible.map((b) => <BookingCard key={b.id} booking={b} onAction={openAction} />)
        )}
      </ScrollView>

      {/* Toast */}
      {toast ? (
        <View className="absolute left-5 right-5 bottom-8" pointerEvents="none">
          <View className="flex-row items-center px-4 py-3 rounded-2xl bg-[#172B4D]">
            <Ionicons name="checkmark-circle" size={18} color="#86D36B" />
            <Text className="ml-2 text-sm font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}

      <ConfirmSheet
        visible={pending !== null}
        action={pending?.action}
        booking={activeBooking}
        busy={busy}
        onClose={closeAction}
        onConfirm={confirmAction}
      />
    </SafeAreaView>
  );
};

export default Index;