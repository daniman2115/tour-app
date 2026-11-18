import { ActivityIndicator, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { Redirect, Tabs } from "expo-router";

import Ionicons from "@react-native-vector-icons/ionicons";
import Entypo from "@react-native-vector-icons/entypo";
import Feather from "@react-native-vector-icons/feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useAppInit } from "../../contexts/AppInitContext";

const ACTIVE = "#477C19";
const INACTIVE = "#9CA3AF";
const PILL = "#EAF8D9";


/* Tabs: add, remove or reorder here. `name` must match your folder/file. */
const TABS = [
  { name: "Home/index", title: "Home", Icon: Entypo, icon: "home" },
  { name: "locationSearch/index", title: "Search", Icon: Feather, icon: "search" },
  { name: "Live/index", title: "Chats", Icon: Ionicons, icon: "chatbox" },
  { name: "Explore/index", title: "Explore", Icon: Entypo, icon: "globe" },
  { name: "Settings/index", title: "Settings", Icon: Ionicons, icon: "settings-sharp" },
  // Your old commented-out tabs can come back with the same pattern, e.g.
  // { name: "(call)", title: "Video", Icon: Entypo, icon: "video-camera" },
];

/* Defined outside Layout so they don't remount on every render */
const TabIcon = ({ focused, Icon, name, color }) => {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, {
      damping: 14,
      stiffness: 180,
      mass: 0.6,
    });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + 0.4 * progress.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.1 * progress.value }],
  }));

  return (
    <View style={{ width: 54, height: 32, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 54,
            height: 32,
            borderRadius: 16,
            backgroundColor: PILL,
          },
          pillStyle,
        ]}
      />
      <Animated.View style={iconStyle}>
        <Icon name={name} size={20} color={color} />
      </Animated.View>
    </View>
  );
};

const TabLabel = ({ focused, color, children }) => (
  <Text
    style={{
      color,
      fontSize: 11,
      fontWeight: focused ? "700" : "500",
      marginTop: 2,
    }}
  >
    {children}
  </Text>
);

const Layout = () => {
  const insets = useSafeAreaInsets();
  const { ready, getStartedCompleted } = useAppInit();

  if (!ready) {
    return (
      <View className="items-center justify-center flex-1 bg-[#F7F9FC]">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!getStartedCompleted) {
    return <Redirect href="../getStarted" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,

        // Floating, rounded bar
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom + 10,
          height: 66,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: "#FFFFFF",
          elevation: 12,
          shadowColor: "#172B4D",
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
        tabBarItemStyle: {
          paddingVertical: 7,
        },

        tabBarButton: (props) => {
          if (Platform.OS === "android") {
            return (
              <Pressable
                {...props}
                android_ripple={null} // Remove Android ripple effect
                style={props.style}
              />
            );
          }
          return <TouchableOpacity {...props} activeOpacity={1} style={props.style} />;
        },
      }}
    >
      {TABS.map(({ name, title, Icon, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarLabel: ({ focused, color }) => (
              <TabLabel focused={focused} color={color}>
                {title}
              </TabLabel>
            ),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} Icon={Icon} name={icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default Layout;