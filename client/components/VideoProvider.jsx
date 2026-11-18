import { useSelector } from "react-redux";

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CustomCallScreen from "./CustomCallScreen";

let StreamVideo = null;
let StreamVideoClient = null;
let useCalls = null;
let useCall = null;
let useCallStateHooks = null;
let StreamCall = null;
let RingingCallContent = null;
let AcceptCallButton = null;
let RejectCallButton = null;
let HangUpCallButton = null;

try {
  const sdk = require("@stream-io/video-react-native-sdk");
  StreamVideo = sdk.StreamVideo;
  StreamVideoClient = sdk.StreamVideoClient;
  useCalls = sdk.useCalls;
  useCall = sdk.useCall;
  useCallStateHooks = sdk.useCallStateHooks;
  StreamCall = sdk.StreamCall;
  RingingCallContent = sdk.RingingCallContent;
  AcceptCallButton = sdk.AcceptCallButton;
  RejectCallButton = sdk.RejectCallButton;
  HangUpCallButton = sdk.HangUpCallButton;
  
} catch (error) {
  console.log("Error while importing @stream-io/video-react-native-sdk", error);
}

// double bang operator
const sdkAvailable = !!StreamVideoClient && !!StreamVideo;
const apiKey = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;

/* ------------------------------------------------------------------ */
/* Modern call screen UI (visual only, no call logic lives here)       */
/* ------------------------------------------------------------------ */

const ACCENT = "#10b981";
const BG = "#0b1220";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

/* soft expanding rings behind the avatar */
function PulseRings() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const ring = (delay) => {
    const p = Animated.modulo(Animated.add(progress, delay), 1);
    return {
      opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
      transform: [
        { scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) },
      ],
    };
  };

  return (
    <>
      <Animated.View style={[styles.ring, ring(0)]} />
      <Animated.View style={[styles.ring, ring(0.33)]} />
      <Animated.View style={[styles.ring, ring(0.66)]} />
    </>
  );
}

function CallerAvatar({ name, image }) {
  return (
    <View style={styles.avatarWrap}>
      <PulseRings />
      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
}

function ActionButton({ label, children }) {
  return (
    <View style={styles.actionItem}>
      {children}
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

/* shared layout for incoming + outgoing */
function CallLayout({ name, image, subtitle, status, children }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          // paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <CallerAvatar name={name} image={image} />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.actions}>{children}</View>
    </View>
  );
}

/* shown to the person receiving the call */
export function IncomingCallScreen() {
  const call = useCall();
  const { useCallCreatedBy } = useCallStateHooks();
  const creator = useCallCreatedBy();

  console.log({creator});

  const name = creator?.name || creator?.id || "Unknown";
  const image = creator?.image;

  return (
    <CallLayout
      name={name}
      image={image}
      status="Incoming call"
      subtitle="is calling you..."
    >
      <ActionButton label="Decline">
        <RejectCallButton />
      </ActionButton>
      <ActionButton label="Accept">
        <AcceptCallButton />
      </ActionButton>
    </CallLayout>
  );
}

/* shown to the person placing the call */
export function OutgoingCallScreen() {
  const call = useCall();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();

  const others = (members ?? []).filter(
    (m) => m.user_id !== call?.currentUserId,
  );
  const first = others[0]?.user;
    console.log({first});

  const name =
    others.length > 1
      ? `${first?.name || first?.id || "Group"} +${others.length - 1}`
      : first?.name || first?.id || "Calling...";
  const image = first?.image;

  return (
    <CallLayout
      name={name}
      image={image}
      status="Calling"
      subtitle="Ringing..."
    >
      <ActionButton label="Cancel">
        <HangUpCallButton />
      </ActionButton>
    </CallLayout>
  );
}


function RingingCalls() {
  const calls = useCalls();

  const incomingCall = calls.find(
    (call) => call.ringing && !call.isCreatedByMe,
  );

  if (!incomingCall) {
    return null;
  }

  return (
    <StreamCall call={incomingCall}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: BG },
        ]}
      >
        <RingingCallContent
          IncomingCall={IncomingCallScreen}
          OutgoingCall={OutgoingCallScreen}
          CallContent={CustomCallScreen}
        />
      </View>
    </StreamCall>
  );
}

/* Video component that uses Redux user state */
function VideoWithRedux({ children }) {
  const [videoClient, setVideoClient] = useState(null);
  const { user: thisUser } = useSelector((state) => state.auth);
  const user = thisUser;

  useEffect(() => {
    if (!sdkAvailable || !user) return;

    const tokenProvider = async () => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await response.json();
      return data.token;
    };


    const client = StreamVideoClient.getOrCreateInstance({
      apiKey,
      user: {
        id: user?._id,
        name: user?.fullName ?? user.username ?? "Guest",
        image: user?.imageUrl,
      },
      tokenProvider,
    });

    setVideoClient(client);

    // cleanup aka better performance
    return () => {
      client.disconnectUser();
      setVideoClient(null);
    };
  }, [user]);

  // SDK not available (Expo Go) — pass through
  if (!sdkAvailable) return <>{children}</>;

  // not authenticated — pass through (auth screens)
  if (!user) return <>{children}</>;

  if (!videoClient) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      {children}
      {useCalls && <RingingCalls />}
    </StreamVideo>
  );
}

const VideoProvider = ({ children }) => {
  return <VideoWithRedux>{children}</VideoWithRedux>;
};

export default VideoProvider;


const AVATAR = 132;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -140,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: ACCENT,
    opacity: 0.12,
  },
  glowBottom: {
    position: "absolute",
    bottom: -160,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#0ea5e9",
    opacity: 0.1,
  },
  header: {
    alignItems: "center",
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginRight: 8,
  },
  badgeText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  center: {
    alignItems: "center",
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  ring: {
    position: "absolute",
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: ACCENT,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  avatarFallback: {
    backgroundColor: "#134e4a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "800",
  },
  name: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    maxWidth: "90%",
  },
  subtitle: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
  },
  actionItem: {
    alignItems: "center",
  },
  actionLabel: {
    marginTop: 12,
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
});