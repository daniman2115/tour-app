// components/ChannelRow.tsx
// A chat-list row that reads everything it needs straight from the Stream
// channel. Swipe left to reveal "more options" and mute/unmute.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import type { Channel } from "stream-chat";
import { useChatContext } from "stream-chat-expo";

type Props = {
  channel: Channel;
  onSelect: (channel: Channel) => void;
  onToggleMute: (channel: Channel) => void;
  onMore: (channel: Channel) => void;
  onSwipeOpen?: (ref: any) => void;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ACTION_WIDTH = 68;

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Today -> "3:45 PM", yesterday -> "Yesterday", this week -> "Mon", older -> "Oct 12"
const formatWhen = (value?: string | Date | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";

  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) {
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${suffix}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return WEEKDAYS[d.getDay()];
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

/* Shared with the screen so the menu sheet shows the same name */
export const getChannelName = (channel: Channel, myUserId?: string) => {
  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user_id !== myUserId,
  );
  const otherUser = otherMember?.user;
  return (
    (channel.data?.name as string | undefined) ||
    otherUser?.name ||
    otherUser?.id ||
    "Chat"
  );
};

const ChannelRow = ({ channel, onSelect, onToggleMute, onMore, onSwipeOpen }: Props) => {
  const { client } = useChatContext();
  const swipeRef = useRef<any>(null);

  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user_id !== client.userID,
  );
  const otherUser = otherMember?.user;

  const name = getChannelName(channel, client.userID);
  const image = otherUser?.image as string | undefined;
  const online = !!otherUser?.online;

  const last = channel.lastMessage();
  let preview = "No messages yet";
  if (last) {
    if (last.type === "deleted") preview = "Message deleted";
    else if (last.text) preview = last.text;
    else if (last.attachments?.length) preview = "Sent an attachment";
    if (last.user?.id === client.userID && last.type !== "deleted") {
      preview = `You: ${preview}`;
    }
  }

  const unread = channel.countUnread();
  const hasUnread = unread > 0;
  const muted = channel.muteStatus().muted;
  const pinned = !!channel.state.membership?.pinned_at;

  const closeThen = (fn: (c: Channel) => void) => () => {
    swipeRef.current?.close();
    fn(channel);
  };

  /* Revealed when swiping left */
  const renderRightActions = () => (
    <View className="flex-row">
      <Pressable
        onPress={closeThen(onMore)}
        style={{ width: ACTION_WIDTH }}
        className="items-center justify-center bg-[#EEF2FB] active:bg-[#DFE6F7]"
        accessibilityLabel="More options"
      >
        <Ionicons name="ellipsis-horizontal" size={22} color="#4060B2" />
        <Text className="mt-1 text-[11px] font-semibold text-[#4060B2]">More</Text>
      </Pressable>

      <Pressable
        onPress={closeThen(onToggleMute)}
        style={{ width: ACTION_WIDTH }}
        className="items-center justify-center bg-[#FFF4D6] active:bg-[#FCEBB8]"
        accessibilityLabel={muted ? "Unmute" : "Mute"}
      >
        <Ionicons
          name={muted ? "notifications-outline" : "notifications-off-outline"}
          size={22}
          color="#9A6B00"
        />
        <Text className="mt-1 text-[11px] font-semibold text-[#9A6B00]">
          {muted ? "Unmute" : "Mute"}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => onSwipeOpen?.(swipeRef.current)}
    >
      <Pressable
        onPress={() => onSelect(channel)}
        className="flex-row items-center pl-5 bg-white active:bg-[#F7FBF0]"
        accessibilityLabel={`Open chat with ${name}`}
      >
        {/* Avatar */}
        <View className="relative">
          {image ? (
            <Image
              source={image}
              style={{ width: 52, height: 52, borderRadius: 26 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="items-center justify-center w-[52px] h-[52px] rounded-full bg-[#EAF8D9]">
              <Text className="text-lg font-bold text-[#477C19]">{getInitials(name)}</Text>
            </View>
          )}
          <View
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              online ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </View>

        {/* Text, time and unread badge, with the inset divider underneath */}
        <View className="flex-1 py-3.5 pr-5 ml-3.5 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text
              className={`flex-1 pr-3 text-base text-[#172B4D] ${
                hasUnread ? "font-bold" : "font-semibold"
              }`}
              numberOfLines={1}
            >
              {name}
            </Text>
            {pinned ? (
              <Ionicons name="pin" size={13} color="#9CA3AF" style={{ marginRight: 6 }} />
            ) : null}
            <Text
              className={`text-xs ${hasUnread ? "font-semibold text-[#477C19]" : "text-gray-400"}`}
            >
              {formatWhen(last?.created_at as any)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-1">
            <Text
              className={`flex-1 pr-3 text-[13px] ${
                hasUnread ? "font-medium text-[#24334D]" : "text-gray-500"
              }`}
              numberOfLines={1}
            >
              {preview}
            </Text>

            {muted ? (
              <Ionicons name="notifications-off-outline" size={15} color="#9CA3AF" />
            ) : null}

            {hasUnread ? (
              <View className="items-center justify-center ml-2 min-w-[20px] h-5 px-1.5 bg-green-500 rounded-full">
                <Text className="text-[11px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

export default ChannelRow;