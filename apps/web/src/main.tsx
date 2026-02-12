import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import App from './App';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BuildingProvider } from './context/BuildingContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;text-align:center;font-family:sans-serif;">אין אלמנט root. בדוק את index.html.</div>';
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <BuildingProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <App />
              </Router>
            </BuildingProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}

// reportWebVitals removed - not needed for this project

