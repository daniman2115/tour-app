import { ChatGate } from "@/components/ChatWrapper";
import ExploreUserCard from "../../../components/ExplporeUserCard";
import ListEmptyComponent from "@/components/ListEmptyComponent";
import { useAppContext } from "@/contexts/AppProvider";
import useStartChat from "@/hooks/useStartChat";
import { useStreamUsers } from "@/hooks/useStreamUsers";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-expo";

const BANNER_GREEN = "#22C55E";

const SOFT_SHADOW = {
  elevation: 6,
  shadowColor: "#172B4D",
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
};

const ExploreScreen = () => {
  const { setChannel } = useAppContext();
  const { user } = useSelector((state) => state.auth);
  const { client } = useChatContext();
  const insets = useSafeAreaInsets();
  const userId = user?._id ?? "";

  const [creating, setCreating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const { loading, users, refreshing, refreshUsers } = useStreamUsers(
    client,
    userId,
  );

  const { handleStartChat } = useStartChat({
    client,
    userId,
    setChannel,
    setCreating,
  });

  const filteredUsers = !search.trim()
    ? users
    : users.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.id.toLowerCase().includes(search.toLowerCase()),
      );

  const onlineCount = filteredUsers.filter((u) => u.online).length;

  const renderUserItem = ({ item }: { item: UserResponse }) => (
    <ExploreUserCard
      item={item}
      creating={creating}
      onStartChat={handleStartChat}
    />
  );

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
              Explore
            </Text>
            <Text className="mt-1 text-sm text-white/85">
              Find people and start chatting
            </Text>
          </View>

          <View className="items-center justify-center w-12 h-12 rounded-2xl bg-white/20">
            <Ionicons name="compass" size={24} color="#ffffff" />
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
            className="flex-1 ml-3 text-[15px] text-[#172B4D]"
            placeholder="Search people..."
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

      {/* List sheet */}
      <View className="flex-1 mt-5 overflow-hidden bg-white rounded-t-[28px]">
        {/* Results header */}
        {!loading && (
          <View className="flex-row items-center justify-between px-5 pt-5 pb-2">
            <Text className="text-base font-bold text-[#172B4D]">
              {search.trim()
                ? `${filteredUsers.length} result${
                    filteredUsers.length === 1 ? "" : "s"
                  }`
                : `${filteredUsers.length} ${
                    filteredUsers.length === 1 ? "person" : "people"
                  }`}
            </Text>

            {onlineCount > 0 && (
              <View className="flex-row items-center px-3 py-1 rounded-full bg-[#EAF8D9]">
                <View className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full" />
                <Text className="text-xs font-semibold text-[#477C19]">
                  {onlineCount} online
                </Text>
              </View>
            )}
          </View>
        )}

        {/* USERS LIST */}
        {loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="mt-4 text-sm text-gray-500">Finding people...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={{
              paddingTop: 4,
              paddingBottom: 110 + insets.bottom,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<ListEmptyComponent />}
            refreshing={refreshing}
            onRefresh={refreshUsers}
          />
        )}
      </View>
    </View>
  );
};


export default function Index() {
  return (
    <ChatGate>
      <ExploreScreen />
    </ChatGate>
  );
}