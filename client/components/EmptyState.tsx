import { COLORS } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center justify-center flex-1 px-5 bg-surface-light">
      <View className="mb-4">
        <Ionicons name={icon} size={64} color={COLORS.textSubtle} />
      </View>
      <Text className="text-base text-center text-foreground-muted">
        {title}
      </Text>
      <Text className="mt-1 text-sm text-center text-foreground-subtle">
        {subtitle}
      </Text>
    </View>
  );
}