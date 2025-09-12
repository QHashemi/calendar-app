import { createSlice, createAsyncThunk, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { InitialState } from "../../types/EventTypes";
import { RootState } from "../store";
import { AsyncThunkResponseType } from "../../types/GlobalTypes";

let initialState: InitialState = {
  events: [],
  resStatus: "",
  componentType: "",
  isLoading: false,
  msg: "",
  error: null,
};

// Get events thunk
export const get_event = createAsyncThunk("event/getEvent", async ({ axiosInstance, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {

  try {
    const response = await axiosInstance.get("events");
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


// Create event thunk
export const create_event = createAsyncThunk(
  "event/createEvent",
  async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("events", value);

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


// Delete event thunk
export const delete_event = createAsyncThunk( "event/deleteEvent", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const id = value;
      const response = await axiosInstance.delete(`events/${id}`);

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


// Update event thunk
export const update_event = createAsyncThunk( "event/updateEvent", async ({ axiosInstance, value, componentType }: AsyncThunkResponseType, { rejectWithValue }) => {
    try {
      const id = value.id;
      const response = await axiosInstance.put(`events/${id}`, value);
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



const eventData = createSlice({
  name: "event",
  initialState,
  reducers: {
    resetEventComponentType: (state, action) => {
      state.componentType = action.payload;
    },
    updateEvent: (state, action) => {
      state.events = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(get_event.fulfilled, (state, action) => {
      state.events = action.payload.data || [];
      state.isLoading = false;
      state.msg = action.payload.msg || "";
      state.error = null;
      state.componentType = action.payload.componentType || "";
    });

    builder.addCase(create_event.fulfilled, (state, action) => {
      state.events = [...state.events, action.payload.data];
      state.isLoading = false;
      state.msg = action.payload.msg;
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(delete_event.fulfilled, (state, action) => {
      const deletedEventId = action.payload.data;
      console.log(deletedEventId);
      state.events = state.events.filter((event) => event.id !== Number(deletedEventId));
      state.isLoading = false;
      state.msg = action.payload.msg || "Event deleted successfully";
      state.error = null;
      state.componentType = action.payload.componentType;
    });

    builder.addCase(update_event.fulfilled, (state, action) => {
      const updatedEvent = action.payload.data;
      const updatedEventId = updatedEvent.id;

      // Find the index of the event to update
      const updatedEventIndex = state.events.findIndex((event) => event.id === updatedEventId);

      if (updatedEventIndex !== -1) {
        state.events[updatedEventIndex] = updatedEvent;
      }

      state.isLoading = false;
      state.msg = action.payload.msg || "Event updated successfully"; // fixed message
      state.error = null;

      // Optional: update component type if your payload has it
      if (action.payload.componentType) {
        state.componentType = action.payload.componentType;
      }
    });

    builder.addMatcher(isAnyOf(get_event.pending, create_event.pending, delete_event.pending, update_event.pending), (state) => {
      state.resStatus = "pending";
      state.isLoading = true;
      state.componentType = "";
    });

    builder.addMatcher(isAnyOf(get_event.rejected, create_event.rejected, delete_event.rejected, update_event.rejected), (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.resStatus = "rejected";
      state.msg = "";
      state.error = action.payload || "Something went wrong";
      // Safely set componentType if available
      state.componentType = action.payload?.componentType || "";
    });
  },
});

export const { resetEventComponentType, updateEvent } = eventData.actions;
export default eventData.reducer;

export const selectEvents = (state: RootState) => state.events.events;

export const selectEventById = (state: RootState, eventId: number) => state.events.events.find((event) => event.id === eventId);

export const selectEventByEventId = (state: RootState, eventId: number) => state.events.events.find((event)=> event.id === Number(eventId))
