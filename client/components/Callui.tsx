// components/CallUI.tsx
// Modern in-call controls and top bar for the Stream Video SDK.
// No dependency on lib/theme: colors are defined right here.
import { Ionicons } from "@expo/vector-icons";
import { useCall, useCallStateHooks } from "@stream-io/video-react-native-sdk";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const CALL_BG = "#0B1220";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const useElapsed = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
};

const formatClock = (total: number) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/* ------------------------------------------------------------------ */
/* Top bar: timer, optional call id chip, participant count            */
/* ------------------------------------------------------------------ */
type TopBarProps = {
  slugLabel?: string; // e.g. "Call ID: ABC-123"
  onSlugPress?: () => void;
  copied?: boolean;
};

export const CallTopBar = ({ slugLabel, onSlugPress, copied }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const elapsed = useElapsed();

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2">
      <View className="flex-row items-center justify-between">
        {/* Timer */}
        <View className="flex-row items-center px-3.5 py-2 rounded-full bg-black/45">
          <View className="w-2 h-2 mr-2 bg-red-500 rounded-full" />
          <Text className="text-xs font-semibold text-white">{formatClock(elapsed)}</Text>
        </View>

        {/* Optional call id chip (tap to copy) */}
        {slugLabel ? (
          <Pressable
            onPress={onSlugPress}
            className="flex-row items-center flex-shrink px-3.5 py-2 mx-2 rounded-full bg-black/45 active:opacity-70"
            accessibilityLabel="Copy call ID"
          >
            <Ionicons
              name={copied ? "checkmark-circle" : "copy-outline"}
              size={14}
              color={copied ? "#4ADE80" : "#FFFFFF"}
            />
            <Text className="ml-1.5 text-xs font-semibold text-white" numberOfLines={1}>
              {copied ? "Copied" : slugLabel}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        {/* Participants */}
        <View className="flex-row items-center px-3.5 py-2 rounded-full bg-black/45">
          <Ionicons name="people" size={14} color="#FFFFFF" />
          <Text className="ml-1.5 text-xs font-semibold text-white">{participants.length}</Text>
        </View>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Controls: mic, camera, flip, hang up                                */
/* ------------------------------------------------------------------ */
type ControlButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  off?: boolean; // shows the "turned off" look
  disabled?: boolean;
  onPress: () => void;
};

const ControlButton = ({ icon, label, off, disabled, onPress }: ControlButtonProps) => (
  <View className="items-center">
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`items-center justify-center w-14 h-14 rounded-full active:opacity-70 ${
        off ? "bg-white" : "bg-white/15"
      } ${disabled ? "opacity-40" : ""}`}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={24} color={off ? CALL_BG : "#FFFFFF"} />
    </Pressable>
    <Text className="mt-1.5 text-[11px] font-medium text-white/80">{label}</Text>
  </View>
);

export const CallControlsBar = ({ onHangupCallHandler }: { onHangupCallHandler?: () => void }) => {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, status: micStatus } = useMicrophoneState();
  const { camera, status: camStatus } = useCameraState();

  const micOff = micStatus === "disabled";
  const camOff = camStatus === "disabled";

  const hangUp = async () => {
    if (onHangupCallHandler) {
      await onHangupCallHandler();
      return;
    }
    // Leave the call (same default as the SDK). Screens that want to end it
    // for everyone pass their own onHangupCallHandler.
    await call?.leave();
  };

  return (
    <View className="px-5 pb-3">
      <View className="flex-row items-center justify-between px-5 py-4 bg-black/55 rounded-[32px]">
        <ControlButton
          icon={micOff ? "mic-off" : "mic"}
          label={micOff ? "Unmute" : "Mute"}
          off={micOff}
          onPress={() => microphone.toggle()}
        />

        <ControlButton
          icon={camOff ? "videocam-off" : "videocam"}
          label={camOff ? "Start video" : "Stop video"}
          off={camOff}
          onPress={() => camera.toggle()}
        />

        <ControlButton
          icon="camera-reverse"
          label="Flip"
          disabled={camOff}
          onPress={() => camera.flip()}
        />

        {/* Hang up */}
        <View className="items-center">
          <Pressable
            onPress={hangUp}
            className="items-center justify-center bg-red-500 rounded-full w-[60px] h-[60px] active:bg-red-600"
            accessibilityLabel="End call"
          >
            <Ionicons
              name="call"
              size={26}
              color="#FFFFFF"
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </Pressable>
          <Text className="mt-1.5 text-[11px] font-medium text-white/80">End</Text>
        </View>
      </View>
    </View>
  );
};