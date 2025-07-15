import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-bg">
      <div className="home-content">
        <h1 className="text-center p-4 rounded-lg mb-4 home-title">
          ברוכים הבאים למתחם מצפה נוף
        </h1>
        <div className="d-flex justify-content-center gap-3 mb-4" style={{ position: 'relative', zIndex: 10 }}>
          <Link
            to={ROUTES.FOR_RENT}
            className="btn btn-lg home-btn"
          >
            <i className="fas fa-key me-2"></i>
            דירות להשכרה
          </Link>
          <Link
            to={ROUTES.FOR_SALE}
            className="btn btn-lg home-btn"
          >
            <i className="fas fa-home me-2"></i>
            דירות למכירה
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
