import { COLORS } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const ListEmptyContainer = () => {
  return (
    <View className="items-center gap-2 pt-20">
      <Ionicons name="people-outline" size={48} color={COLORS.textSubtle} />
      <Text className="text-foreground text-[17px] font-semibold">
        No channels found
      </Text>
    </View>
  );
};

export default ListEmptyContainer;