import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { InitialState } from "../../types/PermissionTypes";
import { AsyncThunkResponseType } from "../../types/GlobalTypes";



const initialState: InitialState = {
  permissions: [],
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
};

// Thunks
export const get_permissions = createAsyncThunk("permission/getPermissions", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/permissions");
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const create_permission = createAsyncThunk("permission/createPermission", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/permissions", value);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const update_permission = createAsyncThunk("permission/updatePermission", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/permissions/${value.id}`, value);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const delete_permission = createAsyncThunk("permission/deletePermission", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/permissions/${value}`);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

// Slice
const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    resetPermissionComponentType: (state, action) => {
      state.componentType = action.payload;
    },
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_permissions.fulfilled, (state, action) => {
      state.permissions = action.payload.data || [];
      state.isLoading = false;
      state.msg = action.payload.msg || "";
      state.error = null;
      state.componentType = action.payload.componentType || "";
    });

    builder.addCase(create_permission.fulfilled, (state, action) => {
      state.permissions.push(action.payload.data);
      state.isLoading = false;
      state.msg = action.payload.msg || "Permission created successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_permission.fulfilled, (state, action) => {
      const updated = action.payload.data;
      const index = state.permissions.findIndex((p) => p.id === updated.id);
      if (index !== -1) state.permissions[index] = updated;
      state.isLoading = false;
      state.msg = action.payload.msg || "Permission updated successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(delete_permission.fulfilled, (state, action) => {
      const deletedId = action.payload.data;
      state.permissions = state.permissions.filter((p) => p.id !== deletedId);
      state.isLoading = false;
      state.msg = action.payload.msg || "Permission deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addMatcher(
      isAnyOf(get_permissions.pending, create_permission.pending, update_permission.pending, delete_permission.pending),
      (state) => {
        state.resStatus = "pending";
        state.isLoading = true;
        state.componentType = "";
      }
    );

    builder.addMatcher(
      isAnyOf(get_permissions.rejected, create_permission.rejected, update_permission.rejected, delete_permission.rejected),
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.resStatus = "rejected";
        state.msg = "";
        state.error = action.payload || "Something went wrong";
        state.componentType = action.payload?.componentType || "";
      }
    );
  },
});

export const { resetPermissionComponentType, updatePermissions } = permissionSlice.actions;
export default permissionSlice.reducer;

export const selectPermissions = (state: RootState) => state.permissions.permissions;
export const selectPermissionById = (state: RootState, id: number) => state.permissions.permissions.find((p) => p.id === id);
