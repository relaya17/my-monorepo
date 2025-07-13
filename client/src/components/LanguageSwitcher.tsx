// LanguageSwitcher.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLanguage } from "../redux/slice/settingsSlice";

const LanguageSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);

  const changeLanguage = (lang: "en" | "he" | "es" | "ar") => {
    dispatch(setLanguage(lang));
  };

  return (
    <div>
      <h1>השפה הנוכחית: {language}</h1>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("he")}>עברית</button>
      <button onClick={() => changeLanguage("es")}>Español</button>
      <button onClick={() => changeLanguage("ar")}>العربية</button>
    </div>
  );
};

export default LanguageSwitcher;
