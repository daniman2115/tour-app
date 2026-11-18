import { ActivityIndicator, Text, View } from "react-native";
import Screen from "./screen";

export default function FullScreenLoader({ message }: { message?: string }) {
  return (
    <Screen>
      <View className="items-center justify-center flex-1 px-8">
        {/* Soft glow behind the card */}
      <ActivityIndicator size="large" color="#10b981"/>
      

        {message ? (
          <Text className="mt-5 text-sm font-medium text-center text-slate-500">
            {message}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}