// src/store/settingsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AppLanguage = "en" | "he" | "es" | "ar" | "ru";

interface SettingsState {
  language: AppLanguage;
}

const initialState: SettingsState = {
  language: "en",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<AppLanguage>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
