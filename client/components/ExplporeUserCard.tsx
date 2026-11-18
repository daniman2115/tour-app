import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { UserResponse } from "stream-chat";

type ExploreUserCardProps = {
  item: UserResponse;
  creating: string | null;
  onStartChat: (targetId: string) => void;
};

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

// "Active now", "Last seen 5m ago", "Last seen 2h ago", ...
const getStatusText = (item: UserResponse) => {
  if (item.online) return "Active now";

  const lastActive = item.last_active ? new Date(item.last_active).getTime() : 0;
  if (!lastActive) return "Offline";

  const minutes = Math.max(1, Math.round((Date.now() - lastActive) / 60000));
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Last seen ${days}d ago`;
  return "Last seen a while ago";
};

/* Full-width list row (messaging-app style). The hairline divider starts at
   the text, not the screen edge. */
const ExploreUserCard = ({
  item,
  creating,
  onStartChat,
}: ExploreUserCardProps) => {
  const isCreating = creating === item.id;
  const displayName = item.name || item.id;

  return (
    <Pressable
      onPress={() => onStartChat(item.id)}
      disabled={creating !== null}
      className={`flex-row items-center pl-5 active:bg-[#F7FBF0] ${
        creating !== null && !isCreating ? "opacity-50" : ""
      }`}
      accessibilityLabel={`Start a chat with ${displayName}`}
    >
      {/* Avatar */}
      <View className="relative">
        {item.image ? (
          <Image
            source={item.image}
            style={{ width: 52, height: 52, borderRadius: 26 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="items-center justify-center w-[52px] h-[52px] rounded-full bg-[#EAF8D9]">
            {item.name ? (
              <Text className="text-lg font-bold text-[#477C19]">
                {getInitials(item.name)}
              </Text>
            ) : (
              <Ionicons name="person" size={22} color="#477C19" />
            )}
          </View>
        )}

        {/* Online status dot */}
        <View
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            item.online ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </View>

      {/* Info + action, with the inset divider underneath */}
      <View className="flex-row items-center flex-1 py-3.5 pr-5 ml-3.5 border-b border-gray-100">
        <View className="flex-1 pr-3">
          <Text
            className="text-base font-semibold text-[#172B4D]"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text
            className={`mt-0.5 text-[13px] ${
              item.online ? "font-medium text-[#477C19]" : "text-gray-400"
            }`}
            numberOfLines={1}
          >
            {getStatusText(item)}
          </Text>
        </View>

        {isCreating ? (
          <View className="items-center justify-center px-5 py-2 rounded-full bg-[#EAF8D9]">
            <ActivityIndicator size="small" color="#22C55E" />
          </View>
        ) : (
          <View className="flex-row items-center px-3.5 py-2 rounded-full bg-[#EAF8D9]">
            <Ionicons name="chatbubble-ellipses-outline" size={15} color="#477C19" />
            <Text className="ml-1.5 text-xs font-semibold text-[#477C19]">Message</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ExploreUserCard;