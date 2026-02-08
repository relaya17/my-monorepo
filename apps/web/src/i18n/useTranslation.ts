import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { setLanguage } from '../redux/slice/settingsSlice';
import { translations, RTL_LANGS, type LangCode } from './translations';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

const STORAGE_KEY = 'app_lang';

function getStoredLang(): LangCode | null {
  const v = safeGetItem(STORAGE_KEY);
  if (v && (v === 'he' || v === 'en' || v === 'ar' || v === 'ru' || v === 'es')) return v as LangCode;
  return null;
}

export function useTranslation() {
  const dispatch = useDispatch();
  const lang = useSelector((state: RootState) => state.settings.language) as LangCode;
  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

  const t = useCallback(
    (key: string): string => {
      const map = translations[lang];
      if (map && key in map) return map[key];
      const fallback = translations.he[key] ?? translations.en[key] ?? key;
      return fallback;
    },
    [lang]
  );

  const setLang = useCallback(
    (newLang: LangCode) => {
      dispatch(setLanguage(newLang));
      safeSetItem(STORAGE_KEY, newLang);
    },
    [dispatch]
  );

  return { t, lang, dir, setLang };
}

/** Call once on app init to sync Redux from storage */
export function initStoredLanguage(dispatch: AppDispatch) {
  const stored = getStoredLang();
  if (stored) dispatch(setLanguage(stored));
}
