import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ------------------------------------------------------------------ */
/* Notification types: icon, colors, and where tapping one goes        */
/* ------------------------------------------------------------------ */
const TYPES = {
  request: { icon: "calendar-outline", color: "#477C19", bg: "bg-[#EAF8D9]", route: "/myBookings" },
  confirmed: { icon: "checkmark-circle-outline", color: "#477C19", bg: "bg-[#EAF8D9]", route: "/myBookings" },
  cancelled: { icon: "close-circle-outline", color: "#DC2626", bg: "bg-red-50", route: "/myBookings" },
  rescheduled: { icon: "time-outline", color: "#4060B2", bg: "bg-[#EEF2FB]", route: "/myBookings" },
  missed: { icon: "call-outline", color: "#9A6B00", bg: "bg-[#FFF4D6]", route: "/callLogs" },
};

/* ------------------------------------------------------------------ */
/* Sample data: replace with your API response                         */
/* ------------------------------------------------------------------ */
const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "request",
    title: "Booking request",
    body: "Kate Norman wants to book a video tour on Oct 24 at 10:00 AM.",
    date: minutesAgo(45),
    read: false,
  },
  {
    id: "n2",
    type: "missed",
    title: "Missed call",
    body: "You missed a call from Sara Bekele.",
    date: minutesAgo(150),
    read: false,
  },
  {
    id: "n3",
    type: "rescheduled",
    title: "Schedule changed",
    body: "Daniel Mekonnen moved your tour to Oct 27 at 3:30 PM.",
    date: minutesAgo(480),
    read: true,
  },
  {
    id: "n4",
    type: "cancelled",
    title: "Booking canceled",
    body: "Omar Haddad canceled the tour planned for Oct 20.",
    date: minutesAgo(60 * 26),
    read: true,
  },
  {
    id: "n5",
    type: "confirmed",
    title: "Booking confirmed",
    body: "Your tour with Liam Carter on Oct 22 is confirmed.",
    date: minutesAgo(60 * 29),
    read: true,
  },
  {
    id: "n6",
    type: "confirmed",
    title: "Booking confirmed",
    body: "Your tour with Hana Tesfaye on Oct 18 is confirmed.",
    date: minutesAgo(60 * 24 * 4),
    read: true,
  },
];

const TABS = ["All", "Unread"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const dayLabel = (iso) => {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

const timeAgo = (iso) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const groupByDay = (list) => {
  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = [];
  sorted.forEach((n) => {
    const label = dayLabel(n.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  });
  return groups;
};

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */
const NotificationRow = ({ item, onPress, onLongPress }) => {
  const t = TYPES[item.type] || TYPES.request;
  return (
    <View className="-mx-4">
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        activeOpacity={0.7}
        className={`flex-row items-start px-4 py-4 ${item.read ? "" : "bg-[#F7FBF0]"}`}
      >
        <View className={`h-11 w-11 items-center justify-center rounded-xl ${t.bg}`}>
          <Ionicons name={t.icon} size={21} color={t.color} />
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text
              className={`flex-1 text-[15px] text-[#24334D] ${
                item.read ? "font-semibold" : "font-bold"
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="ml-2 text-xs text-gray-400">{timeAgo(item.date)}</Text>
          </View>
          <Text className="mt-1 text-xs leading-5 text-gray-500">{item.body}</Text>
        </View>

        {!item.read && <View className="w-2.5 h-2.5 mt-1.5 ml-2 bg-green-500 rounded-full" />}
      </TouchableOpacity>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
const Index = () => {
  const [items, setItems] = useState(INITIAL_NOTIFICATIONS);
  const [tab, setTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // { message, undo? }
  const toastTimer = useRef(null);
  const lastRemoved = useRef(null);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const groups = useMemo(
    () => groupByDay(tab === "Unread" ? items.filter((n) => !n.read) : items),
    [items, tab]
  );

  const showToast = (message, undo) => {
    setToast({ message, undo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  /* ------------------------------ actions ------------------------------ */
  const markRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    // TODO: tell your API this notification was read
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
    // TODO: tell your API
  };

  const open = (item) => {
    if (!item.read) markRead(item.id);
    const route = (TYPES[item.type] || {}).route;
    if (route) router.push(route);
  };

  const remove = (item) => {
    const index = items.findIndex((n) => n.id === item.id);
    lastRemoved.current = { item, index };
    setItems((prev) => prev.filter((n) => n.id !== item.id));
    showToast("Notification deleted", undo);
    // TODO: send the delete to your API once the undo window passes
  };

  const undo = () => {
    const removed = lastRemoved.current;
    if (!removed) return;
    setItems((prev) => {
      const next = [...prev];
      next.splice(Math.min(removed.index, next.length), 0, removed.item);
      return next;
    });
    lastRemoved.current = null;
    setToast(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700)); // fetch notifications here
    setRefreshing(false);
  };

  const empty =
    tab === "Unread"
      ? { icon: "checkmark-done-outline", title: "You're all caught up", text: "No unread notifications." }
      : { icon: "notifications-outline", title: "No notifications yet", text: "Updates about your bookings and calls will appear here." };

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
          <Text className="text-2xl font-bold text-[#172B4D]">Notifications</Text>
          <Text className="mt-0.5 text-sm text-gray-500">Stay updated with activity</Text>
        </View>
        {unreadCount > 0 && (
          <View className="px-3 py-1 rounded-full bg-[#EAF8D9]">
            <Text className="text-xs font-semibold text-[#477C19]">{unreadCount} new</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row p-1 mx-5 mb-3 bg-white rounded-2xl">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                active ? "bg-green-500" : ""
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? "text-white" : "text-gray-500"}`}>
                {t}
              </Text>
              {t === "Unread" && unreadCount > 0 && (
                <View
                  className={`ml-1.5 min-w-[20px] items-center rounded-full px-1.5 py-0.5 ${
                    active ? "bg-white/30" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${active ? "text-white" : "text-gray-500"}`}
                  >
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mark all as read */}
      <View className="flex-row justify-end px-5 mb-1">
        <TouchableOpacity
          onPress={markAllRead}
          disabled={unreadCount === 0}
          activeOpacity={0.7}
          className="flex-row items-center py-1"
        >
          <Ionicons
            name="checkmark-done"
            size={16}
            color={unreadCount === 0 ? "#B8C0CC" : "#4060B2"}
          />
          <Text
            className={`ml-1 text-sm font-semibold ${
              unreadCount === 0 ? "text-gray-300" : "text-[#4060B2]"
            }`}
          >
            Mark all as read
          </Text>
        </TouchableOpacity>
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
        {groups.length === 0 ? (
          <View className="items-center px-10 mt-14">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
              <Ionicons name={empty.icon} size={36} color="#578A2B" />
            </View>
            <Text className="mt-5 text-lg font-bold text-[#172B4D]">{empty.title}</Text>
            <Text className="mt-1 text-sm text-center text-gray-500">{empty.text}</Text>
          </View>
        ) : (
          <>
            {groups.map((group) => (
              <View key={group.label} className="mx-5 mt-4">
                <Text className="mb-2 text-base font-bold text-[#172B4D]">{group.label}</Text>
                <View className="px-4 overflow-hidden bg-white rounded-2xl">
                  {group.items.map((item, i) => (
                    <View key={item.id}>
                      <NotificationRow
                        item={item}
                        onPress={() => open(item)}
                        onLongPress={() => remove(item)}
                      />
                      {i !== group.items.length - 1 && <View className="h-px bg-gray-100" />}
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <Text className="mt-6 text-xs text-center text-gray-400">
              Press and hold a notification to delete it
            </Text>
          </>
        )}
      </ScrollView>

      {/* Toast */}
      {toast && (
        <View className="absolute left-5 right-5 bottom-8">
          <View className="flex-row items-center px-4 py-3 rounded-2xl bg-[#172B4D]">
            <Ionicons name="checkmark-circle" size={18} color="#86D36B" />
            <Text className="flex-1 ml-2 text-sm font-semibold text-white">{toast.message}</Text>
            {toast.undo && (
              <TouchableOpacity onPress={toast.undo} hitSlop={8}>
                <Text className="ml-3 text-sm font-bold text-[#86D36B]">Undo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Index;