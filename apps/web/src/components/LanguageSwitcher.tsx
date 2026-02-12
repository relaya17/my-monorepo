// LanguageSwitcher.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLanguage } from "../redux/slice/settingsSlice";
import { useTranslation } from "../i18n/useTranslation";

type LangOption = "en" | "he" | "es" | "ar" | "ru" | "fr";

interface LanguageSwitcherProps {
  /** Compact EN/HE toggle for landing navbar */
  variant?: "default" | "landing";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "default" }) => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);
  const { t } = useTranslation();

  const changeLanguage = (lang: LangOption) => {
    dispatch(setLanguage(lang));
  };

  const btn = (lang: LangOption, label: string, ariaLabel: string) => (
    <button
      key={lang}
      type="button"
      className={`btn btn-sm me-1 ${language === lang ? "btn-primary" : "btn-outline-secondary"}`}
      onClick={() => changeLanguage(lang)}
      aria-label={ariaLabel}
      aria-pressed={language === lang}
      aria-current={language === lang ? "true" : undefined}
    >
      {label}
    </button>
  );

  if (variant === "landing") {
    return (
      <div
        className="language-switcher language-switcher--landing"
        role="group"
        aria-label="Switch language"
      >
        <button
          type="button"
          className={`lang-btn lang-btn--landing ${language === "en" ? "lang-btn--active" : ""}`}
          onClick={() => changeLanguage("en")}
          aria-label="Switch to English"
          aria-pressed={language === "en"}
        >
          EN
        </button>
        <span className="lang-sep" aria-hidden>|</span>
        <button
          type="button"
          className={`lang-btn lang-btn--landing ${language === "he" ? "lang-btn--active" : ""}`}
          onClick={() => changeLanguage("he")}
          aria-label="החלף לעברית"
          aria-pressed={language === "he"}
        >
          עברית
        </button>
      </div>
    );
  }

  return (
    <div className="language-switcher" role="group" aria-label="Switch language">
      <span className="me-2" id="lang-label">{t('lang_label')}:</span>
      {btn("en", "English", "Switch to English")}
      {btn("he", "עברית", "החלף לעברית")}
      {btn("ar", "العربية", "Switch to Arabic")}
      {btn("ru", "Русский", "Switch to Russian")}
      {btn("es", "Español", "Switch to Spanish")}
      {btn("fr", "Français", "Passer au français")}
    </div>
  );
};

export default LanguageSwitcher;
