import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/User';
import eventsReducer from "./slices/EventSlice";
import credentialsReducer from "./slices/CredentialsSlice";
import permissionReducer from "./slices/PermissionSlice"
import rolesReducer from "./slices/RoleSlice"
import componentsReducer from "./slices/ComponentsSlice"
export const store = configureStore({
  reducer: {
    users: usersReducer,
    events: eventsReducer,
    credential: credentialsReducer,
    permissions: permissionReducer,
    roles:rolesReducer,
    components:componentsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

