// app/confirmReset.jsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  // Passed along from the enter-code screen so the next screen can finish the reset
  const { email, code } = useLocalSearchParams();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/Login");
  };

  const handleConfirm = () => {
    router.push({ pathname: "../setNewPassword", params: { email, code } });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <View className="px-5 pt-4">
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            className="items-center justify-center w-10 h-10 bg-white rounded-full"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={22} color="#172B4D" />
          </TouchableOpacity>
        </View>

        {/* Success message */}
        <View className="items-center px-8 mt-16">
          <View className="items-center justify-center w-40 h-40 rounded-full bg-[#EAF8D9]">
            <View className="items-center justify-center w-28 h-28 rounded-full bg-[#D3EEB0]">
              <View className="items-center justify-center w-20 h-20 bg-green-500 rounded-full">
                <Ionicons name="checkmark" size={44} color="white" />
              </View>
            </View>
          </View>

          <Text className="mt-8 text-[28px] font-bold text-center text-[#172B4D]">
            Code verified
          </Text>
          <Text className="mt-3 text-base leading-6 text-center text-gray-500">
            Your code is correct. Tap the button below to choose a new password for your account.
          </Text>
        </View>

        <View className="flex-1 min-h-[24px]" />

        {/* Action */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            className="items-center py-4 bg-green-500 rounded-2xl"
          >
            <Text className="text-base font-semibold text-white">Set new password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;