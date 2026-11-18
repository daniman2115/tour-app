import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";
import * as SecureStore from "expo-secure-store";

const initialState = {
  user: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  isAuthReady: false,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (user, thunkApi) => {
    try {
      const data = await authService.registerUser(user);
      await SecureStore.setItemAsync("user", JSON.stringify(data));
      return data;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (user, thunkApi) => {
    try {
      const response = await authService.loginUser(user);

      await SecureStore.setItemAsync("user", JSON.stringify(response));
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);

export const sendVerificationCode = createAsyncThunk(
  "auth/sendcode",
  async (email, thunkApi) => {
    try {
      const response = await authService.sendVerificationCode(email);
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);
export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async (data, thunkApi) => {
    try {
      const response = await authService.verifyResetCode(data);
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkApi) => {
    try {
      await authService.logoutUser();
      return null;
    } catch (error) {
      const message = error.message || "Failed to logout";
      return thunkApi.rejectWithValue(message);
    }
  },
);

export const verifyEmail = createAsyncThunk(
  "auth/verify",
  async (data, thunkApi) => {
    try {
      const response = await authService.verifyEmail(data);

      const userString = await SecureStore.getItemAsync("user");

      if (userString) {
        const user = JSON.parse(userString);

        await SecureStore.setItemAsync(
          "user",
          JSON.stringify({ ...user, isVerified: true }),
        );
      }

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, thunkApi) => {
    try {
      const response = await authService.resetPassword(data);
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  },
);

export const hydrateUser = createAsyncThunk(
  "auth/hydrateUser",
  async (_, thunkApi) => {
    try {
      const userString = await SecureStore.getItemAsync("user");

      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.message || "Failed to restore user",
      );
    }
  },
);



export const editProfile = createAsyncThunk(
  "auth/editProfile",
  async (data, thunkApi) => {
    try {
      const storedUser = await SecureStore.getItemAsync("user");
      const storedUserData = storedUser ? JSON.parse(storedUser) : null;

      const token = storedUserData?.token;

      if (!token) {
        return thunkApi.rejectWithValue(
          "Not authorized: authentication token not found."
        );
      }

      const response = await authService.editProfile(data, token);
      console.log({response});

      const updatedUser = response?.user ?? response;

      // Preserve the token when the backend does not return one.
      const userToStore = {
        ...storedUserData,
        ...updatedUser,
        token,
      };

      await SecureStore.setItemAsync(
        "user",
        JSON.stringify(userToStore)
      );

      return userToStore;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        error.toString();

      return thunkApi.rejectWithValue(message);
    }
  }
);



export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.user = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })

      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.message = "";
        state.user = null;
        state.isError = false;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })

      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = {
          ...state.user,
          isVerified: true,
        };
      })

      .addCase(verifyEmail.rejected, (state, action) => {
        state.isSuccess = false;
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyResetCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })

      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isSuccess = false;
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.isSuccess = false;
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(hydrateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthReady = true;
      })

      .addCase(hydrateUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthReady = true;
        state.message = action.payload || "Failed to restore user";
      })

       .addCase(editProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
          state.message = "Profile updated successfully";

        
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
          state.message = action.payload || "Failed to update profile";

      })
  },
});

export default authSlice.reducer;
export const { reset } = authSlice.actions;
