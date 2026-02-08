// LanguageSwitcher.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLanguage } from "../redux/slice/settingsSlice";

const LanguageSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);

  const changeLanguage = (lang: "en" | "he" | "es" | "ar" | "ru") => {
    dispatch(setLanguage(lang));
  };

  return (
    <div>
      <span className="me-2">Language:</span>
      <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => changeLanguage("en")}>English</button>
      <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => changeLanguage("he")}>עברית</button>
      <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => changeLanguage("ar")}>العربية</button>
      <button type="button" className="btn btn-sm btn-outline-secondary me-1" onClick={() => changeLanguage("ru")}>Русский</button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeLanguage("es")}>Español</button>
    </div>
  );
};

export default LanguageSwitcher;
