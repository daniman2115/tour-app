// app/resetSuccess.jsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  // replace (not push) so the back gesture doesn't return to the reset screens
  const goToLogin = () => router.replace("../Login");

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center flex-1 px-8 mt-10">
          <View className="items-center justify-center w-40 h-40 rounded-full bg-[#EAF8D9]">
            <View className="items-center justify-center w-28 h-28 rounded-full bg-[#D3EEB0]">
              <View className="items-center justify-center w-20 h-20 bg-green-500 rounded-full">
                <Ionicons name="checkmark" size={44} color="white" />
              </View>
            </View>
          </View>

          <Text className="mt-8 text-[28px] font-bold text-center text-[#172B4D]">
            Password changed
          </Text>
          <Text className="mt-3 text-base leading-6 text-center text-gray-500">
            Congratulations! Your password has been changed. Continue to log in with your new
            password.
          </Text>
        </View>

        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.85}
            className="items-center py-4 bg-green-500 rounded-2xl"
          >
            <Text className="text-base font-semibold text-white">Continue to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;