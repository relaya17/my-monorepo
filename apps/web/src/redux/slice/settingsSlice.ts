// src/store/settingsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { setStoredCountry } from "../../i18n/locale";
import type { CountryCode } from "../../i18n/locale";

export type AppLanguage = "en" | "he" | "es" | "ar" | "ru" | "fr";

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

/** @deprecated Use setStoredCountry from i18n/locale or useLocale().setCountry instead */
export function setCountry(code: CountryCode): void {
  setStoredCountry(code);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("localechange"));
  }
}

export default settingsSlice.reducer;
