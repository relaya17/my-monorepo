import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);

// reportWebVitals removed - not needed for this project

