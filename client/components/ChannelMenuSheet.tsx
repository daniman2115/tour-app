// components/ChannelMenuSheet.tsx
// The "..." menu for a chat: Pin, Mute, Block, Leave, Delete.
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Channel } from "stream-chat";
import { useChatContext } from "stream-chat-expo";
import { getChannelName } from "./ChannelRow";

type Props = {
  channel: Channel | null;
  onClose: () => void;
  onChanged: () => void; // re-render the list after pin / mute / block
  onRemoved: (channel: Channel) => void; // drop it from the list (leave / delete)
};

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

type Item = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tile: string;
  color: string;
  danger?: boolean;
  onPress: () => void;
};

const ChannelMenuSheet = ({ channel, onClose, onChanged, onRemoved }: Props) => {
  const { client } = useChatContext();
  const insets = useSafeAreaInsets();

  // Ids of users this person has blocked (kept locally so the label updates at once)
  const [blockedIds, setBlockedIds] = useState<string[]>(
    ((client.user as any)?.blocked_user_ids as string[] | undefined) ?? [],
  );

  if (!channel) return null;

  const members = Object.values(channel.state.members);
  const others = members.filter((m) => m.user_id !== client.userID);
  const isDirect = members.length === 2 && others.length === 1;
  const other = isDirect ? others[0].user : undefined;

  const name = getChannelName(channel, client.userID);
  const image = other?.image as string | undefined;
  const anyOnline = others.some((m) => m.user?.online);
  const status = isDirect
    ? other?.online
      ? "Online"
      : "Offline"
    : `${members.length} members${anyOnline ? " · Online" : ""}`;

  const pinned = !!channel.state.membership?.pinned_at;
  const channelMuted = channel.muteStatus().muted;
  const userMuted =
    !!other && !!(client.user as any)?.mutes?.some((m: any) => m.target?.id === other.id);
  const blocked = !!other && blockedIds.includes(other.id);

  /* Run an action, then refresh the list. Close the sheet first. */
  const run = async (label: string, action: () => Promise<unknown>, after?: () => void) => {
    onClose();
    try {
      await action();
      after?.();
      onChanged();
    } catch (e) {
      console.error(`${label} failed:`, e);
      Alert.alert(`Couldn't ${label}`, "Please try again.");
    }
  };

  const confirm = (title: string, message: string, button: string, onConfirm: () => void) => {
    onClose();
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: button, style: "destructive", onPress: onConfirm },
    ]);
  };

  const items: Item[] = [];

  items.push({
    key: "pin",
    label: pinned ? "Unpin Chat" : "Pin Chat",
    icon: pinned ? "pin" : "pin-outline",
    tile: "bg-[#EEF2FB]",
    color: "#4060B2",
    onPress: () =>
      run(pinned ? "unpin the chat" : "pin the chat", () =>
        pinned ? channel.unpin() : channel.pin(),
      ),
  });

  if (isDirect && other) {
    items.push({
      key: "mute",
      label: userMuted ? "Unmute User" : "Mute User",
      icon: userMuted ? "notifications-outline" : "notifications-off-outline",
      tile: "bg-[#FFF4D6]",
      color: "#9A6B00",
      onPress: () =>
        run(userMuted ? "unmute the user" : "mute the user", () =>
          userMuted ? client.unmuteUser(other.id) : client.muteUser(other.id),
        ),
    });

    items.push({
      key: "block",
      label: blocked ? "Unblock User" : "Block User",
      icon: "ban-outline",
      tile: "bg-red-50",
      color: "#DC2626",
      danger: true,
      onPress: () => {
        if (blocked) {
          run("unblock the user", () => (client as any).unBlockUser(other.id), () =>
            setBlockedIds((ids) => ids.filter((id) => id !== other.id)),
          );
        } else {
          confirm(
            `Block ${other.name || "this user"}?`,
            "They won't be able to message you. You can unblock them later.",
            "Block",
            () =>
              run("block the user", () => (client as any).blockUser(other.id), () =>
                setBlockedIds((ids) => [...ids, other.id]),
              ),
          );
        }
      },
    });
  } else {
    items.push({
      key: "mute",
      label: channelMuted ? "Unmute Chat" : "Mute Chat",
      icon: channelMuted ? "notifications-outline" : "notifications-off-outline",
      tile: "bg-[#FFF4D6]",
      color: "#9A6B00",
      onPress: () =>
        run(channelMuted ? "unmute the chat" : "mute the chat", () =>
          channelMuted ? channel.unmute() : channel.mute(),
        ),
    });

    items.push({
      key: "leave",
      label: "Leave Chat",
      icon: "log-out-outline",
      tile: "bg-red-50",
      color: "#DC2626",
      danger: true,
      onPress: () =>
        confirm(
          "Leave this chat?",
          "You'll stop receiving messages from it.",
          "Leave",
          () =>
            run(
              "leave the chat",
              () => channel.removeMembers([client.userID as string]),
              () => onRemoved(channel),
            ),
        ),
    });
  }

  items.push({
    key: "delete",
    label: "Delete Chat",
    icon: "trash-outline",
    tile: "bg-red-50",
    color: "#DC2626",
    danger: true,
    onPress: () =>
      confirm(
        "Delete this chat?",
        "It will be removed from your list and your message history will be cleared. The other person keeps their copy.",
        "Delete",
        () =>
          run(
            "delete the chat",
            () => channel.hide(null, true),
            () => onRemoved(channel),
          ),
      ),
  });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="justify-end flex-1 bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />

        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
          className="px-5 pt-3 bg-white rounded-t-3xl"
        >
          <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />

          {/* Header: avatar, name, status */}
          <View className="flex-row items-center">
            {image ? (
              <Image
                source={image}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center justify-center w-[52px] h-[52px] rounded-full bg-[#EAF8D9]">
                {isDirect ? (
                  <Text className="text-lg font-bold text-[#477C19]">{getInitials(name)}</Text>
                ) : (
                  <Ionicons name="people" size={24} color="#477C19" />
                )}
              </View>
            )}
            <View className="flex-1 ml-3.5">
              <Text className="text-lg font-bold text-[#172B4D]" numberOfLines={1}>
                {name}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">{status}</Text>
            </View>
          </View>

          {/* Actions */}
          <View className="px-4 mt-5 overflow-hidden bg-[#F7F9FC] rounded-2xl">
            {items.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                className={`flex-row items-center py-3.5 active:opacity-60 ${
                  index !== items.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className={`items-center justify-center h-11 w-11 rounded-xl ${item.tile}`}>
                  <Ionicons name={item.icon} size={21} color={item.color} />
                </View>
                <Text
                  className={`flex-1 ml-3 text-[15px] font-semibold ${
                    item.danger ? "text-red-600" : "text-[#24334D]"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            className="items-center py-4 mt-3 bg-gray-100 rounded-2xl"
          >
            <Text className="text-[15px] font-semibold text-gray-600">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ChannelMenuSheet;