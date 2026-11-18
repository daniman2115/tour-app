import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const segments = useSegments();

  useEffect(() => {
    if (user && !user.isVerified && !segments.includes("confirmSignUp")) {
      router.replace({
        pathname: "/confirmSignUp",
        params: { email: user.email },
      });
    }
  }, [user, segments]);



   
  return (
    <Stack screenOptions={{ headerShown: false }}>
     <Stack.Screen name="Email"/>
     <Stack.Screen name="Password"/>
     <Stack.Screen name="Name"/>
     <Stack.Screen name="Location"/>
     <Stack.Screen name="Gender"/>
     <Stack.Screen name="confirmSignUp"/>
    </Stack>
  )
}

export default Layout