import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import { InitialState } from "../../types/UserTypes";
import { RootState } from "../store";
import { AsyncThunkResponseType } from "../../types/GlobalTypes";

let initialState: InitialState = {
  users: [],
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
};

// Create user thunk
export const create_user = createAsyncThunk(
  "user/createUser",
  async (
    { axiosInstance, value, componentType }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("createUser", value);

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
  }
);

export const get_user = createAsyncThunk(
  "user/getUser",
  async (
    { componentType, axiosInstance }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("getUser");
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
  }
);

// Delete user thunk
export const delete_user = createAsyncThunk(
  "user/deleteUser",
  async (
    { axiosInstance, value, componentType }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const id = value;
      const response = await axiosInstance.delete(`deleteUser/${id}`);
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
      return rejectWithValue({ msg: "Unknown error", componentType });
    }
  }
);

// update user thunk
export const update_user = createAsyncThunk(
  "user/updateUser",
  async (
    { axiosInstance, value, id, componentType }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`updateUser/${id}`, value);

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
  }
);

// update user thunk
export const update_user_order = createAsyncThunk(
  "user/updateUserOrder",
  async (
    { axiosInstance, value, id, componentType }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(`updateUserOrder/${id}`, value);

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
  }
);

// update user thunk
export const update_profile_image = createAsyncThunk(
  "user/updateProfileImage",
  async (
    { axiosInstance, value, componentType }: AsyncThunkResponseType,
    { rejectWithValue }
  ) => {
    try {
      const id = value.userId;

      const response = await axiosInstance.put(
        `updateUser/${id}/profile`,
        value.formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
      return rejectWithValue({ msg: "Unknown error", componentType });
    }
  }
);

const userData = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserComponentType: (state, action) => {
      state.componentType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_user.fulfilled, (state, action) => {
      state.users = action.payload.data || [];
      state.isLoading = false;
      state.msg = action.payload.msg || "";
      state.error = null;
      state.componentType = action.payload.componentType || "";
    });

    builder.addCase(create_user.fulfilled, (state, action) => {
      state.users = [...state.users, action.payload.data];
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(delete_user.fulfilled, (state, action) => {
      const deletedUserId = action.payload.data;
      state.users = state.users.filter(
        (user) => user.id !== Number(deletedUserId)
      );
      state.isLoading = false;
      state.msg = action.payload.msg || "User deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_user.fulfilled, (state, action) => {
      const updatedUserId = action.payload.data.id;
      const updatedUser = action.payload.data;
      const updatedUserIndex = state.users.findIndex(
        (user) => user.id === updatedUserId
      );
      if (updatedUserIndex !== -1) {
        state.users[updatedUserIndex] = updatedUser;
      }
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });


    builder.addCase(update_user_order.fulfilled, (state, action) => {
      const updatedUsers = action.payload.updatedUsers;
      updatedUsers.forEach((updatedUser: any) => {
        const idx = state.users.findIndex((u) => u.id === updatedUser.id);
        if (idx !== -1) {
          state.users[idx] = updatedUser; // replace
        }
      });

      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_profile_image.fulfilled, (state, action) => {
      const updatedUserId = action.payload.data.id;
      const updatedUser = action.payload.data;
      const updatedUserIndex = state.users.findIndex(
        (user) => user.id === updatedUserId
      );
      if (updatedUserIndex !== -1) {
        state.users[updatedUserIndex] = updatedUser;
      }
      state.isLoading = false;
      state.msg = action.payload.msg || "User deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addMatcher(
      isAnyOf(
        get_user.pending,
        create_user.pending,
        delete_user.pending,
        update_profile_image.pending,
        update_user.pending,
        update_user_order.pending
      ),
      (state) => {
        state.resStatus = "pending";
        state.isLoading = true;
        state.componentType = "";
      }
    );

    builder.addMatcher(
      isAnyOf(
        get_user.rejected,
        create_user.rejected,
        delete_user.rejected,
        update_profile_image.rejected,
        update_user.rejected,
        update_user_order.rejected
      ),
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.resStatus = "rejected";
        state.msg = "";
        state.error = action.payload || "Something went wrong";
        // Safely set componentType if available
        state.componentType = action.payload?.componentType || "";
      }
    );
  },
});

export const { resetUserComponentType } = userData.actions;
export default userData.reducer;

export const selectUsers = (state: RootState) => state.users.users;
export const selectUsersState = (state: RootState) => state.users;
export const selectUserById = (state: RootState, userId: number) =>
  state.users.users.find((user) => user.id === userId);
