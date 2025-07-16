import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../routs/routes';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-wrapper">
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">ברוכים הבאים למתחם מצפה נוף</h1>
          <div className="button-group">
            <Link to={ROUTES.FOR_RENT} className="btn btn-lg home-btn">
              <i className="fas fa-key me-2"></i>
              דירות להשכרה
            </Link>
            <Link to={ROUTES.FOR_SALE} className="btn btn-lg home-btn">
              <i className="fas fa-home me-2"></i>
              דירות למכירה
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
