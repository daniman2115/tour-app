
import { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function VoiceMessageRecorder({ channel }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const [recordingUri, setRecordingUri] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
  return () => {
    recorder.stop().catch(() => {});
  };
}, [recorder]);


const startRecording = async () => {
  try {
    console.log("1. Microphone button pressed");

    console.log("2. Checking microphone permission...");
    let permission = await AudioModule.getRecordingPermissionsAsync();

    console.log("3. Current permission:", permission);

    if (!permission.granted) {
      console.log("4. Requesting microphone permission...");
      permission = await AudioModule.requestRecordingPermissionsAsync();
      console.log("5. Permission request result:", permission);
    }

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow microphone access in Android settings."
      );
      return;
    }

    console.log("6. Setting audio mode...");
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    console.log("7. Preparing recorder...");
    await recorder.prepareToRecordAsync();

    console.log("8. Starting recording...");
    recorder.record();

    console.log("9. Recording started");
  } catch (error) {
    console.error("Recording error:", error);
    Alert.alert(
      "Recording failed",
      error?.message ?? "Unable to start recording."
    );
  }
};



const stopRecording = async () => {
  try {
    await recorder.stop();

    const uri = recorder.uri;
    console.log("Final recording URI:", uri);

    if (!uri) {
      Alert.alert("Recording error", "No audio file was created.");
      return;
    }

    setRecordingUri(uri);

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });
  } catch (error) {
    console.error("Stop recording error:", error);
    Alert.alert("Error", "Could not finish recording.");
  }
};

  const cancelRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }

      setRecordingUri(null);
    } catch (error) {
      console.error("Cancel recording error:", error);
    }
  };


const sendRecording = async () => {
  if (!recordingUri || !channel || sending) return;

  setSending(true);

  try {
    console.log("Recording URI:", recordingUri);

    const filename = `voice-${Date.now()}.m4a`;

    const upload = await channel.sendFile(
      recordingUri,
      filename,
      "audio/mp4"
    );

    console.log("Stream upload response:", upload);

    const audioUrl = upload?.file;

    if (!audioUrl) {
      throw new Error("The audio file was not uploaded successfully.");
    }

   await channel.sendMessage({
  text: "Voice message",
  attachments: [
    {
      type: "voiceRecording",
      asset_url: audioUrl,
      title: "Voice message",
      mime_type: "audio/mp4",
      duration: recorderState.durationMillis / 1000,
    },
  ],
});

    console.log("Voice message sent:", audioUrl);

    setRecordingUri(null);
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });
  } catch (error) {
    console.error("Send voice message error:", error);
    Alert.alert(
      "Failed to send",
      error?.message ?? "Could not send the voice message."
    );
  } finally {
    setSending(false);
  }
};


  return (
    <View className="flex-row items-center justify-center gap-3 px-3 py-2 bg-white">
      {recorderState.isRecording ? (
        <>
          <View className="flex-row items-center flex-1 gap-2">
            <View className="w-2 h-2 bg-red-500 rounded-full" />

            <Text className="font-medium text-red-600">
              Recording...
            </Text>
          </View>

          <TouchableOpacity
            onPress={cancelRecording}
            disabled={sending}
            className="items-center justify-center rounded-full w-11 h-11 bg-slate-100"
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={stopRecording}
            className="items-center justify-center rounded-full w-11 h-11 bg-emerald-500"
          >
            <Ionicons name="stop" size={21} color="#ffffff" />
          </TouchableOpacity>
        </>
      ) : recordingUri ? (
        <>
          <View className="flex-row items-center flex-1 gap-2">
            <Ionicons name="musical-notes" size={22} color="#059669" />

            <Text className="font-medium text-slate-700">
              Voice message ready
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setRecordingUri(null)}
            disabled={sending}
            className="items-center justify-center rounded-full w-11 h-11 bg-slate-100"
          >
            <Ionicons name="trash-outline" size={21} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendRecording}
            disabled={sending}
            className="items-center justify-center rounded-full w-11 h-11 bg-emerald-500"
          >
            {sending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="flex-1 text-sm text-slate-500">
            Send a voice message
          </Text>

          <TouchableOpacity
            onPress={startRecording}
            className="items-center justify-center w-12 h-12 rounded-full bg-emerald-500"
          >
            <Ionicons name="mic" size={23} color="#ffffff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
