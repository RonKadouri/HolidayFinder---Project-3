import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserModel } from "../models/user-model";

// The logged-in user (null when nobody is logged in):
const userSlice = createSlice({
    name: "user",
    initialState: null as UserModel | null,
    reducers: {
        initUser: (_state, action: PayloadAction<UserModel>) => action.payload,
        logoutUser: () => null
    }
});

export const { initUser, logoutUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
