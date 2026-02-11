import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AppRoutes from './routs/AppRoutes';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { initStoredLanguage } from './i18n/useTranslation';
import { RTL_LANGS } from './i18n/translations';
import type { AppDispatch, RootState } from './redux/store';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const language = useSelector((state: RootState) => state.settings.language);
  useEffect(() => {
    initStoredLanguage(dispatch);
  }, [dispatch]);
  useEffect(() => {
    const dir = RTL_LANGS.includes(language as 'he' | 'ar') ? 'rtl' : 'ltr';
    const lang = language === 'he' ? 'he' : language === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [language]);

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <main>
          <AppRoutes />
        </main>
        <Footer />
        <AccessibilityPanel />
      </div>
    </ErrorBoundary>
  );
};

export default App;
