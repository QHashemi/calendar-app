import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { InitialState } from "../../types/RoleTypes";
import { AsyncThunkResponseType } from "../../types/GlobalTypes";

const initialState: InitialState = {
  roles: [],
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
};

// Thunks
export const get_roles = createAsyncThunk("role/getRoles", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/roles");
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const create_role = createAsyncThunk("role/createRole", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/roles", value);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const update_role = createAsyncThunk("role/updateRole", async ({ axiosInstance, id, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/roles/${id}`, value);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

export const delete_role = createAsyncThunk("role/deleteRole", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/roles/${value}`);
    return { ...response.data, componentType };
  } catch (error: any) {
    return rejectWithValue({ ...(error.response?.data || { msg: "Unknown error" }), componentType });
  }
});

// Slice
const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    resetRoleComponentType: (state, action) => {
      state.componentType = action.payload;
    },
    updateRoles: (state, action) => {
      state.roles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_roles.fulfilled, (state, action) => {
      state.roles = action.payload.data || [];
      state.isLoading = false;
      state.msg = action.payload.msg || "";
      state.error = null;
      state.componentType = action.payload.componentType || "";
    });

    builder.addCase(create_role.fulfilled, (state, action) => {
      state.roles.push(action.payload.data);
      state.isLoading = false;
      state.msg = action.payload.msg || "Role created successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_role.fulfilled, (state, action) => {
      const updatedRole = action.payload.data;
      const index = state.roles.findIndex((r) => r.id === updatedRole.id);
      if (index !== -1) state.roles[index] = updatedRole;
      state.isLoading = false;
      state.msg = action.payload.msg || "Role updated successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(delete_role.fulfilled, (state, action) => {
      const deletedId = action.payload.data;
      state.roles = state.roles.filter((r) => r.id !== deletedId);
      state.isLoading = false;
      state.msg = action.payload.msg || "Role deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addMatcher(isAnyOf(get_roles.pending, create_role.pending, update_role.pending, delete_role.pending), (state) => {
      state.resStatus = "pending";
      state.isLoading = true;
      state.componentType = "";
    });

    builder.addMatcher(isAnyOf(get_roles.rejected, create_role.rejected, update_role.rejected, delete_role.rejected), (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.resStatus = "rejected";
      state.msg = "";
      state.error = action.payload || "Something went wrong";
      state.componentType = action.payload?.componentType || "";
    });
  },
});

export const { resetRoleComponentType, updateRoles } = roleSlice.actions;
export default roleSlice.reducer;

export const selectRoles = (state: RootState) => state.roles.roles;
export const selectRoleById = (state: RootState, id: number) => state.roles.roles.find((r) => r.id === id);
