
import { ChatGate } from "@/components/ChatWrapper";
import EmptyState from "../../../../../components/EmptyState";
import FullScreenLoader from "../../../../../components/FullScreenLoader";

import { useAppContext } from "@/contexts/AppProvider";
import { useHeaderHeight } from "expo-router/react-navigation";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Channel, Thread } from "stream-chat-expo";

const COLORS = {
  background: "#F7F9FC",
  white: "#FFFFFF",
  border: "#E2E8F0",
};

const ThreadScreen = () => {
  const { channel, thread, setThread } = useAppContext();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  if (channel === null) {
    return <FullScreenLoader message="Loading thread..." />;
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <Channel
        channel={channel}
        keyboardVerticalOffset={headerHeight}
        thread={thread}
        threadList
        audioRecordingEnabled
        EmptyStateIndicator={() => (
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No replies yet"
            subtitle="Be the first to reply to this message."
          />
        )}
      >
        <View className="flex-1">
          <Thread
            onThreadDismount={() => setThread(null)}
          />
        </View>
      </Channel>
    </View>
  );
};


export default function Index() {
  return (
    <ChatGate>
      <ThreadScreen />
    </ChatGate>
  );
}

