import { Entypo, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../stores/authSlice";
import { useAppInit } from "../../../contexts/AppInitContext";

const Index = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  console.log({user});
    const {role} = useAppInit();
    console.log({role});
  

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeConfirm = () => {
    if (!loggingOut) setConfirmVisible(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      setConfirmVisible(false);
      router.replace("../Login");
    } catch (error) {
      Alert.alert("Couldn't log out", "Check your connection and try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    {
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "person-outline",
      onPress: role === "visitor" ? () => router.push("/Profile/visitorEdit") : () => router.push("/Profile"),
    },
    // {
    //   title: "Change Password",
    //   subtitle: "Update your account password",
    //   icon: "lock-closed-outline",
    //   onPress: () => router.push("/changePassword"),
    // },
    {
      title: "My Meetings",
      subtitle: "Manage your scheduled meetings",
      icon: "calendar-outline",
      onPress: () => router.push("/myBookings"),
    },
    {
      title: "Call History",
      subtitle: "View your previous calls",
      icon: "call-outline",
      onPress: () => router.push("/callLogs"),
    },
    {
      title: "Notifications",
      subtitle: "Stay updated with activity",
      icon: "notifications-outline",
      onPress: () => router.push("/Notification"),
    },
    {
      title: "Payments",
      subtitle: "Manage your payments",
      icon: "card-outline",
      onPress: undefined,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FC]" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-5">
          <Text className="text-2xl font-bold text-[#172B4D]">My Account</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Manage your profile and preferences
          </Text>
        </View>

        {/* Profile Card */}
        <View className="mx-5 overflow-hidden bg-white rounded-3xl">
          <View className="bg-green-400 h-28">
            <View className="absolute w-40 h-40 rounded-full -right-8 -top-14 bg-white/20" />
            <View className="absolute w-24 h-24 rounded-full -left-8 top-10 bg-white/20" />
          </View>

          <View className="items-center px-5 pb-6">
            <View className="relative -mt-16">
              <Image
                className="border-4 border-white rounded-full h-28 w-28"
                source={
                  user?.profileImage
                    ? { uri: user.profileImage }
                    : require("../../../assets/images/profile.jpg")
                }
              />

              {/* <View className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#4060B2]">
                <Entypo name="camera" size={17} color="white" />
              </View> */}
            </View>

            <Text
              className="mt-3 text-xl font-bold text-[#172B4D]"
              numberOfLines={1}
            >
              {user?.name || "User"}
            </Text>

            <View className="mt-2 rounded-full bg-[#EAF8D9] px-3 py-1">
              <Text className="text-xs font-semibold text-[#477C19]">
                Virtual Tour Member
              </Text>
            </View>

            {/* Balance */}
            <View className="mt-5 w-full flex-row items-center justify-between rounded-2xl bg-[#F5F8F0] px-4 py-4">
              <View className="flex-row items-center">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5CA]">
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={23}
                    color="#477C19"
                  />
                </View>

                <View className="ml-3">
                  <Text className="text-sm text-gray-500">
                    Available Balance
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-[#172B4D]">
                    $0.00
                  </Text>
                </View>
              </View>

              <MaterialIcons
                name="account-balance-wallet"
                size={25}
                color="#8ABF4D"
              />
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="mx-5 mt-7">
          <Text className="mb-3 text-base font-bold text-[#172B4D]">
            Account Settings
          </Text>

          <View className="px-4 overflow-hidden bg-white rounded-2xl">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                onPress={item.onPress}
                disabled={!item.onPress}
                activeOpacity={0.7}
                className={`flex-row items-center py-4 ${
                  index !== menuItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7E8]">
                  <Ionicons name={item.icon} size={21} color="#578A2B" />
                </View>

                <View className="flex-1 ml-3">
                  <Text className="text-[15px] font-semibold text-[#24334D]">
                    {item.title}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {item.subtitle}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={25} color="#A0A8B5" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            activeOpacity={0.75}
            className="flex-row items-center px-4 py-4 bg-white border border-red-100 rounded-2xl"
          >
            <View className="items-center justify-center h-11 w-11 rounded-xl bg-red-50">
              <MaterialIcons name="logout" size={22} color="#DC2626" />
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-[15px] font-semibold text-red-600">
                Log Out
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Sign out of your account
              </Text>
            </View>

            <MaterialIcons name="chevron-right" size={25} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <Text className="mt-6 text-xs text-center text-gray-400">
          Virtual Tour
        </Text>
      </ScrollView>

      {/* Logout confirmation */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="slide"
        onRequestClose={closeConfirm}
        statusBarTranslucent
      >
        <View className="justify-end flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={closeConfirm} />

          <View className="px-5 pt-3 pb-8 bg-white rounded-t-3xl">
            <View className="self-center w-10 h-1 mb-5 bg-gray-200 rounded-full" />

            <View className="items-center">
              <View className="items-center justify-center w-16 h-16 rounded-full bg-red-50">
                <MaterialIcons name="logout" size={28} color="#DC2626" />
              </View>
              <Text className="mt-4 text-lg font-bold text-[#172B4D]">
                Log out of Virtual Tour?
              </Text>
              <Text className="mt-1 text-sm text-center text-gray-500">
                You'll need to sign in again to see your meetings and calls.
              </Text>
            </View>

            <View className="flex-row mt-6">
              <TouchableOpacity
                onPress={closeConfirm}
                disabled={loggingOut}
                activeOpacity={0.7}
                className="items-center justify-center flex-1 py-3.5 mr-2 bg-gray-100 rounded-xl"
              >
                <Text className="text-[15px] font-semibold text-gray-600">
                  Stay signed in
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                disabled={loggingOut}
                activeOpacity={0.8}
                className={`items-center justify-center flex-1 py-3.5 ml-2 rounded-xl ${
                  loggingOut ? "bg-red-300" : "bg-red-500"
                }`}
              >
                <Text className="text-[15px] font-semibold text-white">
                  {loggingOut ? "Logging out..." : "Yes, log out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Index;
