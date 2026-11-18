// components/call/CallScreens.jsx
// Custom call UI built on Stream's hooks. Replaces the SDK's default screens
// (IncomingCall, OutgoingCall, CallContent, RingingCallContent).
import { Ionicons } from "@expo/vector-icons";
import {
  CallingState,
  ParticipantView,
  SfuModels,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG = "#0B1220";
const TILE_BG = "#111C2E";
const GREEN = "#22C55E";
const RED = "#EF4444";
const NAVY_TEXT = "#477C19";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const getName = (u) => u?.name || u?.userId || u?.id || "Guest";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
};

const hasTrack = (participant, type) =>
  !!participant?.publishedTracks?.includes(type);

const formatDuration = (total) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const useElapsed = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return seconds;
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
const Avatar = ({ user, size = 120 }) => {
  const name = getName(user);
  if (user?.image) {
    return (
      <Image
        source={{ uri: user.image }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#EAF8D9",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: "700", color: NAVY_TEXT }}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

/* Soft rings that pulse outward while ringing */
const PulseRings = ({ size, children }) => {
  const values = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = values.map((value, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 600),
          Animated.timing(value, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [values]);

  return (
    <View
      style={{
        width: size * 2,
        height: size * 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {values.map((value, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "rgba(34,197,94,0.35)",
            opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [
              {
                scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }),
              },
            ],
          }}
        />
      ))}
      {children}
    </View>
  );
};

const CallBackground = ({ children }) => (
  <View style={{ flex: 1, backgroundColor: BG }}>
    <StatusBar barStyle="light-content" />
    <View
      style={{
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: 160,
        right: -120,
        top: -100,
        backgroundColor: "rgba(34,197,94,0.10)",
      }}
    />
    <View
      style={{
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        left: -90,
        bottom: 120,
        backgroundColor: "rgba(34,197,94,0.07)",
      }}
    />
    {children}
  </View>
);

const RoundAction = ({ icon, label, color, onPress, disabled, rotate }) => (
  <View style={{ alignItems: "center" }}>
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Ionicons
        name={icon}
        size={30}
        color="#FFFFFF"
        style={rotate ? { transform: [{ rotate: "135deg" }] } : undefined}
      />
    </Pressable>
    <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" }}>
      {label}
    </Text>
  </View>
);

/* ------------------------------------------------------------------ */
/* Incoming call                                                       */
/* ------------------------------------------------------------------ */
export const IncomingCallScreen = () => {
  const call = useCall();
  const insets = useSafeAreaInsets();
  const { useCallCreatedBy } = useCallStateHooks();
  const creator = useCallCreatedBy();
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await call?.join();
    } catch (e) {
      console.error("Failed to accept the call:", e);
      setBusy(false);
    }
  };

  const decline = async () => {
    try {
      await call?.leave({ reject: true, reason: "decline" });
    } catch (e) {
      console.error("Failed to decline the call:", e);
    }
  };

  return (
    <CallBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text
            style={{
              color: GREEN,
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Incoming video call
          </Text>

          <View style={{ marginTop: 8 }}>
            <PulseRings size={132}>
              <Avatar user={creator} size={132} />
            </PulseRings>
          </View>

          <Text
            style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "800", marginTop: -8 }}
            numberOfLines={1}
          >
            {getName(creator)}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginTop: 6 }}>
            is calling you on VirtualTour
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingHorizontal: 24,
          }}
        >
          <RoundAction icon="call" label="Decline" color={RED} onPress={decline} rotate />
          <RoundAction
            icon="videocam"
            label={busy ? "Joining..." : "Accept"}
            color={GREEN}
            onPress={accept}
            disabled={busy}
          />
        </View>
      </View>
    </CallBackground>
  );
};

/* ------------------------------------------------------------------ */
/* Outgoing call                                                       */
/* ------------------------------------------------------------------ */
export const OutgoingCallScreen = () => {
  const call = useCall();
  const insets = useSafeAreaInsets();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();

  const others = (members ?? [])
    .filter((m) => m.user_id !== call?.currentUserId)
    .map((m) => m.user ?? { id: m.user_id });
  const first = others[0];
  const title =
    others.length === 0
      ? "Calling..."
      : others.length === 1
        ? getName(first)
        : `${getName(first)} +${others.length - 1}`;

  const cancel = async () => {
    try {
      await call?.leave({ reject: true, reason: "cancel" });
    } catch (e) {
      console.error("Failed to cancel the call:", e);
    }
  };

  return (
    <CallBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text
            style={{
              color: GREEN,
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Video call
          </Text>

          <View style={{ marginTop: 8 }}>
            <PulseRings size={132}>
              <Avatar user={first} size={132} />
            </PulseRings>
          </View>

          <Text
            style={{ color: "#FFFFFF", fontSize: 30, fontWeight: "800", marginTop: -8 }}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginTop: 6 }}>
            Calling...
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <RoundAction icon="call" label="Cancel" color={RED} onPress={cancel} rotate />
        </View>
      </View>
    </CallBackground>
  );
};

/* ------------------------------------------------------------------ */
/* Connecting / error (no call hooks, safe to use outside StreamCall)  */
/* ------------------------------------------------------------------ */
export const ConnectingScreen = ({ label = "Connecting..." }) => (
  <CallBackground>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={GREEN} />
      </View>
      <Text style={{ marginTop: 20, color: "#FFFFFF", fontSize: 17, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  </CallBackground>
);

export const CallErrorScreen = ({ error, onBack }) => (
  <CallBackground>
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: "rgba(239,68,68,0.15)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={44} color={RED} />
      </View>
      <Text
        style={{
          marginTop: 20,
          color: "#FFFFFF",
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {error}
      </Text>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => ({
          marginTop: 28,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 16,
          backgroundColor: GREEN,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Go Back</Text>
      </Pressable>
    </View>
  </CallBackground>
);

/* ------------------------------------------------------------------ */
/* In-call                                                             */
/* ------------------------------------------------------------------ */
const ParticipantTile = ({ participant, label = false, small = false }) => {
  const videoOn = hasTrack(participant, SfuModels.TrackType.VIDEO);
  const audioOn = hasTrack(participant, SfuModels.TrackType.AUDIO);

  return (
    <View style={{ flex: 1, backgroundColor: TILE_BG }}>
      {videoOn ? (
        <ParticipantView
          participant={participant}
          trackType="videoTrack"
          ParticipantLabel={null}
          ParticipantNetworkQualityIndicator={null}
          style={{ flex: 1 }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Avatar user={participant} size={small ? 52 : 104} />
        </View>
      )}

      {label ? (
        <View
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          {!audioOn ? (
            <Ionicons name="mic-off" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
          ) : null}
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
            {getName(participant)}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const ControlButton = ({ icon, label, onPress, off, danger, rotate }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={label}
    style={({ pressed }) => ({
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: danger ? RED : off ? "#FFFFFF" : "rgba(255,255,255,0.16)",
      opacity: pressed ? 0.8 : 1,
    })}
  >
    <Ionicons
      name={icon}
      size={25}
      color={danger ? "#FFFFFF" : off ? BG : "#FFFFFF"}
      style={rotate ? { transform: [{ rotate: "135deg" }] } : undefined}
    />
  </Pressable>
);

export const InCallScreen = ({ onHangup, topAccessory }) => {
  const call = useCall();
  const insets = useSafeAreaInsets();
  const {
    useLocalParticipant,
    useRemoteParticipants,
    useMicrophoneState,
    useCameraState,
    useCallCallingState,
  } = useCallStateHooks();

  const local = useLocalParticipant();
  const remotes = useRemoteParticipants();
  const { microphone, status: micStatus } = useMicrophoneState();
  const { camera, status: camStatus } = useCameraState();
  const callingState = useCallCallingState();
  const seconds = useElapsed();

  const micOn = micStatus === "enabled";
  const camOn = camStatus === "enabled";
  const reconnecting =
    callingState === CallingState.RECONNECTING || callingState === CallingState.OFFLINE;

  const everyone = [local, ...remotes].filter(Boolean);
  const title =
    remotes.length === 0
      ? "Waiting for others"
      : remotes.length === 1
        ? getName(remotes[0])
        : `${getName(remotes[0])} +${remotes.length - 1}`;

  const hangUp = onHangup ?? (() => call?.leave());
  const rows = Math.max(1, Math.ceil(everyone.length / 2));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="light-content" />

      {/* Video area */}
      <View style={StyleSheet.absoluteFill}>
        {remotes.length === 0 && local ? (
          <ParticipantTile participant={local} />
        ) : remotes.length === 1 ? (
          <ParticipantTile participant={remotes[0]} />
        ) : remotes.length >= 2 ? (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              paddingTop: insets.top + 64,
              paddingBottom: insets.bottom + 110,
              paddingHorizontal: 8,
            }}
          >
            {everyone.map((p) => (
              <View
                key={p.sessionId}
                style={{ width: "50%", height: `${100 / rows}%`, padding: 4 }}
              >
                <View style={{ flex: 1, borderRadius: 20, overflow: "hidden" }}>
                  <ParticipantTile participant={p} label />
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Waiting message */}
      {remotes.length === 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "38%",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <ActivityIndicator size="small" color={GREEN} />
            <Text style={{ marginLeft: 10, color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
              Waiting for others to join...
            </Text>
          </View>
        </View>
      ) : null}

      {/* Self view (one-to-one calls) */}
      {remotes.length === 1 && local ? (
        <View
          style={{
            position: "absolute",
            top: insets.top + 72,
            right: 16,
            width: 108,
            height: 152,
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.3)",
            zIndex: 5,
          }}
        >
          <ParticipantTile participant={local} small />
        </View>
      ) : null}

      {/* Top bar */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View
            style={{
              flexShrink: 1,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
              {title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: GREEN,
                  marginRight: 6,
                }}
              />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" }}>
                {formatDuration(seconds)}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.4)",
              marginLeft: 12,
            }}
          >
            <Ionicons name="people" size={15} color="#FFFFFF" />
            <Text style={{ marginLeft: 6, color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
              {everyone.length}
            </Text>
          </View>
        </View>

        {reconnecting ? (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 16,
                backgroundColor: "#F59E0B",
              }}
            >
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ marginLeft: 8, color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                Reconnecting...
              </Text>
            </View>
          </View>
        ) : null}

        {topAccessory ? <View style={{ marginTop: 10, alignSelf: "flex-start" }}>{topAccessory}</View> : null}
      </View>

      {/* Controls */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: insets.bottom + 16,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 40,
            backgroundColor: "rgba(11,18,32,0.82)",
            gap: 12,
          }}
        >
          <ControlButton
            icon={micOn ? "mic" : "mic-off"}
            label={micOn ? "Mute microphone" : "Unmute microphone"}
            off={!micOn}
            onPress={() => microphone.toggle()}
          />
          <ControlButton
            icon={camOn ? "videocam" : "videocam-off"}
            label={camOn ? "Turn camera off" : "Turn camera on"}
            off={!camOn}
            onPress={() => camera.toggle()}
          />
          <ControlButton
            icon="camera-reverse-outline"
            label="Flip camera"
            onPress={() => camera.flip()}
          />
          <ControlButton icon="call" label="End call" danger rotate onPress={hangUp} />
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Picks the right screen for the current calling state                */
/* ------------------------------------------------------------------ */
export const CallStage = ({ onHangup, topAccessory }) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const createdByMe = call?.isCreatedByMe ?? false;

  if (callingState === CallingState.RINGING) {
    return createdByMe ? <OutgoingCallScreen /> : <IncomingCallScreen />;
  }
  if (callingState === CallingState.IDLE) {
    return createdByMe ? <OutgoingCallScreen /> : <ConnectingScreen />;
  }
  if (callingState === CallingState.JOINING) {
    return <ConnectingScreen />;
  }
  if (callingState === CallingState.LEFT) {
    return <CallBackground />;
  }
  return <InCallScreen onHangup={onHangup} topAccessory={topAccessory} />;
};