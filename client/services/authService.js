import axios from "axios";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";

const APP_URL = process.env.EXPO_PUBLIC_API_URL;

const registerUser = async (user) => {
  try {
    const response = await axios.post(`${APP_URL}/register`, {
      email: user.email,
      name: user.name,
      location: user.location,
      gender: user.gender,
      password: user.password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

const loginUser = async (user) => {
  try {
    if (user.isGoogleLogin) {
      const response = await axios.post(`${APP_URL}/google-login`, {
        email: user.email,
        name: user.name,
        googleId: user.id,
      });

      return response.data;
    } else {
      const response = await axios.post(`${APP_URL}/login`, {
        email: user.email,
        password: user.password,
      });

      return response.data;
    }
  } catch (error) {
    throw error;
  }
};
const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post(`${APP_URL}/send-code`, {
      email,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
const verifyResetCode = async (data) => {
  try {
    const response = await axios.post(`${APP_URL}/verify-reset-code`, {
      email: data.email,
      code: data.code,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (data) => {
  try {
    const response = await axios.put(`${APP_URL}/reset-password`, {
      email: data.email,
      code: data.code,
      password: data.password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

const logoutUser = async () => {
  // First, complete Google sign-out.
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Google sign-out failed:", error);
    throw error;
  }

  // Only clear the app session after Google sign-out succeeds.
  await SecureStore.deleteItemAsync("user");
  // await SecureStore.deleteItemAsync("onboardingCompleted");
  // await SecureStore.deleteItemAsync("role");
  // await SecureStore.deleteItemAsync("getStartedCompleted");
};

const verifyEmail = async (data) => {
  try {
    const response = await axios.post(`${APP_URL}/verify-code`, {
      email: data.email,
      code: data.code,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};


const editProfile = async (data, token) => {
  try {
 console.log("Is FormData:", data instanceof FormData);
    console.log("FormData parts:", data._parts);    const response = await axios.put(`${APP_URL}/edit-profile`, 
      data,
      {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

const authService = {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  sendVerificationCode,
  verifyResetCode,
  resetPassword,
  editProfile
};

export default authService;
