import ChannelMenuSheet from "../../../components/ChannelMenuSheet";
import ChannelRow from "../../../components/ChannelRow";
import ListEmptyContainer from "../../../components/ListEmptyContainer";
import { useAppContext } from "@/contexts/AppProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { useChatContext } from "stream-chat-expo";
import { useSelector } from "react-redux";
import { ChatGate } from "@/components/ChatWrapper";

const BANNER_GREEN = "#22C55E";

const SOFT_SHADOW = {
  elevation: 6,
  shadowColor: "#172B4D",
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
};

const ChatsListScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const { setChannel } = useAppContext();
  const { user } = useSelector((state) => state.auth);
  const { client } = useChatContext();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0); // bump to re-render when chats change
  const [menuChannel, setMenuChannel] = useState<Channel | null>(null);
  const isLoadingChannels = useRef(false);


  // Keeps only one swiped row open at a time
  const openSwipe = useRef<any>(null);
  const handleSwipeOpen = (ref: any) => {
    if (openSwipe.current && openSwipe.current !== ref) openSwipe.current.close();
    openSwipe.current = ref;
  };


const loadChannels = useCallback(async () => {
  const userId = user?._id ? String(user._id) : "";

  if (!client || !userId || !client.userID) return;

  // Avoid duplicate requests.
  if (isLoadingChannels.current) return;

  isLoadingChannels.current = true;

  try {
    const result = await client.queryChannels(
      {
        members: { $in: [userId] },
        type: "messaging",
      },
      { last_updated: -1 },
      { state: true, watch: true, limit: 30 },
    );

    setChannels(result);
    setError("");
  } catch (e: any) {
    console.error("Failed to load channels:", {
      message: e.message,
      code: e.code,
      status: e.response?.status,
    });

    setError("Couldn't load your chats. Pull down to try again.");
  } finally {
    isLoadingChannels.current = false;
    setLoading(false);
    setRefreshing(false);
  }
}, [client, user?._id]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  /* Keep the list live */
  useEffect(() => {
    if (!client) return;

    const rerender = () => setTick((t) => t + 1);
    const subscriptions = [
      client.on("message.new", rerender),
      client.on("message.updated", rerender),
      client.on("message.deleted", rerender),
      client.on("message.read", rerender),
      client.on("notification.mark_read", rerender),
      client.on("notification.channel_mutes_updated", rerender),
      client.on("member.updated", rerender),
      client.on("user.presence.changed", rerender),
      client.on("notification.message_new", loadChannels),
      client.on("notification.added_to_channel", loadChannels),
      client.on("channel.deleted", loadChannels),
      client.on("channel.hidden", loadChannels),
    ];

    return () => subscriptions.forEach((s) => s.unsubscribe());
  }, [client, loadChannels]);

  const onRefresh = () => {
    setRefreshing(true);
    loadChannels();
  };

  const getChannelSearchText = (channel: Channel) => {
    const channelName = (channel.data?.name as string | undefined) ?? "";

    const otherMember = Object.values(channel.state.members).find(
      (member) => member.user_id !== client.userID,
    );

    const memberName = otherMember?.user?.name ?? "";
    const memberId = otherMember?.user?.id ?? "";

    return `${channelName} ${memberName} ${memberId}`.toLowerCase();
  };

  /* Newest conversation first, then apply the search */
  const visibleChannels = useMemo(() => {
    const time = (c: Channel) =>
      new Date(
        (c.state.last_message_at as any) || (c.data?.created_at as any) || 0,
      ).getTime();

    const pinnedAt = (c: Channel) => {
      const p = c.state.membership?.pinned_at;
      return p ? new Date(p as any).getTime() : 0;
    };

    // Pinned chats first (most recently pinned on top), then newest conversation
    const sorted = [...channels].sort((a, b) => {
      const pa = pinnedAt(a);
      const pb = pinnedAt(b);
      if (!!pa !== !!pb) return pa ? -1 : 1;
      if (pa && pb && pa !== pb) return pb - pa;
      return time(b) - time(a);
    });

    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => getChannelSearchText(c).includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, search, tick]);

  const openChannel = (channel: Channel) => {
    setChannel(channel);
    router.push(`/channel/${channel.id}`);
  };

  /* ------------------------------ actions ------------------------------ */
  const toggleMute = async (channel: Channel) => {
    try {
      if (channel.muteStatus().muted) await channel.unmute();
      else await channel.mute();
      setTick((t) => t + 1); // the mutes-updated event also refreshes the row
    } catch (e) {
      console.error("Mute toggle failed:", e);
      Alert.alert("Couldn't update notifications", "Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-[#F7F9FC]">
      <StatusBar barStyle="light-content" backgroundColor={BANNER_GREEN} />

      {/* Banner */}
      <View
        style={{ paddingTop: insets.top + 12, backgroundColor: BANNER_GREEN }}
        className="px-5 pb-14 overflow-hidden rounded-b-[32px]"
      >
        <View className="absolute w-56 h-56 rounded-full -right-14 -top-20 bg-white/10" />
        <View className="absolute rounded-full w-36 h-36 -left-12 -bottom-8 bg-white/10" />

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[30px] font-extrabold tracking-tight text-white">
              Chats
            </Text>
            <Text className="mt-1 text-sm text-white/85">
              Your rooms and conversations
            </Text>
          </View>

          <View className="items-center justify-center w-12 h-12 rounded-2xl bg-white/20">
            <Ionicons name="chatbubbles" size={24} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* Search bar, floating over the banner edge */}
      <View className="px-5 -mt-7">
        <View
          style={SOFT_SHADOW}
          className={`flex-row items-center bg-white px-4 rounded-2xl border h-[58px] ${
            focused ? "border-green-400" : "border-transparent"
          }`}
        >
          <Ionicons
            name="search"
            size={20}
            color={focused ? "#477C19" : "#9CA3AF"}
          />
          <TextInput
            placeholder="Search rooms"
            className="flex-1 ml-3 text-[15px] text-[#172B4D]"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              hitSlop={10}
              className="items-center justify-center w-6 h-6 bg-gray-100 rounded-full"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close" size={14} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Chat list sheet */}
      <View className="flex-1 mt-5 overflow-hidden bg-white rounded-t-[28px]">
        <View className="flex-row items-center justify-between px-5 pt-5 pb-2">
          <Text className="text-base font-bold text-[#172B4D]">
            {search.trim() ? "Search results" : "Your rooms"}
          </Text>
          {!loading && visibleChannels.length > 0 && (
            <Text className="text-xs font-semibold text-gray-400">
              {visibleChannels.length}
            </Text>
          )}
        </View>

        {!user ? (
          <View className="items-center justify-center flex-1 px-8">
            <View className="items-center justify-center w-20 h-20 rounded-3xl bg-[#F0F7E8]">
              <Ionicons name="lock-closed" size={30} color="#22C55E" />
            </View>
            <Text className="mt-4 text-base font-bold text-[#172B4D]">
              You're not logged in
            </Text>
            <Text className="mt-1 text-sm text-center text-gray-500">
              Please log in to view your chats.
            </Text>
          </View>
        ) : loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <FlatList
            data={visibleChannels}
            extraData={tick}
            keyExtractor={(item) => item.cid}
            renderItem={({ item }) => (
              <ChannelRow
                channel={item}
                onSelect={openChannel}
                onToggleMute={toggleMute}
                onMore={setMenuChannel}
                onSwipeOpen={handleSwipeOpen}
              />
            )}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 110 + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              error ? (
                <View className="px-5 py-3 mx-5 mb-2 border border-red-100 rounded-2xl bg-red-50">
                  <Text className="text-sm text-red-600">{error}</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={<ListEmptyContainer />}
          />
        )}
      </View>

      {/* "More options" sheet */}
      <ChannelMenuSheet
        channel={menuChannel}
        onClose={() => setMenuChannel(null)}
        onChanged={() => setTick((t) => t + 1)}
        onRemoved={(c) => setChannels((prev) => prev.filter((x) => x.cid !== c.cid))}
      />
    </View>
  );
};



export default function Index() {
  return (
    <ChatGate>
      <ChatsListScreen />
    </ChatGate>
  );
}