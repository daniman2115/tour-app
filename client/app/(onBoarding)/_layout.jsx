import { Redirect, Stack } from "expo-router";
import { useAppInit } from "../../contexts/AppInitContext";





export default function RootLayout() {
      


  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onBoardingSecond" />
    </Stack>
  );
}
