import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import AppRoutes from './routs/AppRoutes';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';
import { initStoredLanguage } from './i18n/useTranslation';
import type { AppDispatch } from './redux/store';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    initStoredLanguage(dispatch);
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
      <AccessibilityPanel />
    </div>
  );
};

export default App;
