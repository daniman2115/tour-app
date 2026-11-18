import EmptyState from "../../../components/EmptyState";
import { useAppContext } from "@/contexts/AppProvider";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Channel,
  MessageComposer,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { useSelector } from "react-redux";
import { ChatGate } from "@/components/ChatWrapper";

const HEADER_HEIGHT = 57;

const ChannelContent = () => {
  const { channel, setThread } = useAppContext();
  const { client } = useChatContext();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  let displayName = "";
  let avatarUrl = "";
  let isOnline = false;

  if (channel) {
    const members = Object.values(channel.state.members);
    const otherMember = members.find(
      (member) => member.user_id !== client.userID,
    );

    console.log({otherMember});

    displayName = otherMember?.user?.name || "";
    avatarUrl = otherMember?.user?.image || "";
    isOnline = !!otherMember?.user?.online;
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header: always rendered, never swapped out */}
      <View
        className="flex-row items-center justify-between px-3 bg-white border-b border-emerald-100"
        style={{ height: HEADER_HEIGHT }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="items-center justify-center w-10 h-10 rounded-full bg-emerald-50"
        >
          <Ionicons name="arrow-back" size={22} color="#059669" />
        </TouchableOpacity>

        {/* Avatar + name + status */}
        <View className="flex-row items-center flex-1 mx-3">
          <View className="relative mr-3">
            <View className="h-10 w-10 rounded-full bg-emerald-400 p-0.5">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%", borderRadius: 999 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="items-center justify-center flex-1 border-2 border-white rounded-full bg-emerald-100">
                  {displayName ? (
                    <Text className="text-base font-bold text-emerald-700">
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  ) : (
                    <Ionicons name="person" size={18} color="#059669" />
                  )}
                </View>
              )}
            </View>

            <View
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-slate-300"
              }`}
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-base font-bold text-slate-900"
              numberOfLines={1}
            >
              {displayName || "Room"}
            </Text>
            <Text
              className={`text-xs font-medium ${
                isOnline ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Video call button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!channel}
          className="items-center justify-center w-10 h-10 rounded-full shadow-md bg-emerald-500"
          onPress={() => {
            if (!channel) return;
            router.push({
              pathname: "/call/[callId]",
              params: { callId: channel.id },
            });
          }}
        >
          <Ionicons name="videocam" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Chat area: only this part changes when channel arrives */}
      <View className="flex-1 bg-emerald-50/60">
        {!channel ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-3 text-sm text-slate-500">
              Loading study room...
            </Text>
          </View>
        ) : (
          <Channel
            channel={channel}
            keyboardVerticalOffset={insets.top + HEADER_HEIGHT}
            audioRecordingEnabled
            EmptyStateIndicator={() => (
              <EmptyState
                icon="book-outline"
                title="No messages yet"
                subtitle="Start a conversation!"
              />
            )}
          >
            <MessageList
              onThreadSelect={(thread) => {
                setThread(thread);
                router.push(`/channel/${channel.cid}/thread/${thread?.cid}`);
              }}
            />

            {/* Composer */}
           <View
      className="px-2 bg-white"
      style={{
        paddingTop: 2,
        paddingBottom: 2,
      }}
>
  <MessageComposer />
</View>
          </Channel>
        )}
      </View>
    </View>
  );
};

const ChatScreen = () => {
  const { user } = useSelector((state: any) => state.auth);
  const insets = useSafeAreaInsets();

  if (!user) {
    return (
      <View
        className="items-center justify-center flex-1 px-8 bg-emerald-50/60"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="items-center justify-center w-20 h-20 bg-white border shadow-md rounded-3xl border-emerald-100">
          <Ionicons name="lock-closed" size={30} color="#10b981" />
        </View>
        <Text className="mt-4 text-base font-semibold text-slate-800">
          You're not logged in
        </Text>
        <Text className="mt-1 text-sm text-center text-slate-500">
          Please log in to view your chats.
        </Text>
      </View>
    );
  }

  return <ChannelContent />;
};



export default function Index() {
  return (
    <ChatGate>
      <ChatScreen />
    </ChatGate>
  );
}