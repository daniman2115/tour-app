import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
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
/* type: "outgoing" | "incoming" | "missed"                            */
/* duration is in seconds; an outgoing call with 0 = not answered      */
/* ------------------------------------------------------------------ */
const at = (daysAgo, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const INITIAL_CALLS = [
  { id: "c1", name: "Kate Norman", phone: "+44 7700 900123", type: "outgoing", duration: 60, date: at(0, 12, 30), followUp: true, recording: true },
  { id: "c2", name: "Daniel Mekonnen", phone: "+251 91 123 4567", type: "incoming", duration: 840, date: at(0, 9, 5), followUp: false, recording: true },
  { id: "c3", name: "Sara Bekele", phone: "+251 92 765 4321", type: "missed", duration: 0, date: at(1, 18, 45), followUp: false, recording: false },
  { id: "c4", name: "Hardik Pandya", phone: "+91 76225 6445", type: "outgoing", duration: 0, date: at(1, 12, 30), followUp: false, recording: false },
  { id: "c5", name: "Liam Carter", phone: "+1 416 555 0182", type: "outgoing", duration: 1325, date: at(1, 10, 0), followUp: true, recording: true },
  { id: "c6", name: "Hana Tesfaye", phone: "+251 93 222 8899", type: "incoming", duration: 310, date: at(3, 16, 20), followUp: false, recording: false },
  { id: "c7", name: "Omar Haddad", phone: "+20 100 555 0147", type: "missed", duration: 0, date: at(4, 8, 15), followUp: false, recording: false },
  { id: "c8", name: "Kate Norman", phone: "+44 7700 900123", type: "outgoing", duration: 95, date: at(6, 14, 10), followUp: false, recording: true },
];

const TABS = ["Call Logs", "Recordings"];
const FILTERS = ["All", "Incoming", "Outgoing", "Missed"];
const DIAL_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

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

const formatTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} sec` : `${m} min`;
};

const clock = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const isUnanswered = (c) => c.type === "outgoing" && c.duration === 0;
const isMissedLike = (c) => c.type === "missed" || isUnanswered(c);

const describe = (c) => {
  if (c.type === "missed") return "Missed call";
  if (isUnanswered(c)) return "Outgoing call · Not answered";
  const label = c.type === "incoming" ? "Incoming call" : "Outgoing call";
  return `${label} · ${formatDuration(c.duration)}`;
};

const visual = (c) => {
  if (c.type === "missed") return { icon: "call-missed", color: "#DC2626", bg: "bg-red-50" };
  if (isUnanswered(c)) return { icon: "call-made", color: "#DC2626", bg: "bg-red-50" };
  if (c.type === "incoming") return { icon: "call-received", color: "#4060B2", bg: "bg-[#EEF2FB]" };
  return { icon: "call-made", color: "#477C19", bg: "bg-[#EAF8D9]" };
};

const FILTER_FN = {
  All: () => true,
  Incoming: (c) => c.type === "incoming",
  Outgoing: (c) => c.type === "outgoing" && !isUnanswered(c),
  Missed: isMissedLike,
};

const groupByDay = (list) => {
  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  const groups = [];
  sorted.forEach((call) => {
    const label = dayLabel(call.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(call);
    else groups.push({ label, items: [call] });
  });
  return groups;
};

/**
 * Replace with your real call flow (e.g. router.push to your video call screen).
 * Opening the phone dialer is only a stand-in.
 */
const startCall = async (number) => {
  const clean = number.replace(/[^\d+*#]/g, "");
  try {
    await Linking.openURL(`tel:${clean}`);
  } catch (e) {
    Alert.alert("Couldn't start the call", "Try again in a moment.");
  }
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
const ActionButton = ({ icon, label, onPress, tone = "neutral" }) => {
  const tones = {
    green: { box: "bg-green-500", text: "text-white", color: "#FFFFFF" },
    amber: { box: "bg-[#FFF4D6]", text: "text-[#9A6B00]", color: "#9A6B00" },
    neutral: { box: "bg-gray-100", text: "text-gray-600", color: "#4B5563" },
    red: { box: "bg-red-50", text: "text-red-600", color: "#DC2626" },
  }[tone];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-1 flex-row items-center justify-center py-2.5 mx-1 rounded-xl ${tones.box}`}
    >
      <Ionicons name={icon} size={16} color={tones.color} />
      <Text className={`ml-1.5 text-[13px] font-semibold ${tones.text}`}>{label}</Text>
    </TouchableOpacity>
  );
};

const CallRow = ({ call, expanded, isLast, onToggle, onCallBack, onToggleFollowUp, onDelete }) => {
  const v = visual(call);
  return (
    <View className={isLast ? "" : "border-b border-gray-100"}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        className="flex-row items-center py-4"
      >
        <View className={`h-11 w-11 items-center justify-center rounded-xl ${v.bg}`}>
          <MaterialIcons name={v.icon} size={21} color={v.color} />
        </View>

        <View className="flex-1 ml-3">
          <Text
            className={`text-[15px] font-semibold ${
              isMissedLike(call) ? "text-red-600" : "text-[#24334D]"
            }`}
            numberOfLines={1}
          >
            {call.name}
          </Text>
          <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
            {describe(call)}
          </Text>
        </View>

        <View className="items-end ml-2">
          <Text className="text-xs text-gray-500">{formatTime(call.date)}</Text>
          {call.followUp && (
            <View className="flex-row items-center mt-1 px-2 py-0.5 rounded-full bg-[#FFF4D6]">
              <Ionicons name="flag" size={10} color="#9A6B00" />
              <Text className="ml-1 text-[10px] font-semibold text-[#9A6B00]">Follow-up</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="pb-4">
          <View className="flex-row items-center px-3 py-2.5 mb-3 rounded-xl bg-[#F5F8F0]">
            <Ionicons name="call-outline" size={15} color="#477C19" />
            <Text className="ml-2 text-sm text-[#24334D]">{call.phone}</Text>
          </View>
          <View className="flex-row -mx-1">
            <ActionButton icon="call" label="Call back" tone="green" onPress={onCallBack} />
            <ActionButton
              icon={call.followUp ? "flag" : "flag-outline"}
              label={call.followUp ? "Clear" : "Follow-up"}
              tone="amber"
              onPress={onToggleFollowUp}
            />
            <ActionButton icon="trash-outline" label="Delete" tone="red" onPress={onDelete} />
          </View>
        </View>
      )}
    </View>
  );
};

const RecordingRow = ({ call, playing, isLast, onPlay, onDelete }) => (
  <View className={`flex-row items-center py-4 ${isLast ? "" : "border-b border-gray-100"}`}>
    <TouchableOpacity
      onPress={onPlay}
      activeOpacity={0.8}
      className={`h-11 w-11 items-center justify-center rounded-xl ${
        playing ? "bg-green-500" : "bg-[#F0F7E8]"
      }`}
      accessibilityLabel={playing ? "Pause recording" : "Play recording"}
    >
      <Ionicons name={playing ? "pause" : "play"} size={20} color={playing ? "#FFFFFF" : "#578A2B"} />
    </TouchableOpacity>

    <View className="flex-1 ml-3">
      <Text className="text-[15px] font-semibold text-[#24334D]" numberOfLines={1}>
        {call.name}
      </Text>
      <Text className="mt-1 text-xs text-gray-500">
        {dayLabel(call.date)}, {formatTime(call.date)} · {clock(call.duration)}
      </Text>
    </View>

    <TouchableOpacity
      onPress={onDelete}
      hitSlop={10}
      className="items-center justify-center ml-2 rounded-full w-9 h-9 bg-red-50"
      accessibilityLabel="Delete recording"
    >
      <Ionicons name="trash-outline" size={17} color="#DC2626" />
    </TouchableOpacity>
  </View>
);

const Dialpad = ({ visible, onClose, onCall }) => {
  const [number, setNumber] = useState("");

  const close = () => {
    setNumber("");
    onClose();
  };

  const press = (k) => setNumber((n) => (n.length < 18 ? n + k : n));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View className="justify-end flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={close} />
        <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl">
          <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />

          <View className="flex-row items-center justify-center h-12">
            <Text className="text-3xl font-semibold text-[#172B4D]" numberOfLines={1}>
              {number || " "}
            </Text>
          </View>
          <Text className="mb-3 text-xs text-center text-gray-400">
            Enter a number to call
          </Text>

          <View className="flex-row flex-wrap justify-center">
            {DIAL_KEYS.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => press(k)}
                onLongPress={k === "0" ? () => press("+") : undefined}
                activeOpacity={0.6}
                className="items-center justify-center m-1.5 h-16 w-[28%] rounded-2xl bg-[#F7F9FC]"
              >
                <Text className="text-2xl font-semibold text-[#172B4D]">{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-center mt-3">
            <View className="w-16 mr-6" />
            <TouchableOpacity
              onPress={() => {
                if (!number) return;
                onCall(number);
                close();
              }}
              disabled={!number}
              activeOpacity={0.8}
              className={`items-center justify-center w-16 h-16 rounded-full ${
                number ? "bg-green-500" : "bg-green-200"
              }`}
              accessibilityLabel="Call"
            >
              <Ionicons name="call" size={26} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setNumber((n) => n.slice(0, -1))}
              onLongPress={() => setNumber("")}
              disabled={!number}
              className="items-center justify-center w-16 h-16 ml-6"
              accessibilityLabel="Delete digit"
            >
              {number ? <Ionicons name="backspace-outline" size={26} color="#6B7280" /> : null}
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
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [tab, setTab] = useState("Call Logs");
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [dialOpen, setDialOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // { message, undo? }
  const toastTimer = useRef(null);
  const lastRemoved = useRef(null);

  const showToast = (message, undo) => {
    setToast({ message, undo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const filterCounts = useMemo(() => {
    const result = {};
    FILTERS.forEach((f) => {
      result[f] = calls.filter(FILTER_FN[f]).length;
    });
    return result;
  }, [calls]);

  const logGroups = useMemo(
    () => groupByDay(calls.filter(FILTER_FN[filter])),
    [calls, filter]
  );

  const recordingGroups = useMemo(
    () => groupByDay(calls.filter((c) => c.recording)),
    [calls]
  );

  /* ------------------------------ actions ------------------------------ */
  const toggleFollowUp = (id) => {
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, followUp: !c.followUp } : c)));
    // TODO: persist with your API
  };

  const deleteCall = (call) => {
    const index = calls.findIndex((c) => c.id === call.id);
    lastRemoved.current = { call, index };
    setCalls((prev) => prev.filter((c) => c.id !== call.id));
    setExpandedId(null);
    if (playingId === call.id) setPlayingId(null);
    showToast("Call deleted", undoDelete);
    // TODO: send the delete to your API once the undo window passes
  };

  const undoDelete = () => {
    const removed = lastRemoved.current;
    if (!removed) return;
    setCalls((prev) => {
      const next = [...prev];
      next.splice(Math.min(removed.index, next.length), 0, removed.call);
      return next;
    });
    lastRemoved.current = null;
    setToast(null);
  };

  const deleteRecording = (call) => {
    Alert.alert("Delete this recording?", `Your recording with ${call.name} will be removed. This can't be undone.`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCalls((prev) => prev.map((c) => (c.id === call.id ? { ...c, recording: false } : c)));
          if (playingId === call.id) setPlayingId(null);
          showToast("Recording deleted");
        },
      },
    ]);
  };

  /** Hook up expo-audio / expo-av here. For now this only toggles the button state. */
  const togglePlay = (id) => setPlayingId((cur) => (cur === id ? null : id));

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 700)); // fetch your calls here
    setRefreshing(false);
  };

  const dialCall = (number) => {
    startCall(number);
  };

  /* ------------------------------ render ------------------------------- */
  const groups = tab === "Call Logs" ? logGroups : recordingGroups;
  const isEmpty = groups.length === 0;

  const emptyCopy =
    tab === "Recordings"
      ? { icon: "mic-outline", title: "No recordings yet", text: "Recorded calls will show up here." }
      : filter === "All"
        ? { icon: "call-outline", title: "No calls yet", text: "Your call history will appear here." }
        : { icon: "funnel-outline", title: `No ${filter.toLowerCase()} calls`, text: "Try a different filter." };

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
          <Text className="text-2xl font-bold text-[#172B4D]">Call History</Text>
          <Text className="mt-0.5 text-sm text-gray-500">View your previous calls</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row p-1 mx-5 mb-3 bg-white rounded-2xl">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setTab(t);
                setExpandedId(null);
              }}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center py-2.5 rounded-xl ${
                active ? "bg-green-500" : ""
              }`}
            >
              <Text className={`text-sm font-semibold ${active ? "text-white" : "text-gray-500"}`}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filters (call logs only) */}
      {tab === "Call Logs" && (
        <View className="mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => {
                    setFilter(f);
                    setExpandedId(null);
                  }}
                  activeOpacity={0.75}
                  className={`flex-row items-center px-4 py-2 mr-2 rounded-full border ${
                    active ? "bg-[#EAF8D9] border-green-400" : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${active ? "text-[#477C19]" : "text-gray-600"}`}
                  >
                    {f}
                  </Text>
                  <Text
                    className={`ml-1.5 text-xs font-semibold ${
                      active ? "text-[#477C19]" : "text-gray-400"
                    }`}
                  >
                    {filterCounts[f]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />
        }
      >
        {isEmpty ? (
          <View className="items-center px-10 mt-14">
            <View className="items-center justify-center w-20 h-20 rounded-full bg-[#F0F7E8]">
              <Ionicons name={emptyCopy.icon} size={36} color="#578A2B" />
            </View>
            <Text className="mt-5 text-lg font-bold text-[#172B4D]">{emptyCopy.title}</Text>
            <Text className="mt-1 text-sm text-center text-gray-500">{emptyCopy.text}</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label} className="mx-5 mt-4">
              <Text className="mb-2 text-base font-bold text-[#172B4D]">{group.label}</Text>
              <View className="px-4 bg-white rounded-2xl">
                {group.items.map((call, i) =>
                  tab === "Call Logs" ? (
                    <CallRow
                      key={call.id}
                      call={call}
                      isLast={i === group.items.length - 1}
                      expanded={expandedId === call.id}
                      onToggle={() => setExpandedId((cur) => (cur === call.id ? null : call.id))}
                      onCallBack={() => startCall(call.phone)}
                      onToggleFollowUp={() => toggleFollowUp(call.id)}
                      onDelete={() => deleteCall(call)}
                    />
                  ) : (
                    <RecordingRow
                      key={call.id}
                      call={call}
                      isLast={i === group.items.length - 1}
                      playing={playingId === call.id}
                      onPlay={() => togglePlay(call.id)}
                      onDelete={() => deleteRecording(call)}
                    />
                  )
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Dialpad button */}
      <TouchableOpacity
        onPress={() => setDialOpen(true)}
        activeOpacity={0.85}
        className="absolute items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg bottom-8 right-5"
        accessibilityLabel="Open dialpad"
      >
        <MaterialCommunityIcons name="dialpad" size={28} color="white" />
      </TouchableOpacity>

      {/* Toast */}
      {toast && (
        <View className="absolute left-5 right-24 bottom-10">
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

      <Dialpad visible={dialOpen} onClose={() => setDialOpen(false)} onCall={dialCall} />
    </SafeAreaView>
  );
};

export default Index;