import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AsyncThunkResponseType } from "../../types/GlobalTypes";
import { InitialState } from "../../types/ComponentTypes";




const initialState: InitialState = {
  components: [],
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
};

// --- Thunks ---
export const get_components = createAsyncThunk( "component/getComponents", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("components");
      return { ...response.data, componentType };
    } catch (error: any) {
      return rejectWithValue({
        msg: error?.response?.data?.message || "Unknown error",
        componentType,
      });
    }
  }
);

export const create_component = createAsyncThunk(
  "component/createComponent",
  async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("components", value);
      return { ...response.data, componentType };
    } catch (error: any) {
      return rejectWithValue({
        msg: error?.response?.data?.message || "Unknown error",
        componentType,
      });
    }
  }
);

export const update_component = createAsyncThunk(
  "component/updateComponent",
  async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    console.log(value)
    try {
      const response = await axiosInstance.put(`components/${value.id}`, value);
      return { ...response.data, componentType };
    } catch (error: any) {
      return rejectWithValue({
        msg: error?.response?.data?.message || "Unknown error",
        componentType,
      });
    }
  }
);

export const delete_component = createAsyncThunk(
  "component/deleteComponent",
  async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`components/${value}`);
      return { ...response.data, componentType };
    } catch (error: any) {
      return rejectWithValue({
        msg: error?.response?.data?.message || "Unknown error",
        componentType,
      });
    }
  }
);

// --- Slice ---
const componentSlice = createSlice({
  name: "component",
  initialState,
  reducers: {
    resetComponentType: (state, action: PayloadAction<string>) => {
      state.componentType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_components.fulfilled, (state, action) => {
      state.components = action.payload.data || [];
      state.isLoading = false;
      state.msg = action.payload.msg || "";
      state.error = null;
      state.componentType = action.payload.componentType || "";
    });

    builder.addCase(create_component.fulfilled, (state, action) => {
      state.components = [...state.components, action.payload.data];
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_component.fulfilled, (state, action) => {
      const updated = action.payload.data;
      const index = state.components.findIndex((c) => c.id === updated.id);
      if (index !== -1) state.components[index] = updated;
      state.isLoading = false;
      state.msg = action.payload.msg || "Component updated successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(delete_component.fulfilled, (state, action) => {
      const deletedId = action.payload.data;
      state.components = state.components.filter((c) => c.id !== Number(deletedId));
      state.isLoading = false;
      state.msg = action.payload.msg || "Component deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addMatcher(
      isAnyOf(
        get_components.pending,
        create_component.pending,
        update_component.pending,
        delete_component.pending
      ),
      (state) => {
        state.isLoading = true;
        state.resStatus = "pending";
        state.componentType = "";
      }
    );

    builder.addMatcher(
      isAnyOf(
        get_components.rejected,
        create_component.rejected,
        update_component.rejected,
        delete_component.rejected
      ),
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.resStatus = "rejected";
        state.error = action.payload || "Something went wrong";
        state.componentType = action.payload?.componentType || "";
      }
    );
  },
});

export const { resetComponentType } = componentSlice.actions;
export default componentSlice.reducer;

// --- Selectors ---
export const selectComponents = (state: RootState) => state.components.components;
export const selectComponentById = (state: RootState, id: number) =>
  state.components.components.find((c) => c.id === id);
