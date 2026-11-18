import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RTCView } from "@stream-io/react-native-webrtc";
import {
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";


function Tile({ participant, mirror, style }: any) {
  return (
    <View
      style={[
        {
          backgroundColor: "#111",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {participant ? (
        <ParticipantView
          participant={participant}
          trackType="videoTrack"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}


export default function CustomCallScreen() {

    const { width, height } = useWindowDimensions();
  const call = useCall();
  const insets = useSafeAreaInsets();
  const { useLocalParticipant, useRemoteParticipants, useMicrophoneState, useCameraState } =
    useCallStateHooks();
  const me = useLocalParticipant();
  const remote = useRemoteParticipants()[0];
  const mic = useMicrophoneState();
  const cam = useCameraState();

  const micOn = mic.status === "enabled";
  const camOn = cam.status === "enabled";

  return (
   <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: "#000",
      }}
    >
      <Tile participant={remote} style={StyleSheet.absoluteFill} />

      <Tile
        participant={me}
        mirror
        style={{
          position: "absolute",
          top: insets.top + 12,
          right: 12,
          width: 110,
          height: 160,
          borderRadius: 12,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 24,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <RoundBtn icon={micOn ? "mic" : "mic-off"} onPress={() => call?.microphone.toggle()} />
        <RoundBtn icon={camOn ? "videocam" : "videocam-off"} onPress={() => call?.camera.toggle()} />
        <RoundBtn icon="camera-reverse" onPress={() => call?.camera.flip()} />
        {/* <RoundBtn icon="call" color="#ef4444" onPress={() => call?.leave()} /> */}
        <RoundBtn
            icon="call"
            color="#ef4444"
            onPress={async () => {
                try {
                await call?.endCall();
                } catch (error) {
                console.error("Failed to end call:", error);
                }
            }}
            />
      </View>
    </View>
  );
}

function RoundBtn({ icon, onPress, color = "rgba(255,255,255,0.2)" }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color, alignItems: "center", justifyContent: "center" }}
    >
      <Ionicons name={icon} size={26} color="#fff" />
    </Pressable>
  );
}