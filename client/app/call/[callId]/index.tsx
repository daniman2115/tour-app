import { Ionicons } from "@expo/vector-icons";
import {
  Call,
  CallContent,
  CallingState,
  IncomingCall,
  OutgoingCall,
  StreamCall,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState,useRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatContext } from "stream-chat-expo";
import CustomCallScreen from "../../../components/CustomCallScreen"
import { OutgoingCallScreen, IncomingCallScreen } from "@/components/VideoProvider";



const CallScreenContent = () => {
  const { callId } = useLocalSearchParams<{ callId: string }>();

  const videoClient = useStreamVideoClient();
  const { client: chatClient } = useChatContext();

  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate one unique video call ID for this screen instance.
  // The chat channel ID remains unchanged.
  const videoCallIdRef = useRef<string | null>(null);

  if (!videoCallIdRef.current) {
    videoCallIdRef.current =
      `call_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  useEffect(() => {
    if (!videoClient || !callId || !chatClient) return;

    let cancelled = false;

    const startCall = async () => {
      try {
        setError(null);

        // Use the chat channel ID to obtain the participants.
        const channel = chatClient.channel("messaging", callId);

        await channel.watch();

        if (cancelled) return;

        const members = Object.values(channel.state.members)
          .map((member) => ({
            user_id: member.user?.id ?? member.user_id,
          }))
          .filter((member) => Boolean(member.user_id));

        if (members.length === 0) {
          throw new Error("No valid members were found in this chat.");
        }

        // IMPORTANT:
        // Create a new video call ID for every call attempt.
        const videoCall = videoClient.call(
          "default",
          videoCallIdRef.current!,
        );

        await videoCall.getOrCreate({
          ring: true,
          data: {
            members,
            custom: {
              triggeredBy: chatClient.user?.id,
            },
          },
        });

        if (cancelled) {
          // Avoid leaving a call instance behind if this screen
          // was closed while the call was being initialized.
          try {
            await videoCall.leave();
          } catch (leaveError) {
            console.warn(
              "Could not leave the cancelled call:",
              leaveError,
            );
          }

          return;
        }

        setCall(videoCall);
      } catch (err) {
        console.error("Failed to start call:", err);

        if (!cancelled) {
          setError("Failed to start the call. Try again.");
        }
      }
    };

    startCall();

    return () => {
      cancelled = true;
    };
  }, [videoClient, callId, chatClient]);

  if (error) {
    return <ErrorCallUI error={error} />;
  }

  if (!call) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="items-center justify-center flex-1 gap-4">
          <ActivityIndicator size="large" color="#10b981" />

          <Text className="mt-2 text-base text-foreground-muted">
            Starting call...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <StreamCall call={call}>
      <CallUI />
    </StreamCall>
  );
};


function CallUI() {


  const call = useCall();
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();



  const isCallCreatedByMe = call?.isCreatedByMe ?? false;

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      router.back();
    }
  }, [callingState, router]);

  // Display the appropriate UI while the call is ringing or connecting.
  if (
  [CallingState.RINGING, CallingState.JOINING, CallingState.IDLE].includes(callingState)
) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0b1220" }}>
      {isCallCreatedByMe ? <OutgoingCallScreen /> : <IncomingCallScreen />}
    </View>
  );
}

  return <CustomCallScreen />;
}

function ErrorCallUI({ error }: { error: string }) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="items-center justify-center flex-1 gap-4">
        <Ionicons name="alert-circle-outline" size={48}  />

        <Text className="mt-2 text-base text-foreground">{error}</Text>

        <Pressable
          className="px-6 py-3 mt-4 rounded-xl bg-primary"
          onPress={() => router.back()}
        >
          <Text className="text-[15px] font-semibold text-foreground">
            Go Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function Index() {
  return (
    // <ChatWrapper>
    // <VideoProvider>
    <CallScreenContent />
    //</VideoProvider>
    // </ChatWrapper>
  );
}