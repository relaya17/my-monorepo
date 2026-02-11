// LanguageSwitcher.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLanguage } from "../redux/slice/settingsSlice";
import { useTranslation } from "../i18n/useTranslation";

const LanguageSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);
  const { t } = useTranslation();

  const changeLanguage = (lang: "en" | "he" | "es" | "ar" | "ru") => {
    dispatch(setLanguage(lang));
  };

  const btn = (lang: "en" | "he" | "es" | "ar" | "ru", label: string) => (
    <button
      key={lang}
      type="button"
      className={`btn btn-sm me-1 ${language === lang ? "btn-primary" : "btn-outline-secondary"}`}
      onClick={() => changeLanguage(lang)}
    >
      {label}
    </button>
  );

  return (
    <div>
      <span className="me-2">{t('lang_label')}:</span>
      {btn("en", "English")}
      {btn("he", "עברית")}
      {btn("ar", "العربية")}
      {btn("ru", "Русский")}
      {btn("es", "Español")}
    </div>
  );
};

export default LanguageSwitcher;
