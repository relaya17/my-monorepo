// src/store/settingsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  language: "en" | "he" | "es" | "ar";
}

const initialState: SettingsState = {
  language: "he", // שפת ברירת המחדל
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"en" | "he" | "es" | "ar">) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
