import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./user-slice";

// Global state:
export const store = configureStore({
    reducer: {
        user: userReducer
    }
});

export type AppState = ReturnType<typeof store.getState>;
