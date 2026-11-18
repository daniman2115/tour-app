
import { Stack, useRouter, useSegments } from "expo-router";
import "../globals.css";

import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../stores/store";
import { RootSiblingParent } from "react-native-root-siblings";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { AppInitProvider, useAppInit } from "../contexts/AppInitContext";


import { hydrateUser } from "../stores/authSlice";
import AppProvider from "../contexts/AppProvider";
import VideoProvider from "../components/VideoProvider";
import ChatWrapper from "../components/ChatWrapper";
import {
  GoogleSignin,

} from "@react-native-google-signin/google-signin";



function RootLayoutNav() {
    console.warn("ROOT LAYOUT TEST - JavaScript is running");

  const dispatch = useDispatch();
  const router = useRouter();
  const segments = useSegments();

  const { user, isAuthReady } = useSelector(
    (state) => state.auth
  );

  console.log({usery:user});


  const isLoggedIn = Boolean(user);






  // Restore the saved user once when the app starts.
  useEffect(() => {
    dispatch(hydrateUser());
    }, [dispatch]);

   useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
      "37138011024-tghi34tip4lt5pgkmc7momhvu50rnegj.apps.googleusercontent.com",
    webClientId:
      "37138011024-7tilambraffga4tt1m8f7vhf97rr2hfn.apps.googleusercontent.com",
    });
  }, []);





 useEffect(() => {
  if (!isAuthReady) return;

  const firstSegment = segments[0];
  const onConfirmSignUp =
    firstSegment === "(signup)" && segments.includes("confirmSignUp");
  const onPasswordReset =
    firstSegment === "forgotPassword" ||
    firstSegment === "enterCode" ||
    firstSegment === "confirmReset" ||
    firstSegment === "setNewPassword" ||
    firstSegment === "resetSuccess";

  const isAuthScreen =
    firstSegment === "Login" ||
    firstSegment === "(onBoarding)" ||
    firstSegment === "(signup)" ||
    firstSegment === "forgotPassword" ||
    firstSegment === "enterCode" ||
    firstSegment === "confirmReset" ||
    firstSegment === "setNewPassword" ||
    firstSegment === "resetSuccess" ||
    firstSegment === "accountCreation";

  const isProtectedRoute =
    firstSegment === "(tabs)" ||
    firstSegment === "channel" ||
    firstSegment === "call" ||
    firstSegment === "Notification" ||
    firstSegment === "myBookings" ||
    firstSegment === "callLogs" ||
    firstSegment === "scheduleCall" ||
    firstSegment === "tourGuideList" ||
    firstSegment === "getStarted" ||
    firstSegment === "Rating" ||
    firstSegment === "paymentSuccess";

  // Unverified accounts stay on confirmSignUp. Sending them to Email
  // while Location/signup layout send them to confirmSignUp loops forever.
  if (user && !user?.isVerified) {
    if (!onConfirmSignUp && !onPasswordReset) {
      router.replace({
        pathname: "/(signup)/confirmSignUp",
        params: { email: user.email },
      });
    }
    return;
  }

  if (!isLoggedIn && isProtectedRoute) {
    router.replace("/Login");
    return;
  }

  if (isLoggedIn && user?.isVerified && isAuthScreen) {
    router.replace("/(tabs)/Home");
  }
}, [isAuthReady, isLoggedIn, user, segments, router]);


  if (!isAuthReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10b981"/>
      </View>
    );
  }

  return (
    <RootSiblingParent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ChatWrapper>
          <VideoProvider>
            <AppProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(onBoarding)" />
                <Stack.Screen name="(signup)" />
                <Stack.Screen name="Login/index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="setNewPassword/index" />
                <Stack.Screen name="resetSuccess/index" />
                <Stack.Screen name="forgotPassword/index" />
                <Stack.Screen name="enterCode/index" />
                <Stack.Screen name="confirmReset/index" />
                <Stack.Screen name="getStarted/index" />
                <Stack.Screen name="tourGuideList/index" />
                <Stack.Screen name="scheduleCall/index" />
                <Stack.Screen name="myBookings/index" />
                <Stack.Screen name="callLogs/index" />
                <Stack.Screen name="accountCreation/index" />
                <Stack.Screen name="Notification/index" />
                <Stack.Screen name="paymentSuccess/index" />
                <Stack.Screen name="Rating/index" />
                <Stack.Screen name="channel/[cid]/index" options={{ headerShown: false }} />
                <Stack.Screen name="channel/[cid]/thread/[cid]/index" />
                <Stack.Screen name="call/[callId]/index" />
              </Stack>
            </AppProvider>
          </VideoProvider>
        </ChatWrapper>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppInitProvider>
        <RootLayoutNav />
      </AppInitProvider>
    </Provider>
  );
};