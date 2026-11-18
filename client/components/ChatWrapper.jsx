import NetInfo from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_GET_STREAM_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/* Stream chat theme (green palette)                                   */
/* ------------------------------------------------------------------ */
const GREEN = "#10b981"; // emerald-500
const GREEN_LIGHT = "#d1fae5"; // emerald-100
const GREEN_TINT = "#ecfdf5"; // emerald-50
const SLATE_900 = "#0f172a";
const SLATE_500 = "#64748b";
const SLATE_400 = "#94a3b8";

const streamTheme = {
  colors: {
    accent_blue: GREEN,
    accent_green: GREEN,
    accent_red: "#ef4444",
    black: SLATE_900,
    grey: SLATE_400,
    grey_gainsboro: "#e2e8f0",
    grey_whisper: "#f1f5f9",
    white_smoke: GREEN_TINT,
    white_snow: "#f8fafc",
    border: GREEN_LIGHT,
    blue_alice: GREEN_TINT,
    bg_gradient_start: GREEN_TINT,
    bg_gradient_end: "#f0fdf4",
    targetedMessageBackground: GREEN_LIGHT,
  },

  channelPreview: {
    container: {
      backgroundColor: "#ffffff",
      borderBottomColor: GREEN_LIGHT,
      borderBottomWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    contentContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      color: SLATE_900,
      fontSize: 16,
      fontWeight: "700",
    },
    message: {
      color: SLATE_500,
      fontSize: 13,
    },
    date: {
      color: SLATE_400,
      fontSize: 12,
    },
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const getUserName = (user) =>
  user.fullName ||
  user.name ||
  user.username ||
  user.firstName ||
  user.email?.split("@")[0] ||
  user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
  "Guest";


  

const syncUserToStream = async (user) => {
  const userId = String(user._id ?? user.id ?? "");

  const response = await fetch(`${API_URL}/sync-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      name: getUserName(user),
      image: user.imageUrl ?? user.image ?? undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `User sync failed: ${response.status}`,
    );
  }

  return data;
};

/* ------------------------------------------------------------------ */
/* Chat status context + gate                                          */
/* ------------------------------------------------------------------ */
// status: "connecting" | "ready" | "error"
const ChatStatusContext = createContext({
  status: "connecting",
  error: "",
  retry: () => {},
});

export const useChatStatus = () => useContext(ChatStatusContext);

/**
 * Wrap any screen that uses useChatContext() with <ChatGate>.
 * It shows a loader / offline message instead of the screen until chat is ready.
 * Screens that don't use chat (Home, etc.) render normally without it.
 */
export const ChatGate = ({ children }) => {
  const { status, retry } = useChatStatus();

  if (status === "ready") return children;

  if (status === "connecting") {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color={GREEN} />
        <Text className="mt-3 text-sm text-slate-500">
          Connecting to chat...
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center flex-1 px-8 bg-emerald-50/60">
      <View className="items-center justify-center w-20 h-20 bg-white border border-red-100 shadow-md rounded-3xl">
        <Ionicons name="cloud-offline" size={32} color="#ef4444" />
      </View>

      <Text className="mt-5 text-xl font-extrabold text-center text-slate-900">
        You're offline
      </Text>

      <Text className="mt-2 text-sm text-center text-slate-500">
        Chat needs an internet connection. We'll reconnect automatically.
      </Text>

      <Pressable
        onPress={retry}
        className="px-6 py-3 mt-5 rounded-xl bg-emerald-500"
      >
        <Text className="font-semibold text-white">Try again</Text>
      </Pressable>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Client: connects in the background, never blocks the app            */
/* ------------------------------------------------------------------ */
const ChatClient = ({ children, user }) => {
  const userId = String(user._id ?? user.id ?? "");
  const name = getUserName(user);
  const image = user.imageUrl ?? user.image;

  const client = useMemo(() => StreamChat.getInstance(STREAM_API_KEY), []);

  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const statusRef = useRef(status);
  statusRef.current = status;

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const tokenProvider = useCallback(async () => {
    const response = await fetch(`${API_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.token) {
      throw new Error(
        data.error ||
          data.message ||
          `Stream token request failed: ${response.status}`,
      );
    }

    return data.token;
  }, [userId]);

  // Connect in the background.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStatus("connecting");
        setError("");

        console.log("REDUX USER:", JSON.stringify(user, null, 2));
console.log("RESOLVED NAME:", name);
console.log("STREAM USER ID:", client.userID);
console.log("STREAM USER:", client.user);

        await syncUserToStream(user);

        console.log({clId:client.userID});
        console.log({uId:userId});

        if (client.userID !== userId) {
          await client.connectUser(
            { id: userId, name, ...(image ? { image } : {}) },
            tokenProvider,
          );
        }

        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.warn("Chat connect failed:", e?.message);

        // Reset a half-connected client so the next retry really reconnects.
        client.disconnectUser().catch(() => {});

        if (!cancelled) {
          setError(e?.message || "Unable to connect to chat");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, userId, name, image, attempt, tokenProvider]);

  // Disconnect on logout or when the user changes.
  useEffect(() => {
    return () => {
      client.disconnectUser().catch(() => {});
    };
  }, [client, userId]);

  // Retry automatically when the network comes back.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && statusRef.current === "error") retry();
    });
    return unsubscribe;
  }, [retry]);

  const value = useMemo(
    () => ({ status, error, retry }),
    [status, error, retry],
  );

  return (
    <ChatStatusContext.Provider value={value}>
      <OverlayProvider value={{ style: streamTheme }}>
        <Chat client={client} style={streamTheme}>
          {children}
        </Chat>
      </OverlayProvider>
    </ChatStatusContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Wrapper used in the root layout                                     */
/* ------------------------------------------------------------------ */
const ChatWrapper = ({ children }) => {
  const user = useSelector((state) => state.auth?.user);

  // Not logged in / not verified / missing config: just render the app.
  if (!user || !user.isVerified) return children;
  if (!STREAM_API_KEY || !API_URL) return children;

  return <ChatClient user={user}>{children}</ChatClient>;
};

export default ChatWrapper;