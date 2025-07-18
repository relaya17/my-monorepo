import Navbar from './components/Navbar';
import AppRoutes from './routs/AppRoutes';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';

const App: React.FC = () => {

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
