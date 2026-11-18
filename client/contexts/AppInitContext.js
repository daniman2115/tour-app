
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getItem = (key) =>
  Platform.OS === "web"
    ? Promise.resolve(localStorage.getItem(key))
    : SecureStore.getItemAsync(key);

const AppInitContext = createContext(null);

export const AppInitProvider = ({ children }) => {
  const [ready, setReady] = useState(false);

  const [values, setValues] = useState({
    onboardingCompleted: false,
    role: null,
    getStartedCompleted: false,
  });

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const [
          onboardingCompleted,
          role,
          getStartedCompleted,
        ] = await Promise.all([
          getItem("onboardingCompleted"),
          getItem("role"),
          getItem("getStartedCompleted"),
        ]);

        if (!mounted) return;

        setValues({
          onboardingCompleted: onboardingCompleted === "true",
          role: role || null,
          getStartedCompleted: getStartedCompleted === "true",
        });
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        if (mounted) setReady(true);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppInitContext.Provider
      value={{ ...values, ready, setValues }}
    >
      {children}
    </AppInitContext.Provider>
  );
};

export const useAppInit = () => {
  const context = useContext(AppInitContext);

  if (!context) {
    throw new Error(
      "useAppInit must be used within AppInitProvider"
    );
  }

  return context;
};
