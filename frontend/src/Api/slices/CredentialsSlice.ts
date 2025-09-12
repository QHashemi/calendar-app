import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { InitialState } from "../../types/UserCredential";
import { RootState } from "../store";
import { AsyncThunkPublicResponseType, AsyncThunkResponseType } from "../../types/GlobalTypes";
import { axiosPublic } from "../api";

let initialState: InitialState = {
  user: {
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    color: "",
    roles: [],
    gender: "",
    title: "",
    job: "",
    created_at: "",
    updated_at: "",
    display_name: "",
    mobile_phone: "",
    phone: "",
    website: "",
    description: "",
    image: "",
    extra_permissions: [],
    has_personal_calendar: false,
    sort_order: 0,
  },
  isLoggedIn: false,
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
  accessToken: "",
  persist: false,

};

// Create user thunk
export const register_user = createAsyncThunk("credentials/registerUser", async ({ value, componentType }: AsyncThunkPublicResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosPublic.post("register", value);

    return { ...response.data, componentType };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue({
        ...error.response.data,
        componentType,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    return rejectWithValue({
      msg: "Unknown error",
      componentType,
    });
  }
});

export const register_new_user = createAsyncThunk("credentials/registerNewUser", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("registerNewUser", value);

    return { ...response.data, componentType };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue({
        ...error.response.data,
        componentType,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    return rejectWithValue({
      msg: "Unknown error",
      componentType,
    });
  }
});

export const login_user = createAsyncThunk("credentials/loginUser", async ({ value, componentType }: AsyncThunkPublicResponseType, { rejectWithValue }) => {
  try {

    const response = await axiosPublic.post("login", value);

    return { ...response.data, componentType };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue({
        ...error.response.data,
        componentType,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    return rejectWithValue({
      msg: "Unknown error",
      componentType,
    });
  }
});

export const refresh_token = createAsyncThunk("credentials/refreshToken", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("refreshToken");
    return {
      data: response.data.data,
      accessToken: response.data.accessToken as string,
      isLoggedIn: response.data.isLoggedIn,
      msg: response.data.msg,
      componentType,
    };
  } catch (error: any) {
    return rejectWithValue({
      ...error.response.data,
      componentType,
      status: error.response.status,
      statusText: error.response.statusText,
    });
  }
});

export const refresh_account = createAsyncThunk("credentials/refreshAccount", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("refreshAccount");
    response.data["componentType"] = componentType;
    return response.data;
  } catch (error: any) {
    return rejectWithValue({
      ...error.response.data,
      componentType,
      status: error.response.status,
      statusText: error.response.statusText,
    });
  }
});

export const logout_user = createAsyncThunk("credentials/logoutUser", async ({  componentType }: AsyncThunkPublicResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosPublic.get("logout");

    return { ...response.data, componentType };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue({
        ...error.response.data,
        componentType,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    return rejectWithValue({
      msg: "Unknown error",
      componentType,
    });
  }
});

export const update_password = createAsyncThunk("credentials/updatePassword", async ({ axiosInstance, value, id, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`updatePassword/${id}`, value);

    return { ...response.data, componentType };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue({
        ...error.response.data,
        componentType,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }
    return rejectWithValue({
      msg: "Unknown error",
      componentType,
    });
  }
});

const credentialData = createSlice({
  name: "credentials",
  initialState,
  reducers: {
    resetCredentialComponentType: (state, action) => {
      state.componentType = action.payload;
    },
    restoreCredentials: (state, action) => {
      const { user, accessToken, isLoggedIn } = action.payload;
      if (user) state.user = user;
      if (accessToken) state.accessToken = accessToken;
      state.isLoggedIn = !!isLoggedIn;
    },
    setPersist: (state, action) => {
      state.persist = action.payload;
      localStorage.setItem("persist", JSON.stringify(action.payload));
    },
    logout_local: (state) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.accessToken = "";
      state.msg = "";
      state.error = null;
      state.componentType = "logout_local";
    },
  },

  extraReducers: (builder) => {
    builder.addCase(register_user.fulfilled, (state, action) => {
      const userData = action.payload.data;
      state.user = userData;
      state.isLoading = false;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(register_new_user.fulfilled, (state, action) => {
      const userData = action.payload.data;
      state.user = userData;
      state.isLoading = false;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(login_user.fulfilled, (state, action) => {
      state.user = action.payload.data;
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_password.fulfilled, (state, action) => {
      // state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(refresh_token.fulfilled, (state, action) => {
      state.user = action.payload.data;
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(refresh_account.fulfilled, (state, action) => {
      state.user = action.payload.data;
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(logout_user.fulfilled, (state, action) => {
      state.isLoggedIn = false;
      state.user = initialState.user;
      state.accessToken = "";
      state.msg = "";
      state.error = null;
      state.componentType = action.payload.componentType;
    });
    builder.addMatcher(
      isAnyOf(register_user.pending, login_user.pending, refresh_token.pending, logout_user.pending, refresh_account.pending, update_password.pending, register_new_user.pending),
      (state) => {
        state.resStatus = "pending";
        state.isLoading = true;
        state.componentType = "";
      }
    );

    builder.addMatcher(
      isAnyOf(register_user.rejected, login_user.rejected, refresh_token.rejected, logout_user.rejected, refresh_account.rejected, update_password.rejected, register_new_user.rejected),
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.resStatus = "rejected";
        state.isLoggedIn = false;
        state.msg = action.payload?.msg || "Something went wrong";
        state.error = action.payload || "Something went wrong";
        state.componentType = action.payload?.componentType || "";
      }
    );
  },
});

export const { resetCredentialComponentType, restoreCredentials, setPersist, logout_local } = credentialData.actions;
export default credentialData.reducer;

export const selectCredentialState = (state: RootState) => state.credential;
