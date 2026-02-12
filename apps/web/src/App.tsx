import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import AppRoutes from './routs/AppRoutes';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';
import CookieBanner from './components/CookieBanner';
import VOneWidget from './components/VOneWidget';
import ErrorBoundary from './components/ErrorBoundary';
import { AnalyticsProvider, useAnalyticsScripts } from './components/AnalyticsProvider';
import { initStoredLanguage } from './i18n/useTranslation';
import { RTL_LANGS } from './i18n/translations';
import type { AppDispatch, RootState } from './redux/store';

function AppContent() {
  useAnalyticsScripts();
  const dispatch = useDispatch<AppDispatch>();
  const language = useSelector((state: RootState) => state.settings.language);
  useEffect(() => {
    initStoredLanguage(dispatch);
  }, [dispatch]);
  useEffect(() => {
    const dir = RTL_LANGS.includes(language as 'he' | 'ar') ? 'rtl' : 'ltr';
    const lang = language === 'he' ? 'he' : language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : language === 'es' ? 'es' : 'en';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [language]);

  return (
    <div className="App">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
      <VOneWidget />
      <AccessibilityPanel />
      <CookieBanner />
    </div>
  );
}

const App: React.FC = () => (
  <ErrorBoundary>
    <AnalyticsProvider>
      <AppContent />
    </AnalyticsProvider>
  </ErrorBoundary>
);

export default App;
